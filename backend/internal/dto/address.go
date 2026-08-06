package dto

import "time"

// CreateAddressRequest defines fields required to save a delivery address
type CreateAddressRequest struct {
	Title         string `json:"title" binding:"required,min=2,max=50"`
	StreetAddress string `json:"street_address" binding:"required,min=5,max=255"`
	City          string `json:"city" binding:"required,min=2,max=100"`
	State         string `json:"state" binding:"required,min=2,max=100"`
	PostalCode    string `json:"postal_code" binding:"required,min=4,max=20"`
}

// AddressResponse represents details of a saved user address
type AddressResponse struct {
	ID            string    `json:"id"`
	UserID        string    `json:"user_id"`
	Title         string    `json:"title"`
	StreetAddress string    `json:"street_address"`
	City          string    `json:"city"`
	State         string    `json:"state"`
	PostalCode    string    `json:"postal_code"`
	CreatedAt     time.Time `json:"created_at"`
}
