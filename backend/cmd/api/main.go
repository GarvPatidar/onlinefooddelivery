package main

import (
	"log"
	"net/http"

	"onlinefooddelivery/backend/config"
	"onlinefooddelivery/backend/database"
	"onlinefooddelivery/backend/internal/routes"
)

func main() {
	log.Println("Starting Online Food Delivery backend server...")

	// 1. Load configuration
	cfg := config.LoadConfig()

	// 2. Initialize GORM Database
	db, err := config.InitDB(cfg)
	if err != nil {
		log.Fatalf("Database initialization failed: %v", err)
	}

	// 3. Run GORM Auto-Migrations
	if err := database.MigrateDB(db); err != nil {
		log.Fatalf("Database migration failed: %v", err)
	}

	// 4. Setup Router  
	router := routes.SetupRouter(db, cfg)

	// 5. Start Server
	serverAddr := ":" + cfg.Port
	log.Printf("Server is running on http://localhost%s", serverAddr)
	if err := http.ListenAndServe(serverAddr, router); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
