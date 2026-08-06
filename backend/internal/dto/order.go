package dto

import "time"

// CheckoutRequest holds fields needed to place an order
type CheckoutRequest struct {
	AddressID     string `json:"address_id" binding:"required"`
	PaymentMethod string `json:"payment_method" binding:"required"` // "COD" or "Razorpay"
}

// CheckoutResponse contains checkout initiation details including Razorpay Order ID
type CheckoutResponse struct {
	OrderID         string  `json:"order_id"`
	TotalPrice      float64 `json:"total_price"`
	PaymentMethod   string  `json:"payment_method"`
	RazorpayOrderID string  `json:"razorpay_order_id,omitempty"` // populated if using Razorpay
	RazorpayKeyID   string  `json:"razorpay_key_id,omitempty"`   // convenience for frontend SDK loading
}

// VerifyPaymentRequest is sent by frontend checkout script after successful Razorpay verification
type VerifyPaymentRequest struct {
	RazorpayOrderID   string `json:"razorpay_order_id" binding:"required"`
	RazorpayPaymentID string `json:"razorpay_payment_id" binding:"required"`
	RazorpaySignature string `json:"razorpay_signature" binding:"required"`
}

// UpdateOrderStatusRequest is used by owners to update delivery progress status
type UpdateOrderStatusRequest struct {
	Status string `json:"status" binding:"required"`
}

// OrderItemResponse represents items in historical or current orders
type OrderItemResponse struct {
	ID       string       `json:"id"`
	FoodID   string       `json:"food_id"`
	Food     FoodResponse `json:"food"`
	Quantity int          `json:"quantity"`
	Price    float64      `json:"price"`
}

// OrderResponse represents order metadata and status details
type OrderResponse struct {
	ID            string              `json:"id"`
	UserID        string              `json:"user_id"`
	RestaurantID  string              `json:"restaurant_id"`
	RestaurantName string             `json:"restaurant_name"`
	AddressID     string              `json:"address_id"`
	Address       AddressResponse     `json:"address"`
	Status        string              `json:"status"`
	TotalPrice    float64             `json:"total_price"`
	PaymentMethod string              `json:"payment_method"`
	Items         []OrderItemResponse `json:"items"`
	CreatedAt     time.Time           `json:"created_at"`
}
