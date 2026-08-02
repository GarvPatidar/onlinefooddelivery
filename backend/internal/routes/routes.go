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
	restaurantRepo := repositories.NewRestaurantRepository(db)
	foodRepo := repositories.NewFoodRepository(db)

	// Initialize Services
	userService := services.NewUserService(userRepo, cfg)
	restaurantService := services.NewRestaurantService(restaurantRepo)
	foodService := services.NewFoodService(foodRepo, restaurantRepo)

	// Initialize Controllers
	authController := controllers.NewAuthController(userService)
	restaurantController := controllers.NewRestaurantController(restaurantService)
	foodController := controllers.NewFoodController(foodService)

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

		// Protected Restaurant and Food Routes
		protected := api.Group("")
		protected.Use(middleware.AuthMiddleware(cfg.JWTSecret))
		{
			protected.POST("/restaurants", restaurantController.CreateRestaurant)
			protected.PUT("/restaurants/:id", restaurantController.UpdateRestaurant)
			protected.GET("/restaurants/my", restaurantController.GetMyRestaurant)
			
			protected.POST("/restaurants/:id/foods", foodController.AddFood)
			protected.PUT("/foods/:id", foodController.UpdateFood)
			protected.DELETE("/foods/:id", foodController.DeleteFood)
		}

		// Public Restaurant and Food Routes
		api.GET("/restaurants", restaurantController.GetAllRestaurants)
		api.GET("/restaurants/:id", restaurantController.GetRestaurantByID)
		api.GET("/restaurants/:id/foods", foodController.GetFoodsByRestaurantID)
	}

	return r
}
