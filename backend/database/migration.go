package database

import (
	"log"

	"gorm.io/gorm"
	"onlinefooddelivery/backend/internal/models"
)

// MigrateDB runs the GORM AutoMigrate on all models to ensure schemas are in sync
func MigrateDB(db *gorm.DB) error {
	log.Println("Running database migrations...")
	
	err := db.AutoMigrate(
		&models.User{},
		&models.Restaurant{},
		&models.Category{},
		&models.Food{},
		&models.Address{},
		&models.Cart{},
		&models.CartItem{},
		&models.Order{},
		&models.OrderItem{},
		&models.Review{},
	)
	if err != nil {
		return err
	}

	log.Println("Database migrations completed successfully")
	return nil
}
