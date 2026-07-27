package models

import "github.com/google/uuid"

// Food represents a food item offered by a restaurant
type Food struct {
	BaseModel
	RestaurantID uuid.UUID  `gorm:"type:uuid;not null;index" json:"restaurant_id"`
	Restaurant   Restaurant `gorm:"foreignKey:RestaurantID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"restaurant,omitempty"`
	CategoryID   uuid.UUID  `gorm:"type:uuid;not null;index" json:"category_id"`
	Category     Category   `gorm:"foreignKey:CategoryID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;" json:"category,omitempty"`
	Name         string     `gorm:"type:varchar(150);not null;index" json:"name"`
	Description  string     `gorm:"type:text" json:"description"`
	Price        float64    `gorm:"type:decimal(10,2);not null" json:"price"`
	Image        string     `gorm:"type:varchar(255)" json:"image"`
	Availability bool       `gorm:"type:boolean;default:true;not null" json:"availability"`
}
