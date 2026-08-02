package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"onlinefooddelivery/backend/internal/dto"
	"onlinefooddelivery/backend/internal/services"
)

type FoodController struct {
	foodService services.FoodService
}

func NewFoodController(foodService services.FoodService) *FoodController {
	return &FoodController{foodService: foodService}
}

// AddFood handles adding a food item to a restaurant
func (ctrl *FoodController) AddFood(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "error": "unauthorized"})
		return
	}

	restaurantID := c.Param("id")

	var req dto.CreateFoodRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": err.Error()})
		return
	}

	response, err := ctrl.foodService.AddFood(c.Request.Context(), userID.(string), restaurantID, &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"success": true, "data": response})
}

// UpdateFood handles updating a food item
func (ctrl *FoodController) UpdateFood(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "error": "unauthorized"})
		return
	}

	foodID := c.Param("id")

	var req dto.UpdateFoodRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": err.Error()})
		return
	}

	response, err := ctrl.foodService.UpdateFood(c.Request.Context(), userID.(string), foodID, &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": response})
}

// DeleteFood handles deleting a food item
func (ctrl *FoodController) DeleteFood(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "error": "unauthorized"})
		return
	}

	foodID := c.Param("id")

	err := ctrl.foodService.DeleteFood(c.Request.Context(), userID.(string), foodID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Food item deleted successfully"})
}

// GetFoodsByRestaurantID handles fetching all food items for a restaurant
func (ctrl *FoodController) GetFoodsByRestaurantID(c *gin.Context) {
	restaurantID := c.Param("id")

	response, err := ctrl.foodService.GetFoodsByRestaurantID(c.Request.Context(), restaurantID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": response})
}
