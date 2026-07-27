package routes

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"onlinefooddelivery/backend/config"
	"onlinefooddelivery/backend/internal/controllers"
	"onlinefooddelivery/backend/internal/middleware"
	"onlinefooddelivery/backend/internal/repositories"
	"onlinefooddelivery/backend/internal/services"
)

// SetupRouter initializes routes and hooks up middlewares, controllers, services, and repositories
func SetupRouter(db *gorm.DB, cfg *config.Config) *gin.Engine {
	r := gin.Default()

	// Global Middleware
	r.Use(middleware.CORSMiddleware())

	// Initialize Repositories
	userRepo := repositories.NewUserRepository(db)

	// Initialize Services
	userService := services.NewUserService(userRepo, cfg)

	// Initialize Controllers
	authController := controllers.NewAuthController(userService)

	// API Groups
	api := r.Group("/api/v1")
	{
		// Public Auth Routes
		authPublic := api.Group("/auth")
		{
			authPublic.POST("/register", authController.Register)
			authPublic.POST("/login", authController.Login)
		}

		// Protected Auth Routes
		authProtected := api.Group("/auth")
		authProtected.Use(middleware.AuthMiddleware(cfg.JWTSecret))
		{
			authProtected.GET("/me", authController.GetMe)
			authProtected.PUT("/profile", authController.UpdateProfile)
			authProtected.PUT("/change-password", authController.ChangePassword)
		}
	}

	return r
}
