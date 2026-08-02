package services

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"onlinefooddelivery/backend/internal/dto"
	"onlinefooddelivery/backend/internal/models"
	"onlinefooddelivery/backend/internal/repositories"
)

// FoodService defines business operations for managing food items
type FoodService interface {
	AddFood(ctx context.Context, ownerID string, restaurantID string, req *dto.CreateFoodRequest) (*dto.FoodResponse, error)
	UpdateFood(ctx context.Context, ownerID string, foodID string, req *dto.UpdateFoodRequest) (*dto.FoodResponse, error)
	DeleteFood(ctx context.Context, ownerID string, foodID string) error
	GetFoodByID(ctx context.Context, id string) (*dto.FoodResponse, error)
	GetFoodsByRestaurantID(ctx context.Context, restaurantID string) ([]dto.FoodResponse, error)
}

type foodService struct {
	foodRepo       repositories.FoodRepository
	restaurantRepo repositories.RestaurantRepository
}

// NewFoodService returns a new instance of FoodService
func NewFoodService(foodRepo repositories.FoodRepository, restaurantRepo repositories.RestaurantRepository) FoodService {
	return &foodService{
		foodRepo:       foodRepo,
		restaurantRepo: restaurantRepo,
	}
}

func (s *foodService) AddFood(ctx context.Context, ownerID string, restaurantID string, req *dto.CreateFoodRequest) (*dto.FoodResponse, error) {
	// Verify restaurant exists and belongs to the owner
	restaurant, err := s.restaurantRepo.FindByID(ctx, restaurantID)
	if err != nil {
		return nil, err
	}
	if restaurant == nil {
		return nil, errors.New("restaurant not found")
	}
	if restaurant.OwnerID.String() != ownerID {
		return nil, errors.New("unauthorized: you do not own this restaurant")
	}

	restUUID, err := uuid.Parse(restaurantID)
	if err != nil {
		return nil, errors.New("invalid restaurant ID")
	}

	food := &models.Food{
		RestaurantID: restUUID,
		Name:         req.Name,
		Description:  req.Description,
		Price:        req.Price,
		Image:        req.Image,
		Availability: *req.Availability,
	}

	if err := s.foodRepo.Create(ctx, food); err != nil {
		return nil, err
	}

	return toFoodResponse(food), nil
}

func (s *foodService) UpdateFood(ctx context.Context, ownerID string, foodID string, req *dto.UpdateFoodRequest) (*dto.FoodResponse, error) {
	food, err := s.foodRepo.FindByID(ctx, foodID)
	if err != nil {
		return nil, err
	}
	if food == nil {
		return nil, errors.New("food item not found")
	}

	// Verify restaurant ownership
	restaurant, err := s.restaurantRepo.FindByID(ctx, food.RestaurantID.String())
	if err != nil {
		return nil, err
	}
	if restaurant == nil {
		return nil, errors.New("restaurant associated with this food item was not found")
	}
	if restaurant.OwnerID.String() != ownerID {
		return nil, errors.New("unauthorized: you do not own the restaurant associated with this food item")
	}

	food.Name = req.Name
	food.Description = req.Description
	food.Price = req.Price
	food.Image = req.Image
	food.Availability = *req.Availability

	if err := s.foodRepo.Update(ctx, food); err != nil {
		return nil, err
	}

	return toFoodResponse(food), nil
}

func (s *foodService) DeleteFood(ctx context.Context, ownerID string, foodID string) error {
	food, err := s.foodRepo.FindByID(ctx, foodID)
	if err != nil {
		return err
	}
	if food == nil {
		return errors.New("food item not found")
	}

	// Verify restaurant ownership
	restaurant, err := s.restaurantRepo.FindByID(ctx, food.RestaurantID.String())
	if err != nil {
		return err
	}
	if restaurant == nil {
		return errors.New("restaurant associated with this food item was not found")
	}
	if restaurant.OwnerID.String() != ownerID {
		return errors.New("unauthorized: you do not own the restaurant associated with this food item")
	}

	return s.foodRepo.Delete(ctx, foodID)
}

func (s *foodService) GetFoodByID(ctx context.Context, id string) (*dto.FoodResponse, error) {
	food, err := s.foodRepo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if food == nil {
		return nil, errors.New("food item not found")
	}
	return toFoodResponse(food), nil
}

func (s *foodService) GetFoodsByRestaurantID(ctx context.Context, restaurantID string) ([]dto.FoodResponse, error) {
	foods, err := s.foodRepo.FindByRestaurantID(ctx, restaurantID)
	if err != nil {
		return nil, err
	}

	var res []dto.FoodResponse
	for _, f := range foods {
		res = append(res, *toFoodResponse(&f))
	}
	return res, nil
}

func toFoodResponse(f *models.Food) *dto.FoodResponse {
	return &dto.FoodResponse{
		ID:           f.ID.String(),
		RestaurantID: f.RestaurantID.String(),
		Name:         f.Name,
		Description:  f.Description,
		Price:        f.Price,
		Image:        f.Image,
		Availability: f.Availability,
		CreatedAt:    f.CreatedAt.String(),
	}
}
