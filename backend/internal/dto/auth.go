package dto

// RegisterRequest holds validation rules and fields for user registration
type RegisterRequest struct {
	Name     string `json:"name" binding:"required,min=2,max=100"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6,max=50"`
	Role     string `json:"role" binding:"required,oneof=customer restaurant_owner"`
}

// LoginRequest holds validation rules and fields for user login
type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// UserResponse defines the user profile format returned in API responses
type UserResponse struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
	Role  string `json:"role"`
}

// AuthResponse defines the payload returned upon successful signup or login
type AuthResponse struct {
	Token string       `json:"token"`
	User  UserResponse `json:"user"`
}

// ChangePasswordRequest holds fields for password updates
type ChangePasswordRequest struct {
	OldPassword string `json:"old_password" binding:"required"`
	NewPassword string `json:"new_password" binding:"required,min=6,max=50"`
}

// UpdateProfileRequest holds fields for user profile updates
type UpdateProfileRequest struct {
	Name string `json:"name" binding:"required,min=2,max=100"`
}
