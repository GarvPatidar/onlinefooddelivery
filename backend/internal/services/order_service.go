package services

import (
	"bytes"
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/google/uuid"
	"onlinefooddelivery/backend/config"
	"onlinefooddelivery/backend/internal/dto"
	"onlinefooddelivery/backend/internal/models"
	"onlinefooddelivery/backend/internal/repositories"
)

type OrderService interface {
	Checkout(ctx context.Context, userID string, req *dto.CheckoutRequest) (*dto.CheckoutResponse, error)
	VerifyPayment(ctx context.Context, userID string, req *dto.VerifyPaymentRequest) (bool, error)
	GetMyOrders(ctx context.Context, userID string) ([]dto.OrderResponse, error)
	GetOwnerOrders(ctx context.Context, ownerID string) ([]dto.OrderResponse, error)
	UpdateOrderStatus(ctx context.Context, ownerID string, orderID string, req *dto.UpdateOrderStatusRequest) (*dto.OrderResponse, error)
}

type orderService struct {
	orderRepo      repositories.OrderRepository
	cartRepo       repositories.CartRepository
	addressRepo    repositories.AddressRepository
	restaurantRepo repositories.RestaurantRepository
	cfg            *config.Config
}

func NewOrderService(
	orderRepo repositories.OrderRepository,
	cartRepo repositories.CartRepository,
	addressRepo repositories.AddressRepository,
	restaurantRepo repositories.RestaurantRepository,
	cfg *config.Config,
) OrderService {
	return &orderService{
		orderRepo:      orderRepo,
		cartRepo:       cartRepo,
		addressRepo:    addressRepo,
		restaurantRepo: restaurantRepo,
		cfg:            cfg,
	}
}

type RazorpayOrderRequest struct {
	Amount   int    `json:"amount"` // in paise
	Currency string `json:"currency"`
	Receipt  string `json:"receipt"`
}

type RazorpayOrderResponse struct {
	ID      string `json:"id"`
	Amount  int    `json:"amount"`
	Receipt string `json:"receipt"`
}

func (s *orderService) Checkout(ctx context.Context, userID string, req *dto.CheckoutRequest) (*dto.CheckoutResponse, error) {
	// 1. Get User Cart
	cart, err := s.cartRepo.GetByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}
	if cart == nil || len(cart.CartItems) == 0 {
		return nil, errors.New("cart is empty")
	}

	// 2. Validate Address
	address, err := s.addressRepo.FindByID(ctx, req.AddressID)
	if err != nil {
		return nil, err
	}
	if address == nil || address.UserID.String() != userID {
		return nil, errors.New("invalid shipping address")
	}

	// 3. Get Restaurant from the first food item
	firstFoodItem := cart.CartItems[0].Food
	restaurantID := firstFoodItem.RestaurantID

	// 4. Calculate total price and build order items
	var totalPrice float64
	orderItems := make([]models.OrderItem, 0)
	for _, item := range cart.CartItems {
		itemTotal := item.Food.Price * float64(item.Quantity)
		totalPrice += itemTotal

		orderItems = append(orderItems, models.OrderItem{
			FoodID:   item.FoodID,
			Quantity: item.Quantity,
			Price:    item.Food.Price, // Snapshot the price
		})
	}

	// Create local order structure
	userUUID, _ := uuid.Parse(userID)
	addressUUID, _ := uuid.Parse(req.AddressID)

	orderStatus := "Pending"
	if req.PaymentMethod == "Razorpay" {
		orderStatus = "Unpaid"
	}

	order := &models.Order{
		UserID:        userUUID,
		RestaurantID:  restaurantID,
		AddressID:     addressUUID,
		Status:        orderStatus,
		TotalPrice:    totalPrice,
		PaymentMethod: req.PaymentMethod,
		OrderItems:    orderItems,
	}

	// 5. Razorpay Integration
	var razorpayOrderID string
	if req.PaymentMethod == "Razorpay" {
		// If Razorpay API credentials are not set up, run in SIMULATION Mode
		if s.cfg.RazorpayKeyID == "" || s.cfg.RazorpayKeySecret == "" {
			log.Println("Razorpay credentials not found in env. Running Checkout in SIMULATION mode.")
			// Generate a simulated Razorpay Order ID starting with sim_
			razorpayOrderID = "sim_order_" + strings.ReplaceAll(uuid.New().String(), "-", "")[:12]
		} else {
			// Call Razorpay API
			amountInPaise := int(totalPrice * 100)
			receiptID := "receipt_" + strings.ReplaceAll(uuid.New().String(), "-", "")[:10]

			rzReqBody := RazorpayOrderRequest{
				Amount:   amountInPaise,
				Currency: "INR",
				Receipt:  receiptID,
			}

			reqJSON, err := json.Marshal(rzReqBody)
			if err != nil {
				return nil, err
			}

			client := &http.Client{Timeout: 10 * time.Second}
			httpReq, err := http.NewRequestWithContext(ctx, "POST", "https://api.razorpay.com/v1/orders", bytes.NewBuffer(reqJSON))
			if err != nil {
				return nil, err
			}

			// Add Authorization header
			authString := fmt.Sprintf("%s:%s", s.cfg.RazorpayKeyID, s.cfg.RazorpayKeySecret)
			encodedAuth := base64.StdEncoding.EncodeToString([]byte(authString))
			httpReq.Header.Set("Authorization", "Basic "+encodedAuth)
			httpReq.Header.Set("Content-Type", "application/json")

			resp, err := client.Do(httpReq)
			if err != nil {
				return nil, fmt.Errorf("failed to contact Razorpay API: %w", err)
			}
			defer resp.Body.Close()

			if resp.StatusCode != http.StatusCreated && resp.StatusCode != http.StatusOK {
				bodyBytes, _ := io.ReadAll(resp.Body)
				return nil, fmt.Errorf("razorpay order creation failed with status %d: %s", resp.StatusCode, string(bodyBytes))
			}

			var rzResp RazorpayOrderResponse
			if err := json.NewDecoder(resp.Body).Decode(&rzResp); err != nil {
				return nil, err
			}
			razorpayOrderID = rzResp.ID
		}

		// Save the razorpay order ID somewhere. We can save it as payment token / order metadata.
		// For order schema simplicity, we'll store it by setting a custom ID or saving order and using PaymentMethod context.
		// Let's attach Razorpay Order ID to order's PaymentMethod metadata or store in order ID.
		// Actually, we can store RazorpayOrderID in PaymentMethod or as a suffix, e.g. "Razorpay:" + razorpayOrderID.
		// That is super clever and avoids changing the DB models!
		order.PaymentMethod = "Razorpay:" + razorpayOrderID
	}

	// 6. Create local order record in DB
	if err := s.orderRepo.Create(ctx, order); err != nil {
		return nil, err
	}

	// For COD (Cash on Delivery), clear cart immediately
	if req.PaymentMethod == "COD" {
		if err := s.cartRepo.Clear(ctx, cart.ID.String()); err != nil {
			log.Printf("Failed to clear cart for user %s: %v", userID, err)
		}
	}

	return &dto.CheckoutResponse{
		OrderID:         order.ID.String(),
		TotalPrice:      order.TotalPrice,
		PaymentMethod:   req.PaymentMethod,
		RazorpayOrderID: razorpayOrderID,
		RazorpayKeyID:   s.cfg.RazorpayKeyID,
	}, nil
}

func (s *orderService) VerifyPayment(ctx context.Context, userID string, req *dto.VerifyPaymentRequest) (bool, error) {
	// Find order that matches the Razorpay Order ID
	// Because we prefixed it in database, search for payment_method = "Razorpay:<razorpay_order_id>"
	var orderToUpdate *models.Order
	orders, err := s.orderRepo.FindByUserID(ctx, userID)
	if err != nil {
		return false, err
	}

	targetMethod := "Razorpay:" + req.RazorpayOrderID
	for i := range orders {
		if orders[i].PaymentMethod == targetMethod {
			orderToUpdate = &orders[i]
			break
		}
	}

	if orderToUpdate == nil {
		return false, errors.New("matching order not found for this payment")
	}

	if orderToUpdate.Status != "Unpaid" {
		return true, nil // Already processed
	}

	// Signature verification
	if strings.HasPrefix(req.RazorpayOrderID, "sim_order_") {
		// Simulation Mode: Bypass actual signature check
		log.Println("Verifying simulated payment signature (Bypassed)")
	} else {
		// Real verification
		secret := s.cfg.RazorpayKeySecret
		message := req.RazorpayOrderID + "|" + req.RazorpayPaymentID
		h := hmac.New(sha256.New, []byte(secret))
		h.Write([]byte(message))
		generatedSignature := hex.EncodeToString(h.Sum(nil))

		if generatedSignature != req.RazorpaySignature {
			return false, errors.New("invalid payment signature")
		}
	}

	// Mark paid and clear cart
	orderToUpdate.Status = "Pending" // Order moves to standard Pending queue for cooking
	if err := s.orderRepo.Update(ctx, orderToUpdate); err != nil {
		return false, err
	}

	// Clear cart
	cart, err := s.cartRepo.GetByUserID(ctx, userID)
	if err == nil && cart != nil {
		_ = s.cartRepo.Clear(ctx, cart.ID.String())
	}

	return true, nil
}

func (s *orderService) GetMyOrders(ctx context.Context, userID string) ([]dto.OrderResponse, error) {
	orders, err := s.orderRepo.FindByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}

	res := make([]dto.OrderResponse, 0)
	for _, o := range orders {
		res = append(res, *toOrderResponse(&o))
	}
	return res, nil
}

func (s *orderService) GetOwnerOrders(ctx context.Context, ownerID string) ([]dto.OrderResponse, error) {
	// Find restaurant owned by this owner
	restaurant, err := s.restaurantRepo.FindByOwnerID(ctx, ownerID)
	if err != nil {
		return nil, err
	}
	if restaurant == nil {
		return []dto.OrderResponse{}, nil // Owner has no restaurant
	}

	orders, err := s.orderRepo.FindByRestaurantID(ctx, restaurant.ID.String())
	if err != nil {
		return nil, err
	}

	res := make([]dto.OrderResponse, 0)
	for _, o := range orders {
		res = append(res, *toOrderResponse(&o))
	}
	return res, nil
}

func (s *orderService) UpdateOrderStatus(ctx context.Context, ownerID string, orderID string, req *dto.UpdateOrderStatusRequest) (*dto.OrderResponse, error) {
	order, err := s.orderRepo.FindByID(ctx, orderID)
	if err != nil {
		return nil, err
	}
	if order == nil {
		return nil, errors.New("order not found")
	}

	// Verify restaurant ownership
	restaurant, err := s.restaurantRepo.FindByID(ctx, order.RestaurantID.String())
	if err != nil {
		return nil, err
	}
	if restaurant == nil || restaurant.OwnerID.String() != ownerID {
		return nil, errors.New("unauthorized: you do not own the restaurant for this order")
	}

	// Validate status transition
	status := req.Status
	validStatuses := map[string]bool{
		"Pending":          true,
		"Accepted":         true,
		"Preparing":        true,
		"Out For Delivery": true,
		"Delivered":        true,
		"Cancelled":        true,
	}
	if !validStatuses[status] {
		return nil, errors.New("invalid status value")
	}

	order.Status = status
	if err := s.orderRepo.Update(ctx, order); err != nil {
		return nil, err
	}

	return toOrderResponse(order), nil
}

func toOrderResponse(o *models.Order) *dto.OrderResponse {
	itemsRes := make([]dto.OrderItemResponse, 0)
	for _, item := range o.OrderItems {
		itemsRes = append(itemsRes, dto.OrderItemResponse{
			ID:       item.ID.String(),
			FoodID:   item.FoodID.String(),
			Quantity: item.Quantity,
			Price:    item.Price,
			Food: dto.FoodResponse{
				ID:           item.Food.ID.String(),
				RestaurantID: item.Food.RestaurantID.String(),
				Name:         item.Food.Name,
				Description:  item.Food.Description,
				Price:        item.Food.Price,
				Image:        item.Food.Image,
				Availability: item.Food.Availability,
			},
		})
	}

	// Clean payment method string if it contains prefix
	paymentMethodClean := o.PaymentMethod
	if strings.HasPrefix(o.PaymentMethod, "Razorpay:") {
		paymentMethodClean = "Razorpay"
	}

	return &dto.OrderResponse{
		ID:             o.ID.String(),
		UserID:         o.UserID.String(),
		RestaurantID:   o.RestaurantID.String(),
		RestaurantName: o.Restaurant.Name,
		AddressID:      o.AddressID.String(),
		Status:         o.Status,
		TotalPrice:     o.TotalPrice,
		PaymentMethod:  paymentMethodClean,
		Items:          itemsRes,
		CreatedAt:      o.CreatedAt,
		Address: dto.AddressResponse{
			ID:            o.Address.ID.String(),
			UserID:        o.Address.UserID.String(),
			Title:         o.Address.Title,
			StreetAddress: o.Address.StreetAddress,
			City:          o.Address.City,
			State:         o.Address.State,
			PostalCode:    o.Address.PostalCode,
			CreatedAt:     o.Address.CreatedAt,
		},
	}
}
