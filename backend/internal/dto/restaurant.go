package dto

// CreateRestaurantRequest holds validation rules and fields for creating a restaurant
type CreateRestaurantRequest struct {
	Name        string `json:"name" binding:"required,min=2,max=150"`
	Description string `json:"description" binding:"max=500"`
	Address     string `json:"address" binding:"required,max=255"`
	City        string `json:"city" binding:"required,max=100"`
	OpeningTime string `json:"opening_time" binding:"required,max=20"` // e.g. "09:00"
	ClosingTime string `json:"closing_time" binding:"required,max=20"` // e.g. "22:00"
	Image       string `json:"image" binding:"max=255"`
}

// UpdateRestaurantRequest holds validation rules and fields for updating a restaurant
type UpdateRestaurantRequest struct {
	Name        string `json:"name" binding:"required,min=2,max=150"`
	Description string `json:"description" binding:"max=500"`
	Address     string `json:"address" binding:"required,max=255"`
	City        string `json:"city" binding:"required,max=100"`
	OpeningTime string `json:"opening_time" binding:"required,max=20"`
	ClosingTime string `json:"closing_time" binding:"required,max=20"`
	Image       string `json:"image" binding:"max=255"`
}

// RestaurantResponse defines the restaurant details format returned in API responses
type RestaurantResponse struct {
	ID          string `json:"id"`
	OwnerID     string `json:"owner_id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Address     string `json:"address"`
	City        string `json:"city"`
	OpeningTime string `json:"opening_time"`
	ClosingTime string `json:"closing_time"`
	Image       string `json:"image"`
	CreatedAt   string `json:"created_at"`
}
