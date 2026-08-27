# Cruise3D Backend API Documentation

This document is a frontend-oriented reference for the Cruise3D backend API.
It is based on the current controller and DTO code in this repository.

## Base Information

- Base URL: `/api`
- Content-Type: `application/json`
- Auth scheme: `Authorization: Bearer <jwt>`

## Standard Response Format

Most endpoints return the shared wrapper below:

```json
{
  "success": true,
  "message": "Success",
  "data": {}
}
```

Failure responses use the same shape with `success: false`.

## Authentication

Register and login return an `AuthResponseDto`.

```json
{
  "token": "jwt-token",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "customer"
}
```

## Common Status Codes

- `200 OK`: Successful request
- `201 Created`: Resource created
- `400 Bad Request`: Validation or business rule failure
- `401 Unauthorized`: Missing/invalid token
- `403 Forbidden`: Authenticated but wrong role
- `404 Not Found`: Resource does not exist
- `409 Conflict`: Duplicate resource or conflict

## Authentication Endpoints

### POST `/api/auth/register`

Public endpoint to create a new account.

Request body:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secret123",
  "phone": "+91-9876543210"
}
```

Field rules:

- `name`: required, max 100 characters
- `email`: required, valid email
- `password`: required, minimum 6 characters
- `phone`: optional

Example response:

```json
{
  "success": true,
  "message": "Registration successful.",
  "data": {
    "token": "jwt-token",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer"
  }
}
```

### POST `/api/auth/login`

Public endpoint for login.

Request body:

```json
{
  "email": "john@example.com",
  "password": "secret123"
}
```

Example response:

```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "token": "jwt-token",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer"
  }
}
```

### GET `/api/auth/me`

Requires authentication. Returns the current user profile.

Headers:

```http
Authorization: Bearer jwt-token
```

Example response:

```json
{
  "success": true,
  "message": "Success",
  "data": {
    "token": "jwt-token",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer"
  }
}
```

## Product Endpoints

### GET `/api/products`

Public catalog endpoint with filtering and pagination.

Query parameters:

- `categoryId` - optional `Guid`
- `search` - optional search text
- `minPrice` - optional minimum price
- `maxPrice` - optional maximum price
- `sortBy` - default `newest`
- `page` - default `1`
- `pageSize` - default `12`

Example request:

```http
GET /api/products?search=dragon&categoryId=4f6d5b2a-3f0a-4f3f-9d2f-1c2f3b8d2a11&minPrice=100&maxPrice=500&sortBy=price_asc&page=1&pageSize=12
```

Response shape:

```json
{
  "success": true,
  "message": "Success",
  "data": {
    "items": [
      {
        "id": "b6d9b1e8-4f7b-4a6e-a6c3-8f3d5d1c1f11",
        "title": "Dragon Miniature",
        "price": 299,
        "stock": 14,
        "isInStock": true,
        "categoryName": "Miniatures",
        "colorType": "custom",
        "primaryImageUrl": "https://cdn.example.com/products/dragon.jpg",
        "averageRating": 4.7,
        "reviewCount": 18
      }
    ],
    "total": 1,
    "page": 1,
    "pageSize": 12,
    "totalPages": 1
  }
}
```

### GET `/api/products/featured`

Public endpoint for featured products.

Example response:

```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": "b6d9b1e8-4f7b-4a6e-a6c3-8f3d5d1c1f11",
      "title": "Dragon Miniature",
      "price": 299,
      "stock": 14,
      "isInStock": true,
      "categoryName": "Miniatures",
      "colorType": "custom",
      "primaryImageUrl": "https://cdn.example.com/products/dragon.jpg",
      "averageRating": 4.7,
      "reviewCount": 18
    }
  ]
}
```

### GET `/api/products/bestsellers`

Public endpoint for best-selling products.

Example response:

```json
{
  "success": true,
  "message": "Success",
  "data": []
}
```

### GET `/api/products/{id}`

Public detailed product endpoint.

Example response:

```json
{
  "success": true,
  "message": "Success",
  "data": {
    "id": "b6d9b1e8-4f7b-4a6e-a6c3-8f3d5d1c1f11",
    "title": "Dragon Miniature",
    "description": "High detail 3D printed dragon",
    "sku": "DRAGON-001",
    "price": 299,
    "stock": 14,
    "material": "PLA",
    "weightGrams": 120,
    "dimensions": "15 x 10 x 8 cm",
    "estimatedDelivery": "5-7 business days",
    "colorType": "custom",
    "defaultColorName": null,
    "defaultColorHex": null,
    "isFeatured": true,
    "isBestseller": false,
    "isActive": true,
    "createdAt": "2026-07-29T10:00:00Z",
    "categoryId": "4f6d5b2a-3f0a-4f3f-9d2f-1c2f3b8d2a11",
    "categoryName": "Miniatures",
    "colors": [
      {
        "id": "0b6c2a8e-4d3a-4d7c-8ad3-3adf1d7a8e11",
        "colorName": "Red",
        "colorHex": "#ff0000",
        "stockOverride": 5,
        "sortOrder": 0
      }
    ],
    "images": [
      {
        "id": "1d7b1b1c-8e2d-4c24-a4a4-4c8d7c2a9f11",
        "url": "https://cdn.example.com/products/dragon-red.jpg",
        "isPrimary": true,
        "sortOrder": 0,
        "productColorId": "0b6c2a8e-4d3a-4d7c-8ad3-3adf1d7a8e11"
      }
    ],
    "specs": [
      {
        "id": "2a6c2e4b-5d7a-4b7f-8b1d-3e6c2c4d1a11",
        "specKey": "Infill",
        "specValue": "20%",
        "sortOrder": 0
      }
    ],
    "averageRating": 4.7,
    "reviewCount": 18
  }
}
```

### POST `/api/products`

Admin only. Creates a new product.

Headers:

```http
Authorization: Bearer admin-jwt-token
```

Request body:

```json
{
  "title": "Dragon Miniature",
  "description": "High detail 3D printed dragon",
  "sku": "DRAGON-001",
  "price": 299,
  "stock": 14,
  "categoryId": "4f6d5b2a-3f0a-4f3f-9d2f-1c2f3b8d2a11",
  "material": "PLA",
  "weightGrams": 120,
  "dimensions": "15 x 10 x 8 cm",
  "estimatedDelivery": "5-7 business days",
  "colorType": "custom",
  "defaultColorName": null,
  "defaultColorHex": null,
  "colors": [
    {
      "colorName": "Red",
      "colorHex": "#ff0000",
      "stockOverride": 5,
      "sortOrder": 0
    }
  ],
  "specs": [
    {
      "specKey": "Infill",
      "specValue": "20%",
      "sortOrder": 0
    }
  ],
  "isFeatured": true,
  "isBestseller": false
}
```

Field notes:

- `title` required
- `sku` required and must be unique
- `price` required
- `stock` optional but typically sent
- `colorType` required, expected values are `fixed` or `custom`
- `colors` is used when `colorType = custom`
- `defaultColorName` and `defaultColorHex` are used when `colorType = fixed`

Example response:

```json
{
  "success": true,
  "message": "Product created successfully.",
  "data": {
    "id": "b6d9b1e8-4f7b-4a6e-a6c3-8f3d5d1c1f11",
    "title": "Dragon Miniature",
    "sku": "DRAGON-001",
    "price": 299,
    "stock": 14,
    "colorType": "custom",
    "isFeatured": true,
    "isBestseller": false,
    "isActive": true
  }
}
```

### PUT `/api/products/{id}`

Admin only. Updates an existing product.

Request body is partial and all fields are optional.

Example body:

```json
{
  "price": 349,
  "stock": 10,
  "isFeatured": true
}
```

Example response:

```json
{
  "success": true,
  "message": "Product updated successfully.",
  "data": {
    "id": "b6d9b1e8-4f7b-4a6e-a6c3-8f3d5d1c1f11",
    "title": "Dragon Miniature",
    "sku": "DRAGON-001",
    "price": 349,
    "stock": 10
  }
}
```

### DELETE `/api/products/{id}`

Admin only. Performs a soft delete.

Example response:

```json
{
  "success": true,
  "message": "Product deleted successfully.",
  "data": "Product deleted."
}
```

## Cart Endpoints

All cart routes require a customer token.

### GET `/api/cart`

Returns the logged-in customer's cart.

Example response:

```json
{
  "success": true,
  "message": "Success",
  "data": {
    "items": [
      {
        "id": "c3d9b1e8-4f7b-4a6e-a6c3-8f3d5d1c1f11",
        "productId": "b6d9b1e8-4f7b-4a6e-a6c3-8f3d5d1c1f11",
        "productTitle": "Dragon Miniature",
        "productImageUrl": "https://cdn.example.com/products/dragon.jpg",
        "price": 299,
        "quantity": 2,
        "itemTotal": 598,
        "productColorId": "0b6c2a8e-4d3a-4d7c-8ad3-3adf1d7a8e11",
        "colorName": "Red",
        "colorHex": "#ff0000",
        "availableStock": 5
      }
    ],
    "subtotal": 598,
    "totalItems": 2
  }
}
```

### POST `/api/cart`

Add an item to the cart.

Request body:

```json
{
  "productId": "b6d9b1e8-4f7b-4a6e-a6c3-8f3d5d1c1f11",
  "productColorId": "0b6c2a8e-4d3a-4d7c-8ad3-3adf1d7a8e11",
  "quantity": 2
}
```

Field notes:

- `productId` required
- `productColorId` optional unless the product uses custom colors
- `quantity` must be at least 1

Example response:

```json
{
  "success": true,
  "message": "Item added to cart.",
  "data": {
    "items": [],
    "subtotal": 598,
    "totalItems": 2
  }
}
```

### PUT `/api/cart/{cartId}`

Update cart item quantity.

Request body:

```json
{
  "quantity": 3
}
```

Example response:

```json
{
  "success": true,
  "message": "Cart updated.",
  "data": {
    "items": [],
    "subtotal": 897,
    "totalItems": 3
  }
}
```

### DELETE `/api/cart/{cartId}`

Remove a cart item.

Example response:

```json
{
  "success": true,
  "message": "Item removed from cart.",
  "data": {
    "items": [],
    "subtotal": 0,
    "totalItems": 0
  }
}
```

### DELETE `/api/cart`

Clear the whole cart.

Example response:

```json
{
  "success": true,
  "message": "Success",
  "data": "Cart cleared."
}
```

## Order Endpoints

All order routes require authentication.

### POST `/api/orders`

Customer only. Creates an order from the current cart.

Request body:

```json
{
  "addressId": "2c6d5a8e-4f7b-4a6e-a6c3-8f3d5d1c1f11",
  "paymentProvider": "razorpay",
  "paymentId": "pay_1234567890"
}
```

Field notes:

- `addressId` required
- `paymentProvider` required, default `razorpay`
- `paymentId` optional and usually supplied after frontend payment success

Example response:

```json
{
  "success": true,
  "message": "Order placed successfully.",
  "data": {
    "id": "8f6d5a8e-4f7b-4a6e-a6c3-8f3d5d1c1f11",
    "subtotal": 598,
    "shippingCharge": 60,
    "totalAmount": 658,
    "status": "pending",
    "paymentStatus": "unpaid",
    "paymentId": "pay_1234567890",
    "placedAt": "2026-07-29T11:30:00Z",
    "address": {
      "fullName": "John Doe",
      "addressLine": "12 Main Road",
      "city": "Pune",
      "state": "Maharashtra",
      "pincode": "411001"
    },
    "items": [
      {
        "id": "d3d9b1e8-4f7b-4a6e-a6c3-8f3d5d1c1f11",
        "productId": "b6d9b1e8-4f7b-4a6e-a6c3-8f3d5d1c1f11",
        "productTitle": "Dragon Miniature",
        "productImageUrl": "https://cdn.example.com/products/dragon.jpg",
        "quantity": 2,
        "priceAtPurchase": 299,
        "itemTotal": 598,
        "colorName": "Red",
        "colorHex": "#ff0000"
      }
    ]
  }
}
```

### GET `/api/orders/my`

Customer only. Returns the logged-in customer's order history.

Example response:

```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": "8f6d5a8e-4f7b-4a6e-a6c3-8f3d5d1c1f11",
      "subtotal": 598,
      "shippingCharge": 60,
      "totalAmount": 658,
      "status": "pending",
      "paymentStatus": "unpaid",
      "paymentId": "pay_1234567890",
      "placedAt": "2026-07-29T11:30:00Z",
      "address": {
        "fullName": "John Doe",
        "addressLine": "12 Main Road",
        "city": "Pune",
        "state": "Maharashtra",
        "pincode": "411001"
      },
      "items": []
    }
  ]
}
```

### GET `/api/orders/my/{orderId}`

Customer only. Returns a single order only if it belongs to the current customer.

Example response:

```json
{
  "success": true,
  "message": "Success",
  "data": {
    "id": "8f6d5a8e-4f7b-4a6e-a6c3-8f3d5d1c1f11",
    "subtotal": 598,
    "shippingCharge": 60,
    "totalAmount": 658,
    "status": "pending",
    "paymentStatus": "unpaid",
    "paymentId": "pay_1234567890",
    "placedAt": "2026-07-29T11:30:00Z",
    "address": {
      "fullName": "John Doe",
      "addressLine": "12 Main Road",
      "city": "Pune",
      "state": "Maharashtra",
      "pincode": "411001"
    },
    "items": []
  }
}
```

### GET `/api/orders`

Admin only. Lists all orders with optional status filtering.

Query parameters:

- `status` - optional order status
- `page` - default `1`
- `pageSize` - default `20`

Example request:

```http
GET /api/orders?status=pending&page=1&pageSize=20
```

Example response:

```json
{
  "success": true,
  "message": "Success",
  "data": {
    "items": [],
    "total": 0,
    "page": 1,
    "pageSize": 20,
    "totalPages": 0
  }
}
```

### PUT `/api/orders/{orderId}/status`

Admin only. Updates order status.

Request body:

```json
{
  "status": "confirmed"
}
```

Accepted statuses in the database currently include:

- `pending`
- `confirmed`
- `printing`
- `shipped`
- `delivered`
- `cancelled`

Example response:

```json
{
  "success": true,
  "message": "Order status updated.",
  "data": {
    "id": "8f6d5a8e-4f7b-4a6e-a6c3-8f3d5d1c1f11",
    "status": "confirmed"
  }
}
```

## Payment Endpoints

Payments use Razorpay as the provider. The typical flow is:

- Customer requests a Razorpay order from the server (server creates a Razorpay order and stores a payment intent).
- Frontend completes payment using Razorpay Checkout.
- Frontend posts the Razorpay payment result back to the server to verify the signature and finalize the order.

All payment-related endpoints require the authenticated user to have the `customer` role unless otherwise noted.

### POST `/api/payments/create-order`

Customer only. Creates a Razorpay order for the current user's cart and returns the order id and checkout details.

Request body: none

Example response:

```json
{
  "success": true,
  "message": "Success",
  "data": {
    "orderId": "order_9A33XWu170gUtm",
    "amount": 65800,
    "currency": "INR",
    "key": "rzp_test_TMSkzp2w2veJtm",
    "checkoutSummary": {
      "subtotal": 598,
      "shippingCharge": 60,
      "totalAmount": 658
    }
  }
}
```

### POST `/api/payments/verify`

Customer only. Verify a completed Razorpay payment and create the corresponding order in the system.

Request body (JSON):

```json
{
  "razorpayOrderId": "order_9A33XWu170gUtm",
  "razorpayPaymentId": "pay_29QQoUBi66xm2f",
  "razorpaySignature": "5f2b4e...",
  "addressId": "2c6d5a8e-4f7b-4a6e-a6c3-8f3d5d1c1f11"  // optional: if omitted server uses user's default address
}
```

Example response:

```json
{
  "success": true,
  "message": "Payment verified and order created.",
  "data": {
    "orderId": "8f6d5a8e-4f7b-4a6e-a6c3-8f3d5d1c1f11",
    "paymentStatus": "paid",
    "orderStatus": "pending",
    "paymentId": "pay_29QQoUBi66xm2f",
    "totalAmount": 658
  }
}
```

### GET `/api/payments/test-connection`

Public endpoint (no auth). Useful in development to validate that the Razorpay API keys configured on the server are valid.

Response:

- `200 OK` when the connection and credentials are valid. Example message: "Razorpay connection successful." 
- `500` when the server fails to contact Razorpay or the credentials are invalid. Example message: "Razorpay connection failed. Check keys in configuration."

Example call:

```bash
curl http://localhost:5000/api/payments/test-connection
```

## Category Endpoints

### GET `/api/categories`

Public endpoint returning all categories.

Example response:

```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": "4f6d5b2a-3f0a-4f3f-9d2f-1c2f3b8d2a11",
      "name": "Miniatures",
      "slug": "miniatures",
      "iconUrl": "https://cdn.example.com/icons/miniatures.svg",
      "sortOrder": 1
    }
  ]
}
```

### GET `/api/categories/{id}`

Public endpoint for one category.

Example response:

```json
{
  "success": true,
  "message": "Success",
  "data": {
    "id": "4f6d5b2a-3f0a-4f3f-9d2f-1c2f3b8d2a11",
    "name": "Miniatures",
    "slug": "miniatures",
    "iconUrl": "https://cdn.example.com/icons/miniatures.svg",
    "sortOrder": 1
  }
}
```

### POST `/api/categories`

Admin only. Creates a category.

Request body:

```json
{
  "name": "Miniatures",
  "slug": "miniatures",
  "iconUrl": "https://cdn.example.com/icons/miniatures.svg"
}
```

Example response:

```json
{
  "success": true,
  "message": "Category created successfully.",
  "data": {
    "id": "4f6d5b2a-3f0a-4f3f-9d2f-1c2f3b8d2a11",
    "name": "Miniatures",
    "slug": "miniatures",
    "iconUrl": "https://cdn.example.com/icons/miniatures.svg",
    "sortOrder": 0
  }
}
```

### PUT `/api/categories/{id}`

Admin only. Updates a category.

Request body:

```json
{
  "name": "Collectibles",
  "slug": "collectibles",
  "iconUrl": "https://cdn.example.com/icons/collectibles.svg"
}
```

Example response:

```json
{
  "success": true,
  "message": "Category updated successfully.",
  "data": {
    "id": "4f6d5b2a-3f0a-4f3f-9d2f-1c2f3b8d2a11",
    "name": "Collectibles",
    "slug": "collectibles",
    "iconUrl": "https://cdn.example.com/icons/collectibles.svg",
    "sortOrder": 0
  }
}
```

### DELETE `/api/categories/{id}`

Admin only. Deletes a category.

Example response:

```json
{
  "success": true,
  "message": "Deleted successfully.",
  "data": "Category deleted."
}
```

## Admin Endpoints

### GET `/api/admin/dashboard`

Admin only. Returns aggregate dashboard metrics.

Example response:

```json
{
  "success": true,
  "message": "Success",
  "data": {
    "totalProducts": 25,
    "totalOrders": 48,
    "totalCustomers": 19,
    "totalRevenue": 12450,
    "pendingOrders": 6,
    "lowStockProducts": [
      {
        "id": "b6d9b1e8-4f7b-4a6e-a6c3-8f3d5d1c1f11",
        "title": "Dragon Miniature",
        "stock": 4,
        "sku": "DRAGON-001"
      }
    ]
  }
}
```

## Upload Endpoints

### GET `/api/upload/signature`

Admin only. Returns the Cloudinary upload signature payload for direct browser uploads.

Query parameters:

- `folder` - optional upload folder, defaults to `cruise3d/products`

Example request:

```http
GET /api/upload/signature?folder=cruise3d/products
```

Example response:

```json
{
  "cloudName": "your-cloud-name",
  "apiKey": "your-api-key",
  "timestamp": "1722250800",
  "signature": "6c4b7f2f7b0a1a2f8f2e3d5c4b1a0f9e7d6c5b4a",
  "folder": "cruise3d/products"
}
```

Frontend usage notes:

- The frontend sends the `timestamp`, `folder`, and `signature` to Cloudinary.
- The server does not return `apiSecret`.
- Keep this endpoint restricted to admin users.

## Reviews Endpoints

### GET `/api/reviews/product/{productId}`

Public endpoint to read reviews for a product.

Example response:

```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": "3a6c2e4b-5d7a-4b7f-8b1d-3e6c2c4d1a11",
      "productId": "b6d9b1e8-4f7b-4a6e-a6c3-8f3d5d1c1f11",
      "customerId": "f2e9d4a1-1d2c-4f5a-8d3a-0c4d3f2a9b11",
      "orderId": "8f6d5a8e-4f7b-4a6e-a6c3-8f3d5d1c1f11",
      "rating": 5,
      "comment": "Great quality and detail.",
      "createdAt": "2026-07-29T12:00:00Z"
    }
  ]
}
```

### POST `/api/reviews`

Customer only. Creates a review.

Request body:

```json
{
  "productId": "b6d9b1e8-4f7b-4a6e-a6c3-8f3d5d1c1f11",
  "orderId": "8f6d5a8e-4f7b-4a6e-a6c3-8f3d5d1c1f11",
  "rating": 5,
  "comment": "Great quality and detail."
}
```

Field notes:

- `productId` required
- `orderId` required
- `rating` required
- `comment` optional

Example response:

```json
{
  "success": true,
  "message": "Review submitted successfully.",
  "data": {
    "id": "3a6c2e4b-5d7a-4b7f-8b1d-3e6c2c4d1a11",
    "rating": 5,
    "comment": "Great quality and detail."
  }
}
```

### DELETE `/api/reviews/{reviewId}`

Customer only. Deletes the current user's review.

Example response:

```json
{
  "success": true,
  "message": "Review deleted.",
  "data": "Success"
}
```

## Offer Endpoints

Manages promotional offer messages displayed in the storefront banner.

### GET `/api/offers/active`

Public endpoint. Returns the currently active offer (the one whose `isActive` flag is true and whose `startDate`/`endDate` window includes the current time). If no offer is active, the response is `200 OK` with `data: null` so the storefront banner can render nothing cleanly.

Example response:

```json
{
  "success": true,
  "message": "Success",
  "data": {
    "id": "3a6c2e4b-5d7a-4b7f-8b1d-3e6c2c4d1a11",
    "message": "Flat 20% off on all 3D printed models — limited time!",
    "startDate": "2026-08-01T00:00:00Z",
    "endDate": "2026-08-31T23:59:59Z",
    "isActive": true,
    "createdAt": "2026-08-01T10:15:00Z",
    "updatedAt": "2026-08-01T10:15:00Z"
  }
}
```

### GET `/api/offers`

Admin only. Lists all offers (active and inactive).

Example response:

```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": "3a6c2e4b-5d7a-4b7f-8b1d-3e6c2c4d1a11",
      "message": "Flat 20% off on all 3D printed models — limited time!",
      "startDate": "2026-08-01T00:00:00Z",
      "endDate": "2026-08-31T23:59:59Z",
      "isActive": true,
      "createdAt": "2026-08-01T10:15:00Z",
      "updatedAt": "2026-08-01T10:15:00Z"
    }
  ]
}
```

### GET `/api/offers/{id}`

Admin only. Returns a single offer by id.

Example response:

```json
{
  "success": true,
  "message": "Success",
  "data": {
    "id": "3a6c2e4b-5d7a-4b7f-8b1d-3e6c2c4d1a11",
    "message": "Flat 20% off on all 3D printed models — limited time!",
    "startDate": "2026-08-01T00:00:00Z",
    "endDate": "2026-08-31T23:59:59Z",
    "isActive": true,
    "createdAt": "2026-08-01T10:15:00Z",
    "updatedAt": "2026-08-01T10:15:00Z"
  }
}
```

### POST `/api/offers`

Admin only. Creates a new offer.

Request body:

```json
{
  "message": "Flat 20% off on all 3D printed models — limited time!",
  "startDate": "2026-08-01T00:00:00Z",
  "endDate": "2026-08-31T23:59:59Z",
  "isActive": true
}
```

Field rules:

- `message`: required, max 1000 characters, must not be blank
- `startDate`: required, ISO-8601 datetime (UTC preferred; naive values are coerced to UTC)
- `endDate`: required, must be later than `startDate`
- `isActive`: optional, defaults to `true`

Example response:

```json
{
  "success": true,
  "message": "Offer created successfully.",
  "data": {
    "id": "3a6c2e4b-5d7a-4b7f-8b1d-3e6c2c4d1a11",
    "message": "Flat 20% off on all 3D printed models — limited time!",
    "startDate": "2026-08-01T00:00:00Z",
    "endDate": "2026-08-31T23:59:59Z",
    "isActive": true,
    "createdAt": "2026-08-01T10:15:00Z",
    "updatedAt": "2026-08-01T10:15:00Z"
  }
}
```

### PUT `/api/offers/{id}`

Admin only. Updates an existing offer. All fields are optional; only the ones provided are applied. The `endDate` must still be later than `startDate` after the merge.

Request body:

```json
{
  "message": "Extended: Flat 25% off on all 3D printed models!",
  "endDate": "2026-09-15T23:59:59Z",
  "isActive": true
}
```

Example response:

```json
{
  "success": true,
  "message": "Offer updated successfully.",
  "data": {
    "id": "3a6c2e4b-5d7a-4b7f-8b1d-3e6c2c4d1a11",
    "message": "Extended: Flat 25% off on all 3D printed models!",
    "startDate": "2026-08-01T00:00:00Z",
    "endDate": "2026-09-15T23:59:59Z",
    "isActive": true,
    "createdAt": "2026-08-01T10:15:00Z",
    "updatedAt": "2026-08-05T09:00:00Z"
  }
}
```

### DELETE `/api/offers/{id}`

Admin only. Deletes the offer with the given id.

Example response:

```json
{
  "success": true,
  "message": "Offer deleted successfully.",
  "data": "Offer deleted."
}
```

## Placeholder Endpoints

These controllers currently return stubbed or placeholder responses and are not fully implemented.

### GET `/api/Testimonials`

Returns an empty array.

### POST `/api/Testimonials`

Creates and echoes the submitted body.

### PUT `/api/Testimonials/{id}/approve`

Returns `204 No Content`.

### POST `/api/Newsletter/subscribe`

Returns:

```json
{
  "message": "Not implemented"
}
```

### POST `/api/Newsletter/confirm`

Returns:

```json
{
  "message": "Not implemented"
}
```

## Frontend Integration Notes

- Store the JWT from login/register and send it in the `Authorization` header.
- Treat `customer` and `admin` roles separately in the UI.
- For product lists, use the `items`, `total`, `page`, and `totalPages` fields to render pagination.
- For cart and order flows, keep the order of operations:
  1. Add items to cart
  2. Select shipping address
  3. Complete payment on the frontend
  4. Submit `paymentId` when calling `POST /api/orders`
- For `custom` products, the frontend should pass a valid `productColorId` when adding to cart.

## Notes On Data Shapes

- Product detail responses include category, colors, images, specs, average rating, and review count.
- Cart responses include live pricing and stock availability.
- Order responses include frozen price and color snapshots from the checkout moment.
- Category and review endpoints currently return entity-shaped payloads, so the frontend should not assume a separate DTO wrapper beyond the shared `ApiResponse<T>` envelope.

## Migrations & Docker

Notes about recent changes:

- The server now applies EF Core migrations on startup using db.Database.Migrate(). The previous fallback to EnsureCreated() was removed so migration mismatches will fail fast and must be resolved by creating/applying migrations.
- A migration named AddPaymentIntent was added to introduce the payment intent changes (nullable order id, cart_snapshot column, and status default/check constraint including `pending`). Ensure this migration file is present in `Migrations/` and committed.
- A development-only endpoint `GET /api/payments/test-connection` is available to validate Razorpay API keys from configuration.

Running in Docker:

- If you run the API inside Docker, you should rebuild the image and restart the container so the running code matches the repository changes. Example commands (PowerShell):

  - Rebuild and start with docker-compose (recommended):

    docker-compose up -d --build

  - Or rebuild a single container image and run:

    docker build -t cruise3d-api .
    docker run -e ASPNETCORE_ENVIRONMENT=Development -p 8080:80 --name cruise3d-api cruise3d-api

- The application will attempt to run migrations on startup. That requires the database to be reachable from the container and the DB user to have schema ALTER privileges. If migrations cannot be applied at startup the container will fail (this is intentional to avoid masking schema drift).

Post-deploy checks:

- After restart, check the `__EFMigrationsHistory` table or run `dotnet ef migrations list` from your build host to verify that AddPaymentIntent is applied.
- Call the payments test endpoint to validate Razorpay keys:

  curl http://<host>:<port>/api/payments/test-connection

Kerberos/GSSAPI warning:

- You may see a warning about `libgssapi_krb5.so.2` when starting the app in some Linux environments. This is harmless unless you use Kerberos/GSSAPI authentication to Postgres. To remove the warning, install the OS package that provides libgssapi (e.g., krb5-user/heimdal packages depending on your base image).

