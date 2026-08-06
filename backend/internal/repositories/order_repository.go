package repositories

import (
	"context"
	"errors"

	"gorm.io/gorm"
	"onlinefooddelivery/backend/internal/models"
)

type OrderRepository interface {
	Create(ctx context.Context, order *models.Order) error
	Update(ctx context.Context, order *models.Order) error
	FindByID(ctx context.Context, id string) (*models.Order, error)
	FindByUserID(ctx context.Context, userID string) ([]models.Order, error)
	FindByRestaurantID(ctx context.Context, restaurantID string) ([]models.Order, error)
}

type orderRepository struct {
	db *gorm.DB
}

func NewOrderRepository(db *gorm.DB) OrderRepository {
	return &orderRepository{db: db}
}

func (r *orderRepository) Create(ctx context.Context, order *models.Order) error {
	// Execute in transaction to ensure order and items are created together
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(order).Error; err != nil {
			return err
		}
		return nil
	})
}

func (r *orderRepository) Update(ctx context.Context, order *models.Order) error {
	return r.db.WithContext(ctx).Save(order).Error
}

func (r *orderRepository) FindByID(ctx context.Context, id string) (*models.Order, error) {
	var order models.Order
	err := r.db.WithContext(ctx).
		Preload("OrderItems").
		Preload("OrderItems.Food").
		Preload("Address").
		Preload("Restaurant").
		Where("id = ?", id).
		First(&order).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &order, nil
}

func (r *orderRepository) FindByUserID(ctx context.Context, userID string) ([]models.Order, error) {
	var orders []models.Order
	err := r.db.WithContext(ctx).
		Preload("OrderItems").
		Preload("OrderItems.Food").
		Preload("Address").
		Preload("Restaurant").
		Where("user_id = ?", userID).
		Order("created_at desc").
		Find(&orders).Error
	if err != nil {
		return nil, err
	}
	return orders, nil
}

func (r *orderRepository) FindByRestaurantID(ctx context.Context, restaurantID string) ([]models.Order, error) {
	var orders []models.Order
	err := r.db.WithContext(ctx).
		Preload("OrderItems").
		Preload("OrderItems.Food").
		Preload("Address").
		Preload("Restaurant").
		Where("restaurant_id = ?", restaurantID).
		Order("created_at desc").
		Find(&orders).Error
	if err != nil {
		return nil, err
	}
	return orders, nil
}
