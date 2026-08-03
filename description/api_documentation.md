# API Documentation (v1)

This document contains a comprehensive description of the REST API endpoints, security authentication flow, validations, data transfer object (DTO) models, and request/response payloads.

---

## 🔑 Authentication & Global Configurations

### Base URL:
`http://localhost:8080/api/v1`

### Request Headers:
- **`Content-Type`**: `application/json` (Required for all `POST`, `PUT`, `PATCH` operations)
- **`Authorization`**: `Bearer <JWT_TOKEN>` (Required for all protected endpoints)

### Authentication Flow:
1. A user signs up (`/auth/register`) or logs in (`/auth/login`) with credentials.
2. The server authenticates credentials and signs a JSON Web Token (JWT) with claims containing the user's `ID` and `Role`.
3. The server replies with a token, which the frontend stores in `localStorage`.
4. For protected routes, the frontend attaches the header `Authorization: Bearer <token>`.
5. The backend middleware (`backend/internal/middleware/auth.go`) decodes the token, validates its expiry and signature, and stores `user_id` and `role` context variables inside the current request execution context for controllers to access.

---

## 🛡️ Authentication Endpoints (`/api/v1/auth`)

### 1. Register User
- **Route**: `POST /auth/register`
- **Authentication**: Public
- **Request Body (JSON)**:
  ```json
  {
    "name": "John Doe",
    "email": "john.doe@example.com",
    "password": "strongpassword123",
    "role": "customer"
  }
  ```
- **Validation Rules**:
  - `name`: String, required, length 2 to 100 characters.
  - `email`: String, required, valid email format.
  - `password`: String, required, length 6 to 50 characters.
  - `role`: String, required, must be exactly `"customer"` or `"restaurant_owner"`.
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": "e8c8959d-64de-4d7a-b9c1-4b13ee42a6c1",
        "name": "John Doe",
        "email": "john.doe@example.com",
        "role": "customer"
      }
    }
  }
  ```

---

### 2. Login User
- **Route**: `POST /auth/login`
- **Authentication**: Public
- **Request Body (JSON)**:
  ```json
  {
    "email": "john.doe@example.com",
    "password": "strongpassword123"
  }
  ```
- **Validation Rules**:
  - `email`: String, required, valid email.
  - `password`: String, required.
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": "e8c8959d-64de-4d7a-b9c1-4b13ee42a6c1",
        "name": "John Doe",
        "email": "john.doe@example.com",
        "role": "customer"
      }
    }
  }
  ```

---

### 3. Get Current User Profile (`/me`)
- **Route**: `GET /auth/me`
- **Authentication**: Protected
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "e8c8959d-64de-4d7a-b9c1-4b13ee42a6c1",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "role": "customer"
    }
  }
  ```

---

### 4. Update User Profile
- **Route**: `PUT /auth/profile`
- **Authentication**: Protected
- **Request Body (JSON)**:
  ```json
  {
    "name": "Johnathan Doe"
  }
  ```
- **Validation Rules**:
  - `name`: String, required, length 2 to 100 characters.
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "e8c8959d-64de-4d7a-b9c1-4b13ee42a6c1",
      "name": "Johnathan Doe",
      "email": "john.doe@example.com",
      "role": "customer"
    }
  }
  ```

---

### 5. Change Password
- **Route**: `PUT /auth/change-password`
- **Authentication**: Protected
- **Request Body (JSON)**:
  ```json
  {
    "old_password": "strongpassword123",
    "new_password": "newsuperpassword456"
  }
  ```
- **Validation Rules**:
  - `old_password`: String, required.
  - `new_password`: String, required, length 6 to 50 characters.
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Password changed successfully"
  }
  ```

---

## 🍽️ Restaurant Endpoints (`/api/v1/restaurants`)

### 1. Create Restaurant
- **Route**: `POST /api/v1/restaurants`
- **Authentication**: Protected (Role must be `"restaurant_owner"`)
- **Request Body (JSON)**:
  ```json
  {
    "name": "The Gourmet Hub",
    "description": "Authentic Italian and Mediterranean dishes.",
    "address": "123 Food Street, Sector 5",
    "city": "Mumbai",
    "opening_time": "11:00",
    "closing_time": "23:00",
    "image": "/uploads/restaurants/gourmet.jpg"
  }
  ```
- **Validation Rules**:
  - `name`: String, required, length 2 to 150.
  - `description`: String, optional, max 500.
  - `address`: String, required, max 255.
  - `city`: String, required, max 100.
  - `opening_time`: String, required, max 20.
  - `closing_time`: String, required, max 20.
  - `image`: String, optional, max 255.
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "7ac1953d-24fe-4d7a-b9c1-4b13ee42a222",
      "owner_id": "e8c8959d-64de-4d7a-b9c1-4b13ee42a6c1",
      "name": "The Gourmet Hub",
      "description": "Authentic Italian and Mediterranean dishes.",
      "address": "123 Food Street, Sector 5",
      "city": "Mumbai",
      "opening_time": "11:00",
      "closing_time": "23:00",
      "image": "/uploads/restaurants/gourmet.jpg",
      "created_at": "2026-08-03T18:00:00Z"
    }
  }
  ```

---

### 2. Update Restaurant
- **Route**: `PUT /api/v1/restaurants/:id`
- **Authentication**: Protected (Must be the restaurant owner)
- **Request Body (JSON)**: Same as Create Restaurant request structure.
- **Response (200 OK)**: Returns updated Restaurant object.

---

### 3. Get Logged-in Owner's Restaurant
- **Route**: `GET /api/v1/restaurants/my`
- **Authentication**: Protected (Role must be `"restaurant_owner"`)
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "7ac1953d-24fe-4d7a-b9c1-4b13ee42a222",
      "owner_id": "e8c8959d-64de-4d7a-b9c1-4b13ee42a6c1",
      "name": "The Gourmet Hub",
      "description": "Authentic Italian and Mediterranean dishes.",
      "address": "123 Food Street, Sector 5",
      "city": "Mumbai",
      "opening_time": "11:00",
      "closing_time": "23:00",
      "image": "/uploads/restaurants/gourmet.jpg",
      "created_at": "2026-08-03T18:00:00Z"
    }
  }
  ```

---

### 4. Get All Restaurants
- **Route**: `GET /api/v1/restaurants`
- **Authentication**: Public
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "7ac1953d-24fe-4d7a-b9c1-4b13ee42a222",
        "owner_id": "e8c8959d-64de-4d7a-b9c1-4b13ee42a6c1",
        "name": "The Gourmet Hub",
        "description": "Authentic Italian and Mediterranean dishes.",
        "address": "123 Food Street, Sector 5",
        "city": "Mumbai",
        "opening_time": "11:00",
        "closing_time": "23:00",
        "image": "/uploads/restaurants/gourmet.jpg",
        "created_at": "2026-08-03T18:00:00Z"
      }
    ]
  }
  ```

---

### 5. Get Restaurant by ID
- **Route**: `GET /api/v1/restaurants/:id`
- **Authentication**: Public
- **Response (200 OK)**: Returns the matching Restaurant object.

---

## 🍕 Menu & Food Endpoints

### 1. Add Food Item
- **Route**: `POST /api/v1/restaurants/:id/foods` (where `:id` is the Restaurant ID)
- **Authentication**: Protected (Owner of the restaurant only)
- **Request Body (JSON)**:
  ```json
  {
    "name": "Margherita Pizza",
    "description": "Classic sourdough crust topped with fresh mozzarella and basil.",
    "price": 12.99,
    "image": "/uploads/foods/margherita.jpg",
    "availability": true
  }
  ```
- **Validation Rules**:
  - `name`: String, required, length 2 to 150.
  - `description`: String, optional, max 500.
  - `price`: Decimal/float, required, must be greater than 0.
  - `image`: String, optional, max 255.
  - `availability`: Boolean, required pointer field (to allow explicit false binding).
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "8bc2959a-11ce-4d7a-b9c1-4b13ee42a333",
      "restaurant_id": "7ac1953d-24fe-4d7a-b9c1-4b13ee42a222",
      "name": "Margherita Pizza",
      "description": "Classic sourdough crust topped with fresh mozzarella and basil.",
      "price": 12.99,
      "image": "/uploads/foods/margherita.jpg",
      "availability": true,
      "created_at": "2026-08-03T18:15:00Z"
    }
  }
  ```

---

### 2. Update Food Item
- **Route**: `PUT /api/v1/foods/:id` (where `:id` is the Food Item ID)
- **Authentication**: Protected (Owner of the restaurant only)
- **Request Body (JSON)**: Same as Add Food Item request structure.
- **Response (200 OK)**: Returns the updated Food object.

---

### 3. Delete Food Item
- **Route**: `DELETE /api/v1/foods/:id` (where `:id` is the Food Item ID)
- **Authentication**: Protected (Owner of the restaurant only)
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Food item deleted successfully"
  }
  ```

---

### 4. Get Menu of a Restaurant
- **Route**: `GET /api/v1/restaurants/:id/foods` (where `:id` is the Restaurant ID)
- **Authentication**: Public
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "8bc2959a-11ce-4d7a-b9c1-4b13ee42a333",
        "restaurant_id": "7ac1953d-24fe-4d7a-b9c1-4b13ee42a222",
        "name": "Margherita Pizza",
        "description": "Classic sourdough crust topped with fresh mozzarella and basil.",
        "price": 12.99,
        "image": "/uploads/foods/margherita.jpg",
        "availability": true,
        "created_at": "2026-08-03T18:15:00Z"
      }
    ]
  }
  ```
