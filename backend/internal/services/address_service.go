package services

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"onlinefooddelivery/backend/internal/dto"
	"onlinefooddelivery/backend/internal/models"
	"onlinefooddelivery/backend/internal/repositories"
)

type AddressService interface {
	CreateAddress(ctx context.Context, userID string, req *dto.CreateAddressRequest) (*dto.AddressResponse, error)
	GetAddressesByUserID(ctx context.Context, userID string) ([]dto.AddressResponse, error)
}

type addressService struct {
	addressRepo repositories.AddressRepository
}

func NewAddressService(addressRepo repositories.AddressRepository) AddressService {
	return &addressService{addressRepo: addressRepo}
}

func (s *addressService) CreateAddress(ctx context.Context, userID string, req *dto.CreateAddressRequest) (*dto.AddressResponse, error) {
	userUUID, err := uuid.Parse(userID)
	if err != nil {
		return nil, errors.New("invalid user ID")
	}

	address := &models.Address{
		UserID:        userUUID,
		Title:         req.Title,
		StreetAddress: req.StreetAddress,
		City:          req.City,
		State:         req.State,
		PostalCode:    req.PostalCode,
	}

	if err := s.addressRepo.Create(ctx, address); err != nil {
		return nil, err
	}

	return toAddressResponse(address), nil
}

func (s *addressService) GetAddressesByUserID(ctx context.Context, userID string) ([]dto.AddressResponse, error) {
	addresses, err := s.addressRepo.FindByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}

	res := make([]dto.AddressResponse, 0)
	for _, a := range addresses {
		res = append(res, *toAddressResponse(&a))
	}
	return res, nil
}

func toAddressResponse(a *models.Address) *dto.AddressResponse {
	return &dto.AddressResponse{
		ID:            a.ID.String(),
		UserID:        a.UserID.String(),
		Title:         a.Title,
		StreetAddress: a.StreetAddress,
		City:          a.City,
		State:         a.State,
		PostalCode:    a.PostalCode,
		CreatedAt:     a.CreatedAt,
	}
}
