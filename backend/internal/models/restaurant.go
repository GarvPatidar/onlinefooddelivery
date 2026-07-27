package models

import "github.com/google/uuid"

// Restaurant represents a restaurant entity in the system
type Restaurant struct {
	BaseModel
	OwnerID     uuid.UUID `gorm:"type:uuid;not null;index" json:"owner_id"`
	Owner       User      `gorm:"foreignKey:OwnerID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"owner,omitempty"`
	Name        string    `gorm:"type:varchar(150);not null;index" json:"name"`
	Description string    `gorm:"type:text" json:"description"`
	Address     string    `gorm:"type:varchar(255);not null" json:"address"`
	City        string    `gorm:"type:varchar(100);not null;index" json:"city"`
	OpeningTime string    `gorm:"type:varchar(20);not null" json:"opening_time"` // e.g. "09:00"
	ClosingTime string    `gorm:"type:varchar(20);not null" json:"closing_time"` // e.g. "22:00"
	Image       string    `gorm:"type:varchar(255)" json:"image"`
}
