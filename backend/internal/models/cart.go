package models

import "github.com/google/uuid"

// Cart represents a user's shopping cart
type Cart struct {
	BaseModel
	UserID    uuid.UUID  `gorm:"type:uuid;not null;uniqueIndex" json:"user_id"`
	User      User       `gorm:"foreignKey:UserID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"-"`
	CartItems []CartItem `gorm:"foreignKey:CartID" json:"items"`
}

// CartItem represents an item within a shopping cart
type CartItem struct {
	BaseModel
	CartID   uuid.UUID `gorm:"type:uuid;not null;index" json:"cart_id"`
	FoodID   uuid.UUID `gorm:"type:uuid;not null;index" json:"food_id"`
	Food     Food      `gorm:"foreignKey:FoodID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"food"`
	Quantity int       `gorm:"type:integer;not null;default:1" json:"quantity"`
}
