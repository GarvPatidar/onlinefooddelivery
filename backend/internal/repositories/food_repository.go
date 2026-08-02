package repositories

import (
	"context"
	"errors"

	"gorm.io/gorm"
	"onlinefooddelivery/backend/internal/models"
)

// FoodRepository defines database operations for the Food entity
type FoodRepository interface {
	Create(ctx context.Context, food *models.Food) error
	Update(ctx context.Context, food *models.Food) error
	Delete(ctx context.Context, id string) error
	FindByID(ctx context.Context, id string) (*models.Food, error)
	FindByRestaurantID(ctx context.Context, restaurantID string) ([]models.Food, error)
}

type foodRepository struct {
	db *gorm.DB
}

// NewFoodRepository returns a new instance of FoodRepository
func NewFoodRepository(db *gorm.DB) FoodRepository {
	return &foodRepository{db: db}
}

func (r *foodRepository) Create(ctx context.Context, food *models.Food) error {
	return r.db.WithContext(ctx).Create(food).Error
}

func (r *foodRepository) Update(ctx context.Context, food *models.Food) error {
	return r.db.WithContext(ctx).Save(food).Error
}

func (r *foodRepository) Delete(ctx context.Context, id string) error {
	return r.db.WithContext(ctx).Delete(&models.Food{}, "id = ?", id).Error
}

func (r *foodRepository) FindByID(ctx context.Context, id string) (*models.Food, error) {
	var food models.Food
	err := r.db.WithContext(ctx).Where("id = ?", id).First(&food).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &food, nil
}

func (r *foodRepository) FindByRestaurantID(ctx context.Context, restaurantID string) ([]models.Food, error) {
	var foods []models.Food
	err := r.db.WithContext(ctx).Where("restaurant_id = ?", restaurantID).Find(&foods).Error
	if err != nil {
		return nil, err
	}
	return foods, nil
}
