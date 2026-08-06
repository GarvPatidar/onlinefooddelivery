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
	cartRepo := repositories.NewCartRepository(db)
	addressRepo := repositories.NewAddressRepository(db)
	orderRepo := repositories.NewOrderRepository(db)

	// Initialize Services
	userService := services.NewUserService(userRepo, cfg)
	restaurantService := services.NewRestaurantService(restaurantRepo)
	foodService := services.NewFoodService(foodRepo, restaurantRepo)
	cartService := services.NewCartService(cartRepo, foodRepo)
	addressService := services.NewAddressService(addressRepo)
	orderService := services.NewOrderService(orderRepo, cartRepo, addressRepo, restaurantRepo, cfg)

	// Initialize Controllers
	authController := controllers.NewAuthController(userService)
	restaurantController := controllers.NewRestaurantController(restaurantService)
	foodController := controllers.NewFoodController(foodService)
	cartController := controllers.NewCartController(cartService)
	addressController := controllers.NewAddressController(addressService)
	orderController := controllers.NewOrderController(orderService)

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

			// Cart Routes
			protected.GET("/cart", cartController.GetCart)
			protected.POST("/cart/items", cartController.UpdateCartItem)
			protected.DELETE("/cart/items/:foodId", cartController.RemoveCartItem)
			protected.DELETE("/cart", cartController.ClearCart)

			// Address Routes
			protected.GET("/addresses", addressController.GetAddresses)
			protected.POST("/addresses", addressController.CreateAddress)

			// Order & Payment Routes
			protected.POST("/orders/checkout", orderController.Checkout)
			protected.POST("/orders/verify", orderController.VerifyPayment)
			protected.GET("/orders/my", orderController.GetMyOrders)
			protected.GET("/owner/orders", orderController.GetOwnerOrders)
			protected.PATCH("/orders/:id/status", orderController.UpdateOrderStatus)
		}

		// Public Restaurant and Food Routes
		api.GET("/restaurants", restaurantController.GetAllRestaurants)
		api.GET("/restaurants/:id", restaurantController.GetRestaurantByID)
		api.GET("/restaurants/:id/foods", foodController.GetFoodsByRestaurantID)
	}

	return r
}
