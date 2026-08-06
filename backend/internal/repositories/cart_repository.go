package repositories

import (
	"context"
	"errors"

	"gorm.io/gorm"
	"onlinefooddelivery/backend/internal/models"
)

type CartRepository interface {
	GetByUserID(ctx context.Context, userID string) (*models.Cart, error)
	Create(ctx context.Context, cart *models.Cart) error
	SaveItem(ctx context.Context, item *models.CartItem) error
	RemoveItem(ctx context.Context, cartID, foodID string) error
	Clear(ctx context.Context, cartID string) error
}

type cartRepository struct {
	db *gorm.DB
}

func NewCartRepository(db *gorm.DB) CartRepository {
	return &cartRepository{db: db}
}

func (r *cartRepository) GetByUserID(ctx context.Context, userID string) (*models.Cart, error) {
	var cart models.Cart
	// Preload items and preloaded food items inside cart items
	err := r.db.WithContext(ctx).
		Preload("CartItems").
		Preload("CartItems.Food").
		Where("user_id = ?", userID).
		First(&cart).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &cart, nil
}

func (r *cartRepository) Create(ctx context.Context, cart *models.Cart) error {
	return r.db.WithContext(ctx).Create(cart).Error
}

func (r *cartRepository) SaveItem(ctx context.Context, item *models.CartItem) error {
	return r.db.WithContext(ctx).Save(item).Error
}

func (r *cartRepository) RemoveItem(ctx context.Context, cartID, foodID string) error {
	return r.db.WithContext(ctx).
		Where("cart_id = ? AND food_id = ?", cartID, foodID).
		Delete(&models.CartItem{}).Error
}

func (r *cartRepository) Clear(ctx context.Context, cartID string) error {
	return r.db.WithContext(ctx).
		Where("cart_id = ?", cartID).
		Delete(&models.CartItem{}).Error
}
