package models

// Category represents a food category (e.g. Pizza, Burger)
type Category struct {
	BaseModel
	Name string `gorm:"type:varchar(100);uniqueIndex;not null" json:"name"`
}
