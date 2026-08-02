package repositories

import (
	"context"
	"errors"

	"gorm.io/gorm"
	"onlinefooddelivery/backend/internal/models"
)

// RestaurantRepository defines database operations for the Restaurant entity
type RestaurantRepository interface {
	Create(ctx context.Context, restaurant *models.Restaurant) error
	Update(ctx context.Context, restaurant *models.Restaurant) error
	FindByID(ctx context.Context, id string) (*models.Restaurant, error)
	FindByOwnerID(ctx context.Context, ownerID string) (*models.Restaurant, error)
	FindAll(ctx context.Context) ([]models.Restaurant, error)
}

type restaurantRepository struct {
	db *gorm.DB
}

// NewRestaurantRepository returns a new instance of RestaurantRepository
func NewRestaurantRepository(db *gorm.DB) RestaurantRepository {
	return &restaurantRepository{db: db}
}

func (r *restaurantRepository) Create(ctx context.Context, restaurant *models.Restaurant) error {
	return r.db.WithContext(ctx).Create(restaurant).Error
}

func (r *restaurantRepository) Update(ctx context.Context, restaurant *models.Restaurant) error {
	return r.db.WithContext(ctx).Save(restaurant).Error
}

func (r *restaurantRepository) FindByID(ctx context.Context, id string) (*models.Restaurant, error) {
	var restaurant models.Restaurant
	err := r.db.WithContext(ctx).Where("id = ?", id).First(&restaurant).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &restaurant, nil
}

func (r *restaurantRepository) FindByOwnerID(ctx context.Context, ownerID string) (*models.Restaurant, error) {
	var restaurant models.Restaurant
	err := r.db.WithContext(ctx).Where("owner_id = ?", ownerID).First(&restaurant).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &restaurant, nil
}

func (r *restaurantRepository) FindAll(ctx context.Context) ([]models.Restaurant, error) {
	var restaurants []models.Restaurant
	err := r.db.WithContext(ctx).Find(&restaurants).Error
	if err != nil {
		return nil, err
	}
	return restaurants, nil
}
