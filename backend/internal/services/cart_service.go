package services

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"onlinefooddelivery/backend/internal/dto"
	"onlinefooddelivery/backend/internal/models"
	"onlinefooddelivery/backend/internal/repositories"
)

type CartService interface {
	GetCart(ctx context.Context, userID string) (*dto.CartResponse, error)
	UpdateCartItem(ctx context.Context, userID string, req *dto.UpdateCartItemRequest) (*dto.CartResponse, error)
	RemoveCartItem(ctx context.Context, userID, foodID string) (*dto.CartResponse, error)
	ClearCart(ctx context.Context, userID string) error
}

type cartService struct {
	cartRepo repositories.CartRepository
	foodRepo repositories.FoodRepository
}

func NewCartService(cartRepo repositories.CartRepository, foodRepo repositories.FoodRepository) CartService {
	return &cartService{
		cartRepo: cartRepo,
		foodRepo: foodRepo,
	}
}

func (s *cartService) GetCart(ctx context.Context, userID string) (*dto.CartResponse, error) {
	cart, err := s.cartRepo.GetByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}

	if cart == nil {
		// Create empty cart for new user
		userUUID, err := uuid.Parse(userID)
		if err != nil {
			return nil, errors.New("invalid user ID")
		}
		newCart := &models.Cart{
			UserID: userUUID,
		}
		if err := s.cartRepo.Create(ctx, newCart); err != nil {
			return nil, err
		}
		// Fetch again to have proper empty structure
		cart, err = s.cartRepo.GetByUserID(ctx, userID)
		if err != nil {
			return nil, err
		}
	}

	return toCartResponse(cart), nil
}

func (s *cartService) UpdateCartItem(ctx context.Context, userID string, req *dto.UpdateCartItemRequest) (*dto.CartResponse, error) {
	// 1. Fetch Cart
	cart, err := s.cartRepo.GetByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}
	if cart == nil {
		// Create cart
		userUUID, err := uuid.Parse(userID)
		if err != nil {
			return nil, errors.New("invalid user ID")
		}
		cart = &models.Cart{UserID: userUUID}
		if err := s.cartRepo.Create(ctx, cart); err != nil {
			return nil, err
		}
		cart, err = s.cartRepo.GetByUserID(ctx, userID)
		if err != nil {
			return nil, err
		}
	}

	// 2. Validate food item exists
	food, err := s.foodRepo.FindByID(ctx, req.FoodID)
	if err != nil {
		return nil, err
	}
	if food == nil {
		return nil, errors.New("food item not found")
	}
	if !food.Availability {
		return nil, errors.New("food item is currently unavailable")
	}

	foodUUID, _ := uuid.Parse(req.FoodID)

	// Check if all items in cart belong to the same restaurant. If not, reset cart or return error.
	// In most food delivery apps, cart is restricted to single restaurant. Let's enforce it.
	if len(cart.CartItems) > 0 {
		firstItemFood, err := s.foodRepo.FindByID(ctx, cart.CartItems[0].FoodID.String())
		if err == nil && firstItemFood != nil && firstItemFood.RestaurantID != food.RestaurantID {
			// Clear cart and start new restaurant cart
			if err := s.cartRepo.Clear(ctx, cart.ID.String()); err != nil {
				return nil, err
			}
			cart.CartItems = []models.CartItem{}
		}
	}

	// 3. Find existing item in cart
	var existingItem *models.CartItem
	for i := range cart.CartItems {
		if cart.CartItems[i].FoodID == foodUUID {
			existingItem = &cart.CartItems[i]
			break
		}
	}

	if existingItem != nil {
		existingItem.Quantity = req.Quantity
		if err := s.cartRepo.SaveItem(ctx, existingItem); err != nil {
			return nil, err
		}
	} else {
		newItem := &models.CartItem{
			CartID:   cart.ID,
			FoodID:   foodUUID,
			Quantity: req.Quantity,
		}
		if err := s.cartRepo.SaveItem(ctx, newItem); err != nil {
			return nil, err
		}
	}

	// Fetch updated cart
	updatedCart, err := s.cartRepo.GetByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}
	return toCartResponse(updatedCart), nil
}

func (s *cartService) RemoveCartItem(ctx context.Context, userID, foodID string) (*dto.CartResponse, error) {
	cart, err := s.cartRepo.GetByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}
	if cart == nil {
		return nil, errors.New("cart not found")
	}

	if err := s.cartRepo.RemoveItem(ctx, cart.ID.String(), foodID); err != nil {
		return nil, err
	}

	updatedCart, err := s.cartRepo.GetByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}
	return toCartResponse(updatedCart), nil
}

func (s *cartService) ClearCart(ctx context.Context, userID string) error {
	cart, err := s.cartRepo.GetByUserID(ctx, userID)
	if err != nil {
		return err
	}
	if cart == nil {
		return nil
	}
	return s.cartRepo.Clear(ctx, cart.ID.String())
}

// Helpers for conversion
func toCartResponse(c *models.Cart) *dto.CartResponse {
	itemsRes := make([]dto.CartItemResponse, 0)
	for _, item := range c.CartItems {
		itemsRes = append(itemsRes, dto.CartItemResponse{
			ID:       item.ID.String(),
			FoodID:   item.FoodID.String(),
			Quantity: item.Quantity,
			Food: dto.FoodResponse{
				ID:           item.Food.ID.String(),
				RestaurantID: item.Food.RestaurantID.String(),
				Name:         item.Food.Name,
				Description:  item.Food.Description,
				Price:        item.Food.Price,
				Image:        item.Food.Image,
				Availability: item.Food.Availability,
			},
			CreatedAt: item.CreatedAt,
		})
	}

	return &dto.CartResponse{
		ID:        c.ID.String(),
		UserID:    c.UserID.String(),
		Items:     itemsRes,
		CreatedAt: c.CreatedAt,
	}
}
