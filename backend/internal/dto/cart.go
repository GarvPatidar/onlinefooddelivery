package dto

import "time"

// UpdateCartItemRequest holds details to add or modify items in a shopping cart
type UpdateCartItemRequest struct {
	FoodID   string `json:"food_id" binding:"required"`
	Quantity int    `json:"quantity" binding:"required,min=1"`
}

// CartItemResponse represents a single item returned in cart views
type CartItemResponse struct {
	ID        string       `json:"id"`
	FoodID    string       `json:"food_id"`
	Food      FoodResponse `json:"food"`
	Quantity  int          `json:"quantity"`
	CreatedAt time.Time    `json:"created_at"`
}

// CartResponse represents the user's shopping cart details
type CartResponse struct {
	ID        string             `json:"id"`
	UserID    string             `json:"user_id"`
	Items     []CartItemResponse `json:"items"`
	CreatedAt time.Time          `json:"created_at"`
}
