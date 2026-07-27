package models

import "github.com/google/uuid"

// Address represents a delivery address saved by a user
type Address struct {
	BaseModel
	UserID        uuid.UUID `gorm:"type:uuid;not null;index" json:"user_id"`
	User          User      `gorm:"foreignKey:UserID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"-"`
	Title         string    `gorm:"type:varchar(50);not null" json:"title"` // e.g. "Home", "Work"
	StreetAddress string    `gorm:"type:varchar(255);not null" json:"street_address"`
	City          string    `gorm:"type:varchar(100);not null;index" json:"city"`
	State         string    `gorm:"type:varchar(100);not null" json:"state"`
	PostalCode    string    `gorm:"type:varchar(20);not null" json:"postal_code"`
}
