package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"onlinefooddelivery/backend/internal/dto"
	"onlinefooddelivery/backend/internal/services"
)

type RestaurantController struct {
	restaurantService services.RestaurantService
}

func NewRestaurantController(restaurantService services.RestaurantService) *RestaurantController {
	return &RestaurantController{restaurantService: restaurantService}
}

// CreateRestaurant handles creating a new restaurant
func (ctrl *RestaurantController) CreateRestaurant(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "error": "unauthorized"})
		return
	}

	// Verify the user is a restaurant owner
	role, exists := c.Get("role")
	if !exists || role.(string) != "restaurant_owner" {
		c.JSON(http.StatusForbidden, gin.H{"success": false, "error": "forbidden: only restaurant owners can create restaurants"})
		return
	}

	var req dto.CreateRestaurantRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": err.Error()})
		return
	}

	response, err := ctrl.restaurantService.CreateRestaurant(c.Request.Context(), userID.(string), &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"success": true, "data": response})
}

// UpdateRestaurant handles updating an existing restaurant
func (ctrl *RestaurantController) UpdateRestaurant(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "error": "unauthorized"})
		return
	}

	restaurantID := c.Param("id")

	var req dto.UpdateRestaurantRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": err.Error()})
		return
	}

	response, err := ctrl.restaurantService.UpdateRestaurant(c.Request.Context(), userID.(string), restaurantID, &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": response})
}

// GetRestaurantByID handles fetching a single restaurant by ID
func (ctrl *RestaurantController) GetRestaurantByID(c *gin.Context) {
	id := c.Param("id")

	response, err := ctrl.restaurantService.GetRestaurantByID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": response})
}

// GetMyRestaurant handles fetching the current owner's restaurant
func (ctrl *RestaurantController) GetMyRestaurant(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "error": "unauthorized"})
		return
	}

	response, err := ctrl.restaurantService.GetRestaurantByOwnerID(c.Request.Context(), userID.(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": response})
}

// GetAllRestaurants handles fetching all restaurants
func (ctrl *RestaurantController) GetAllRestaurants(c *gin.Context) {
	response, err := ctrl.restaurantService.GetAllRestaurants(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": response})
}
