package models

import "github.com/google/uuid"

// Review represents a review submitted by a customer for a restaurant
type Review struct {
	BaseModel
	UserID       uuid.UUID  `gorm:"type:uuid;not null;index" json:"user_id"`
	User         User       `gorm:"foreignKey:UserID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"user,omitempty"`
	RestaurantID uuid.UUID  `gorm:"type:uuid;not null;index" json:"restaurant_id"`
	Restaurant   Restaurant `gorm:"foreignKey:RestaurantID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"-"`
	Rating       int        `gorm:"type:integer;not null" json:"rating"` // e.g. 1 to 5
	Comment      string     `gorm:"type:text" json:"comment"`
}
