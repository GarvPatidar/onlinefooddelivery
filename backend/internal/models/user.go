package models

// User represents a user in the system (either a Customer or a Restaurant Owner)
type User struct {
	BaseModel
	Name     string `gorm:"type:varchar(100);not null" json:"name"`
	Email    string `gorm:"type:varchar(100);uniqueIndex;not null" json:"email"`
	Password string `gorm:"type:varchar(255);not null" json:"-"`
	Role     string `gorm:"type:varchar(50);not null" json:"role"` // "customer" or "restaurant_owner"
}
