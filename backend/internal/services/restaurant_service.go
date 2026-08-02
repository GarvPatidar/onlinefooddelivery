package services

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"onlinefooddelivery/backend/internal/dto"
	"onlinefooddelivery/backend/internal/models"
	"onlinefooddelivery/backend/internal/repositories"
)

// RestaurantService defines business operations for managing restaurants
type RestaurantService interface {
	CreateRestaurant(ctx context.Context, ownerID string, req *dto.CreateRestaurantRequest) (*dto.RestaurantResponse, error)
	UpdateRestaurant(ctx context.Context, ownerID string, restaurantID string, req *dto.UpdateRestaurantRequest) (*dto.RestaurantResponse, error)
	GetRestaurantByID(ctx context.Context, id string) (*dto.RestaurantResponse, error)
	GetRestaurantByOwnerID(ctx context.Context, ownerID string) (*dto.RestaurantResponse, error)
	GetAllRestaurants(ctx context.Context) ([]dto.RestaurantResponse, error)
}

type restaurantService struct {
	restaurantRepo repositories.RestaurantRepository
}

// NewRestaurantService returns a new instance of RestaurantService
func NewRestaurantService(restaurantRepo repositories.RestaurantRepository) RestaurantService {
	return &restaurantService{restaurantRepo: restaurantRepo}
}

func (s *restaurantService) CreateRestaurant(ctx context.Context, ownerID string, req *dto.CreateRestaurantRequest) (*dto.RestaurantResponse, error) {
	ownerUUID, err := uuid.Parse(ownerID)
	if err != nil {
		return nil, errors.New("invalid owner ID")
	}

	// Verify the owner doesn't already have a restaurant
	existing, err := s.restaurantRepo.FindByOwnerID(ctx, ownerID)
	if err != nil {
		return nil, err
	}
	if existing != nil {
		return nil, errors.New("you already own a restaurant; maximum 1 restaurant permitted")
	}

	restaurant := &models.Restaurant{
		OwnerID:     ownerUUID,
		Name:        req.Name,
		Description: req.Description,
		Address:     req.Address,
		City:        req.City,
		OpeningTime: req.OpeningTime,
		ClosingTime: req.ClosingTime,
		Image:       req.Image,
	}

	if err := s.restaurantRepo.Create(ctx, restaurant); err != nil {
		return nil, err
	}

	return toRestaurantResponse(restaurant), nil
}

func (s *restaurantService) UpdateRestaurant(ctx context.Context, ownerID string, restaurantID string, req *dto.UpdateRestaurantRequest) (*dto.RestaurantResponse, error) {
	restaurant, err := s.restaurantRepo.FindByID(ctx, restaurantID)
	if err != nil {
		return nil, err
	}
	if restaurant == nil {
		return nil, errors.New("restaurant not found")
	}

	// Ensure the updater is the owner of the restaurant
	if restaurant.OwnerID.String() != ownerID {
		return nil, errors.New("unauthorized: you do not own this restaurant")
	}

	restaurant.Name = req.Name
	restaurant.Description = req.Description
	restaurant.Address = req.Address
	restaurant.City = req.City
	restaurant.OpeningTime = req.OpeningTime
	restaurant.ClosingTime = req.ClosingTime
	restaurant.Image = req.Image

	if err := s.restaurantRepo.Update(ctx, restaurant); err != nil {
		return nil, err
	}

	return toRestaurantResponse(restaurant), nil
}

func (s *restaurantService) GetRestaurantByID(ctx context.Context, id string) (*dto.RestaurantResponse, error) {
	restaurant, err := s.restaurantRepo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if restaurant == nil {
		return nil, errors.New("restaurant not found")
	}
	return toRestaurantResponse(restaurant), nil
}

func (s *restaurantService) GetRestaurantByOwnerID(ctx context.Context, ownerID string) (*dto.RestaurantResponse, error) {
	restaurant, err := s.restaurantRepo.FindByOwnerID(ctx, ownerID)
	if err != nil {
		return nil, err
	}
	if restaurant == nil {
		return nil, nil // Return nil, nil when they don't have a restaurant yet
	}
	return toRestaurantResponse(restaurant), nil
}

func (s *restaurantService) GetAllRestaurants(ctx context.Context) ([]dto.RestaurantResponse, error) {
	restaurants, err := s.restaurantRepo.FindAll(ctx)
	if err != nil {
		return nil, err
	}

	var res []dto.RestaurantResponse
	for _, r := range restaurants {
		res = append(res, *toRestaurantResponse(&r))
	}
	return res, nil
}

func toRestaurantResponse(r *models.Restaurant) *dto.RestaurantResponse {
	return &dto.RestaurantResponse{
		ID:          r.ID.String(),
		OwnerID:     r.OwnerID.String(),
		Name:        r.Name,
		Description: r.Description,
		Address:     r.Address,
		City:        r.City,
		OpeningTime: r.OpeningTime,
		ClosingTime: r.ClosingTime,
		Image:       r.Image,
		CreatedAt:   r.CreatedAt.String(),
	}
}
