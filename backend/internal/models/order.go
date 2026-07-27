package models

import "github.com/google/uuid"

// Order represents an order placed by a customer
type Order struct {
	BaseModel
	UserID        uuid.UUID   `gorm:"type:uuid;not null;index" json:"user_id"`
	User          User        `gorm:"foreignKey:UserID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT;" json:"user,omitempty"`
	RestaurantID  uuid.UUID   `gorm:"type:uuid;not null;index" json:"restaurant_id"`
	Restaurant    Restaurant  `gorm:"foreignKey:RestaurantID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT;" json:"restaurant,omitempty"`
	AddressID     uuid.UUID   `gorm:"type:uuid;not null;index" json:"address_id"`
	Address       Address     `gorm:"foreignKey:AddressID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT;" json:"address,omitempty"`
	Status        string      `gorm:"type:varchar(50);default:'Pending';not null;index" json:"status"` // e.g. Pending, Accepted, Preparing, Out For Delivery, Delivered, Cancelled
	TotalPrice    float64     `gorm:"type:decimal(10,2);not null" json:"total_price"`
	PaymentMethod string      `gorm:"type:varchar(50);default:'COD';not null" json:"payment_method"` // Default is "COD" (Cash on Delivery)
	OrderItems    []OrderItem `gorm:"foreignKey:OrderID" json:"items"`
}

// OrderItem represents a single line item within an order
type OrderItem struct {
	BaseModel
	OrderID  uuid.UUID `gorm:"type:uuid;not null;index" json:"order_id"`
	FoodID   uuid.UUID `gorm:"type:uuid;not null;index" json:"food_id"`
	Food     Food      `gorm:"foreignKey:FoodID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT;" json:"food"`
	Quantity int       `gorm:"type:integer;not null" json:"quantity"`
	Price    float64   `gorm:"type:decimal(10,2);not null" json:"price"` // Fixed price at checkout
}
