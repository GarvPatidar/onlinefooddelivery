package repositories

import (
	"context"
	"errors"

	"gorm.io/gorm"
	"onlinefooddelivery/backend/internal/models"
)

type AddressRepository interface {
	Create(ctx context.Context, address *models.Address) error
	FindByUserID(ctx context.Context, userID string) ([]models.Address, error)
	FindByID(ctx context.Context, id string) (*models.Address, error)
}

type addressRepository struct {
	db *gorm.DB
}

func NewAddressRepository(db *gorm.DB) AddressRepository {
	return &addressRepository{db: db}
}

func (r *addressRepository) Create(ctx context.Context, address *models.Address) error {
	return r.db.WithContext(ctx).Create(address).Error
}

func (r *addressRepository) FindByUserID(ctx context.Context, userID string) ([]models.Address, error) {
	var addresses []models.Address
	err := r.db.WithContext(ctx).
		Where("user_id = ?", userID).
		Order("created_at desc").
		Find(&addresses).Error
	if err != nil {
		return nil, err
	}
	return addresses, nil
}

func (r *addressRepository) FindByID(ctx context.Context, id string) (*models.Address, error) {
	var address models.Address
	err := r.db.WithContext(ctx).Where("id = ?", id).First(&address).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &address, nil
}
