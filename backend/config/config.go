package config

import (
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type Config struct {
	Port              string
	DatabaseURL       string
	JWTSecret         string
	RazorpayKeyID     string
	RazorpayKeySecret string
}

func LoadConfig() *Config {
	// Load .env file if it exists, otherwise rely on system env vars
	if err := godotenv.Load(); err != nil {
		log.Println("Warning: .env file not found, using system environment variables")
	}

	return &Config{
		Port:              getEnv("PORT", "8080"),
		DatabaseURL:       getEnv("DATABASE_URL", "host=localhost user=postgres password=postgres dbname=online_food_delivery port=5432 sslmode=disable"),
		JWTSecret:         getEnv("JWT_SECRET", "supersecretkey"),
		RazorpayKeyID:     getEnv("RAZORPAY_KEY_ID", ""),
		RazorpayKeySecret: getEnv("RAZORPAY_KEY_SECRET", ""),
	}
}

func InitDB(cfg *Config) (*gorm.DB, error) {
	// GORM Open works directly with either DSN format or standard postgres:// URLs
	db, err := gorm.Open(postgres.Open(cfg.DatabaseURL), &gorm.Config{})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	log.Println("Database connection established successfully")
	return db, nil
}

func getEnv(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
}
