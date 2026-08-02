package dto

// CreateFoodRequest holds validation rules and fields for adding a new food item
type CreateFoodRequest struct {
	Name         string  `json:"name" binding:"required,min=2,max=150"`
	Description  string  `json:"description" binding:"max=500"`
	Price        float64 `json:"price" binding:"required,gt=0"`
	Image        string  `json:"image" binding:"max=255"`
	Availability *bool   `json:"availability" binding:"required"`
}

// UpdateFoodRequest holds validation rules and fields for updating an existing food item
type UpdateFoodRequest struct {
	Name         string  `json:"name" binding:"required,min=2,max=150"`
	Description  string  `json:"description" binding:"max=500"`
	Price        float64 `json:"price" binding:"required,gt=0"`
	Image        string  `json:"image" binding:"max=255"`
	Availability *bool   `json:"availability" binding:"required"`
}

// FoodResponse defines the food details format returned in API responses
type FoodResponse struct {
	ID           string  `json:"id"`
	RestaurantID string  `json:"restaurant_id"`
	Name         string  `json:"name"`
	Description  string  `json:"description"`
	Price        float64 `json:"price"`
	Image        string  `json:"image"`
	Availability bool    `json:"availability"`
	CreatedAt    string  `json:"created_at"`
}
