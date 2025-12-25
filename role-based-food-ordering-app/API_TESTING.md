# API Testing Guide

## Base URL
```
http://localhost:5000/api
```

## Authentication Endpoints

### 1. Login
```
POST /api/auth/login
Content-Type: application/json

Body:
{
  "email": "marvel@nick.fury",
  "password": "password123"
}

Response:
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Captain Marvel",
    "email": "marvel@nick.fury",
    "role": "Admin",
    "location": "India"
  }
}
```

### 2. Register
```
POST /api/auth/register
Content-Type: application/json

Body:
{
  "name": "New User",
  "email": "newuser@example.com",
  "password": "password123",
  "role": "Member",
  "location": "India"
}
```

## Food Items Endpoints

### 3. Get All Food Items
```
GET /api/food/items
Authorization: Bearer <token>
```

### 4. Add Food Item (Admin/Manager only)
```
POST /api/food/items
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "name": "New Dish",
  "description": "Delicious food",
  "price": 15.99
}
```

### 5. Update Food Item (Admin/Manager only)
```
PUT /api/food/items/1
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "name": "Updated Name",
  "price": 18.99,
  "available": 1
}
```

## Orders Endpoints

### 6. Get Orders
```
GET /api/food/orders
Authorization: Bearer <token>
```

### 7. Create Order
```
POST /api/food/orders
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "items": [
    {
      "food_item_id": 1,
      "quantity": 2
    },
    {
      "food_item_id": 3,
      "quantity": 1
    }
  ],
  "payment_method": "Credit Card"
}
```

### 8. Update Order Status (Admin/Manager only)
```
PATCH /api/food/orders/1
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "status": "completed"
}
```

### 9. Update Payment Method
```
PATCH /api/food/orders/1/payment
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "payment_method": "PayPal"
}
```

## Testing Access Control

### Test 1: Member from America/Wakanda tries to create order
```
Login as: thor@nick.fury / password123
POST /api/food/orders
Authorization: Bearer <token>

Expected: 403 Forbidden with message about location restrictions
```

### Test 2: Member tries to add food item
```
Login as: thanos@nick.fury / password123
POST /api/food/items
Authorization: Bearer <token>

Expected: 403 Forbidden - insufficient permissions
```

### Test 3: Admin/Manager can do everything
```
Login as: marvel@nick.fury / password123
All endpoints should work successfully
```
