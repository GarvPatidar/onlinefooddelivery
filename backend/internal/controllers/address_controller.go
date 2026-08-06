package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"onlinefooddelivery/backend/internal/dto"
	"onlinefooddelivery/backend/internal/services"
)

type AddressController struct {
	addressService services.AddressService
}

func NewAddressController(addressService services.AddressService) *AddressController {
	return &AddressController{addressService: addressService}
}

func (ctrl *AddressController) CreateAddress(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "error": "unauthorized"})
		return
	}

	var req dto.CreateAddressRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": err.Error()})
		return
	}

	response, err := ctrl.addressService.CreateAddress(c.Request.Context(), userID.(string), &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"success": true, "data": response})
}

func (ctrl *AddressController) GetAddresses(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "error": "unauthorized"})
		return
	}

	response, err := ctrl.addressService.GetAddressesByUserID(c.Request.Context(), userID.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": response})
}
