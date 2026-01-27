# TasteTrail Server

A robust, scalable backend API for the TasteTrail recipe sharing platform built with Node.js, Express, and MongoDB.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [API Endpoints](#api-endpoints)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Schema](#database-schema)
- [Authentication & Authorization](#authentication--authorization)
- [Error Handling](#error-handling)
- [Security Features](#security-features)
- [Deployment](#deployment)
- [Testing](#testing)

## 🌟 Overview

TasteTrail Server is a RESTful API designed to power a comprehensive recipe sharing and meal planning platform. Built with scalability and security in mind, it provides robust user authentication, recipe management, review systems, and personalized recommendations.

## Features

### Core Functionality

- **User Management**: Registration, authentication, and profile management
- **Recipe Management**: CRUD operations with categorization and cuisine classification
- **Review System**: Rating and commenting on recipes with moderation capabilities
- **Meal Planning**: Personalized weekly meal planning with status tracking
- **Smart Recommendations**: AI-powered recipe suggestions based on user preferences
- **Admin Panel**: Content moderation and user management capabilities

### Technical Features

- JWT-based authentication with secure cookie storage
- Role-based access control (User/Admin)
- Comprehensive error handling and validation
- Database indexing for optimal performance
- CORS support for cross-origin requests
- Graceful server shutdown handling

## 🛠 Tech Stack

| Layer                      | Technology                      |
| -------------------------- | ------------------------------- |
| **Runtime**                | Node.js v18+                    |
| **Framework**              | Express.js v5.2.1               |
| **Database**               | MongoDB v6.0+ with Mongoose ODM |
| **Authentication**         | JWT (jsonwebtoken)              |
| **Password Security**      | bcryptjs                        |
| **Environment Management** | dotenv                          |
| **CORS**                   | cors package                    |
| **Cookie Parsing**         | cookie-parser                   |
| **Development**            | nodemon                         |

## Architecture

```
src/
├── config/          # Configuration files
│   ├── config.js    # Environment variables
│   └── db.js        # Database connection
├── features/        # Feature modules
│   ├── user/        # User management
│   ├── recipe/      # Recipe operations
│   ├── category/    # Recipe categories
│   ├── cuisine/     # Cuisine types
│   ├── review/      # Review system
│   ├── MealPlan/    # Meal planning
│   └── recommendation/ # Recommendation engine
├── middleware/      # Custom middleware
│   ├── authMiddleware.js  # Authentication
│   ├── admin.js           # Admin authorization
│   ├── asyncHandler.js    # Async error wrapper
│   └── errorHandler.js    # Global error handling
├── utils/           # Utility functions
│   ├── generateToken.js   # JWT token generation
│   ├── recommendationRecipes.js # Recommendation logic
│   ├── updateRecipeRating.js  # Rating calculation
│   └── formatText.js      # Text formatting
├── app.js           # Express application setup
└── server.js        # Server entry point
```

## API Endpoints

### Authentication

```
POST   /api/user/auth/register    # User registration
POST   /api/user/auth/login       # User login
GET    /api/user/auth/me         # Get current user
GET    /api/user/auth/logout      # User logout
```

### Recipes

```
POST   /api/recipe/add           # Create recipe (Admin only)
GET    /api/recipe/all           # Get all recipes
GET    /api/recipe/single/:id    # Get single recipe
PUT    /api/recipe/update/:id    # Update recipe (Admin only)
DELETE /api/recipe/delete/:id    # Delete recipe (Admin only)
```

### Categories

```
POST   /api/category/create      # Create category (Admin only)
GET    /api/category/all         # Get all categories
GET    /api/category/single/:id  # Get single category
PUT    /api/category/update/:id  # Update category (Admin only)
DELETE /api/category/delete/:id  # Delete category (Admin only)
```

### Reviews

```
POST   /api/review/add           # Add review
GET    /api/review/all           # Get all reviews
GET    /api/review/single/:id    # Get single review
PUT    /api/review/update/:id    # Update review
DELETE /api/review/delete/:id    # Delete review
```

### Meal Plans

```
POST   /api/mealPlan/create      # Create meal plan
GET    /api/mealPlan/my-plans    # Get user's meal plans
PUT    /api/mealPlan/update/:id  # Update meal plan status
DELETE /api/mealPlan/delete/:id  # Delete meal plan
```

### Recommendations

```
GET    /api/recommendations/personalized  # Personalized recommendations
```

## 🛠 Getting Started

### Prerequisites

- Node.js v18 or higher
- MongoDB v6.0 or higher
- npm or yarn package manager

### Installation

1. **Clone the repository**

```bash
git clone <https://github.com/tamzid-molla/tastetrail-server.git>
cd TasteTrail_server
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

```bash
cp .env.exaple .env
```

4. **Configure your `.env` file**

```env
PORT=your_port
MONGO_URI=mongodb://localhost:27017/tastetrail
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-here
```

5. **Start the development server**

```bash
npm run dev
```

The server will start on `http://localhost:port`

### Production Deployment

```bash

# Set NODE_ENV to production in .env
NODE_ENV=production

# Start the server
node src/server.js
```

## ⚙️ Environment Variables
- ✅ Check .env.example


## 🗄 Database Schema

### User Model

```javascript
{
  fullName: String,
  email: String (unique),
  password: String (hashed),
  role: String (user/admin),
  profilePhoto: String,
  preferences: {
    favoriteCuisines: [String],
    favoriteCategories: [String],
    dietaryRestrictions: [String]
  },
  cookingStats: {
    totalMealsPlanned: Number,
    totalMealsCooked: Number,
    lastCookedRecipe: ObjectId
  },
  savedRecipes: [ObjectId],
  weeklyMealPlan: [{
    recipe: ObjectId,
    day: String,
    status: String
  }]
}
```

### Recipe Model

```javascript
{
  title: String,
  ingredients: [String],
  instructions: String,
  category: ObjectId (ref: Category),
  cuisine: ObjectId (ref: Cuisine),
  averageRating: Number,
  totalReviews: Number,
  cookingTime: Number,
  calories: Number,
  image: String,
  isFeatured: Boolean,
  status: String,
  createdBy: ObjectId (ref: User)
}
```

### Review Model

```javascript
{
  user: ObjectId (ref: User),
  recipe: ObjectId (ref: Recipe),
  rating: Number (1-5),
  comment: String,
  status: String (pending/approved/rejected)
}
```

### MealPlan Model

```javascript
{
  user: ObjectId (ref: User),
  recipe: ObjectId (ref: Recipe),
  date: Date,
  status: String (planned/cooking/cooked)
}
```

## Authentication & Authorization

### JWT Implementation

- Tokens expire after 7 days
- Secure HTTP-only cookies
- Role-based access control

### Protected Routes

Routes requiring authentication are protected by the `isAuthenticated` middleware. Admin-only routes additionally require the `adminOnly` middleware.

### Token Structure

```javascript
{
  _id: "user_id",
  iat: timestamp,
  exp: timestamp + 7 days
}
```

## Error Handling

### Global Error Handler

Comprehensive error handling for:

- Validation errors
- Database errors (duplicate keys, cast errors)
- JWT errors (invalid/expired tokens)
- Resource not found
- Server errors

### Error Response Format

```json
{
  "success": false,
  "message": "Error description"
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

##  Security Features

### Implemented Security Measures

- ✅ Password hashing with bcrypt (10 rounds)
- ✅ JWT token authentication
- ✅ HTTP-only cookies
- ✅ CORS configuration
- ✅ Input validation and sanitization
- ✅ Database injection prevention
- ✅ Secure headers
- ✅ Environment variable protection

### Security Best Practices

- Sensitive data excluded from responses
- Proper error message sanitization
- Secure cookie configuration for production
- Regular dependency updates
- Input validation at controller level

## Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use production MongoDB cluster
- [ ] Configure proper SSL/HTTPS
- [ ] Set secure JWT secret
- [ ] Enable production logging
- [ ] Configure monitoring and alerting
- [ ] Set up automated backups
- [ ] Implement load balancing


### Environment Configuration for Production

```env
PORT=80
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/tastetrail
NODE_ENV=production
JWT_SECRET=super-long-random-secret-key-here
```

## Testing

### Current Test Coverage

- Manual testing of all endpoints
- Integration testing with Postman
- Database operation validation

### Recommended Testing Frameworks

```bash
npm install --save-dev jest supertest
```

### Test Categories

- Unit tests for utility functions
- Integration tests for API endpoints
- Database operation tests
- Authentication flow tests
- Performance testing


### Code Standards

- Follow ES6+ JavaScript standards
- Use meaningful variable and function names
- Write JSDoc comments for complex functions
- Maintain consistent code formatting
- Write comprehensive error handling


## Support

For support, email [tamzidmolla.dev@gmail.com] or create an issue in the repository.

---

<p align="center">Made with ❤️ for food enthusiasts</p>
