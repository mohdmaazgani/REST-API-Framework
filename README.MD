# 🚀 REST API Framework

### A production-ready REST API built with Node.js, Express & MongoDB

_JWT authentication with refresh token rotation · Role-Based Access Control · Rate limiting · Input validation · Full Swagger documentation_

<br/>

[📖 API Docs](#api-reference) · [⚡ Quick Start](#quick-start) · [🏗️ Architecture](#architecture) · [🔐 Security](#security) · [🧪 Testing](#testing)

<br/>

<div align="center">

<img src="https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
<img src="https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express&logoColor=white" />
<img src="https://img.shields.io/badge/MongoDB-6.x-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
<img src="https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" />
<img src="https://img.shields.io/badge/Swagger-Docs-85EA2D?style=for-the-badge&logo=swagger&logoColor=black" />
<img src="https://img.shields.io/badge/Jest-Tests-C21325?style=for-the-badge&logo=jest&logoColor=white" />
<img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" />

<br/><br/>

</div>

---

## 📌 Overview

This is a **fully production-ready REST API** framework engineered with industry best practices. It is not a boilerplate — it is a complete, runnable system with authentication, authorization, resource management, and observability baked in.

Built to demonstrate deep understanding of backend systems, security architecture, and clean code design — every pattern used here reflects real-world engineering decisions.

```
http://localhost:5000/api-docs   →  Interactive Swagger UI
http://localhost:5000/api/v1     →  Base API endpoint
http://localhost:5000/api/v1/health  →  Health check
```

---

## ✨ Features

| Feature                          | Implementation                                                          |
| -------------------------------- | ----------------------------------------------------------------------- |
| 🔐 **JWT Authentication**        | Dual-token system (access + refresh) with rotation and replay detection |
| 👥 **Role-Based Access Control** | `user` · `moderator` · `admin` enforced via middleware                  |
| 🚦 **Rate Limiting**             | Per-route limiters — strict on auth, lenient on public reads            |
| ✅ **Input Validation**          | `express-validator` chains with structured error responses              |
| 🛡️ **Security Hardening**        | Helmet · CORS · NoSQL injection prevention · body size limits           |
| 🔒 **Account Lockout**           | Progressive brute-force protection after 5 failed attempts              |
| 📄 **Swagger Docs**              | Interactive OpenAPI 3.0 documentation at `/api-docs`                    |
| 📊 **Aggregation Pipeline**      | MongoDB `$group` pipeline for product stats by category                 |
| 📝 **Structured Logging**        | Winston with daily rotating files, separate error/exception logs        |
| 🔄 **Graceful Shutdown**         | SIGTERM/SIGINT handlers drain connections before exit                   |
| 🧪 **Test Suite**                | Unit tests + integration tests with Supertest & Jest                    |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Client                              │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTPS
┌───────────────────────────▼─────────────────────────────────┐
│                    Express Application                      │
│                                                             │
│   ┌──────────┐  ┌──────────┐  ┌────────────────────────┐    │
│   │  Helmet  │  │   CORS   │  │     Rate Limiter       │    │
│   └──────────┘  └──────────┘  └────────────────────────┘    │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │                  Router Layer                       │   │
│   │         /auth    /users    /products    /health     │   │
│   └──────────────────────┬──────────────────────────────┘   │
│                          │                                  │
│   ┌──────────────────────▼──────────────────────────────┐   │
│   │               Middleware Chain                      │   │
│   │      authenticate  →  authorize  →  validate        │   │
│   └──────────────────────┬──────────────────────────────┘   │
│                          │                                  │
│   ┌──────────────────────▼──────────────────────────────┐   │
│   │               Controllers Layer                     │   │
│   │   authController  userController  productController │   │
│   └──────────────────────┬──────────────────────────────┘   │
│                          │                                  │
│   ┌──────────────────────▼──────────────────────────────┐   │
│   │                Services Layer                       │   │
│   │                  tokenService                       │   │
│   └──────────────────────┬──────────────────────────────┘   │
│                          │                                  │
│   ┌──────────────────────▼──────────────────────────────┐   │
│   │                  Data Layer                         │   │
│   │             User Model   Product Model              │   │
│   └──────────────────────┬──────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────┘
                           │ Mongoose ODM
                  ┌────────▼────────┐
                  │    MongoDB      │
                  └─────────────────┘
```

---

## 🛠️ Tech Stack

| Layer         | Technology                             | Purpose                                   |
| ------------- | -------------------------------------- | ----------------------------------------- |
| Runtime       | **Node.js 18+**                        | JavaScript server runtime                 |
| Framework     | **Express 4.x**                        | HTTP server and routing                   |
| Database      | **MongoDB + Mongoose**                 | Data persistence and ODM                  |
| Auth          | **jsonwebtoken + bcryptjs**            | Token signing and password hashing        |
| Validation    | **express-validator**                  | Input sanitization and validation         |
| Rate Limiting | **express-rate-limit**                 | Request throttling per route              |
| Security      | **helmet + cors + mongo-sanitize**     | Security headers and injection prevention |
| Documentation | **swagger-jsdoc + swagger-ui-express** | Interactive OpenAPI 3.0 docs              |
| Logging       | **winston + daily-rotate-file**        | Structured log management                 |
| Testing       | **jest + supertest**                   | Unit and integration testing              |

---

## ⚡ Quick Start

### Prerequisites

- **Node.js** >= 18 → [Download](https://nodejs.org)
- **MongoDB** >= 6 → [Download](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/atlas)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/rest-api-framework.git
cd rest-api-framework

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secrets
```

### Environment Configuration

```env
# .env
NODE_ENV=development
PORT=5000
API_VERSION=v1

# MongoDB
MONGODB_URI=mongodb://localhost:27017/rest_api_framework
MONGODB_URI_TEST=mongodb://localhost:27017/rest_api_framework_test

# JWT — use strong random strings in production (min 32 chars)
JWT_SECRET=your_super_secret_jwt_key_min_32_characters
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_refresh_token_secret_min_32_characters
JWT_REFRESH_EXPIRES_IN=30d

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_AUTH_MAX=10
```

### Run

```bash
# Development (hot reload with nodemon)
npm run dev

# Production
npm start
```

**Server starts at:** `http://localhost:5000`  
**Swagger UI at:** `http://localhost:5000/api-docs`  
**Health check at:** `http://localhost:5000/api/v1/health`

---

## 🌍 Live Deployment

### 🚀 Production API

https://rest-api-framework-production.up.railway.app

### 📚 Interactive Swagger Documentation

https://rest-api-framework-production.up.railway.app/api-docs

### ❤️ Health Check Endpoint

https://rest-api-framework-production.up.railway.app/api/v1/health

---

## ⚡ Quick Demo

### Health Check

```http
GET /api/v1/health
```

Response:

```json
{
  "success": true,
  "message": "API is healthy.",
  "data": {
    "status": "healthy",
    "database": "connected"
  }
}
```

### API Base URL

```http
https://rest-api-framework-production.up.railway.app/api/v1
```

---

## 📁 Project Structure

```
rest-api-framework/
│
├── src/
│   ├── config/
│   │   ├── database.js          # MongoDB connection with retry logic & events
│   │   └── swagger.js           # OpenAPI 3.0 spec configuration
│   │
│   ├── controllers/
│   │   ├── authController.js    # register, login, refresh, logout, changePassword, getMe
│   │   ├── userController.js    # Admin CRUD + profile management
│   │   └── productController.js # Product CRUD + MongoDB aggregation stats
│   │
│   ├── middleware/
│   │   ├── auth.js              # authenticate, authorize (RBAC)
│   │   ├── errorHandler.js      # Global error handler with Mongoose error mapping
│   │   └── rateLimiter.js       # Global, auth-specific, and public rate limiters
│   │
│   ├── models/
│   │   ├── User.js              # Schema with RBAC, bcrypt hashing, account lockout
│   │   └── Product.js           # Schema with full-text index, virtual fields
│   │
│   ├── routes/
│   │   ├── authRoutes.js        # All auth endpoints with Swagger JSDoc annotations
│   │   ├── userRoutes.js        # User management endpoints
│   │   ├── productRoutes.js     # Product endpoints (public + protected)
│   │   └── healthRoutes.js      # Health check with DB status and memory info
│   │
│   ├── services/
│   │   └── tokenService.js      # JWT sign/verify with issuer + audience validation
│   │
│   ├── validators/
│   │   └── index.js             # All express-validator chains for every endpoint
│   │
│   ├── utils/
│   │   ├── AppError.js          # Custom error class with factory methods
│   │   ├── apiResponse.js       # Standardized response helpers + pagination
│   │   ├── catchAsync.js        # Async error wrapper (eliminates try/catch)
│   │   └── logger.js            # Winston with daily rotation and colorized console
│   │
│   ├── app.js                   # Express app setup — full middleware stack
│   └── server.js                # HTTP server entry point + graceful shutdown
│
├── tests/
│   ├── unit/
│   │   └── auth.test.js         # Token service, AppError, pagination utilities
│   └── integration/
│       └── api.test.js          # Full endpoint tests (auth flow, products, RBAC)
│
├── logs/                        # Auto-created by Winston (gitignored)
├── .env.example                 # Environment variable template
├── .gitignore
└── package.json
```

---

## 📡 API Reference

**Base URL:** `http://localhost:5000/api/v1`

> 💡 The full interactive documentation is available at `http://localhost:5000/api-docs`

### 🔑 Auth Endpoints

| Method | Endpoint                | Auth Required | Description                           |
| ------ | ----------------------- | :-----------: | ------------------------------------- |
| `POST` | `/auth/register`        |       —       | Register a new user account           |
| `POST` | `/auth/login`           |       —       | Login and receive token pair          |
| `POST` | `/auth/refresh`         |       —       | Rotate refresh token for a new pair   |
| `POST` | `/auth/logout`          |      ✅       | Invalidate current session            |
| `POST` | `/auth/logout-all`      |      ✅       | Invalidate all sessions (all devices) |
| `POST` | `/auth/change-password` |      ✅       | Change password, clears all sessions  |
| `GET`  | `/auth/me`              |      ✅       | Get currently authenticated user      |

### 👤 User Endpoints

| Method   | Endpoint                | Role             | Description                              |
| -------- | ----------------------- | ---------------- | ---------------------------------------- |
| `GET`    | `/users`                | Admin, Moderator | Paginated user list with search & filter |
| `GET`    | `/users/:id`            | Admin, Moderator | Get user by ID                           |
| `PATCH`  | `/users/profile`        | Any              | Update own name / email                  |
| `PATCH`  | `/users/:id/role`       | Admin            | Assign a new role to a user              |
| `PATCH`  | `/users/:id/deactivate` | Admin            | Soft-delete user (keeps data)            |
| `PATCH`  | `/users/:id/activate`   | Admin            | Re-activate a deactivated user           |
| `DELETE` | `/users/:id`            | Admin            | Permanently delete a user                |

### 📦 Product Endpoints

| Method   | Endpoint          |  Auth Required   | Description                           |
| -------- | ----------------- | :--------------: | ------------------------------------- |
| `GET`    | `/products`       |        —         | Paginated list — filter, sort, search |
| `GET`    | `/products/stats` | Admin, Moderator | Aggregated stats by category          |
| `GET`    | `/products/:id`   |        —         | Get product by ID                     |
| `POST`   | `/products`       |        ✅        | Create a product                      |
| `PATCH`  | `/products/:id`   |  Owner / Admin   | Partial update                        |
| `DELETE` | `/products/:id`   |  Owner / Admin   | Delete product                        |

#### Product Query Parameters

```
GET /api/v1/products?category=electronics&minPrice=50&maxPrice=500&inStock=true&search=headphones&sort=-price&page=1&limit=10
```

| Param      | Type    | Description                                                    |
| ---------- | ------- | -------------------------------------------------------------- |
| `category` | string  | Filter by: `electronics`, `clothing`, `food`, `books`, `other` |
| `minPrice` | number  | Minimum price filter                                           |
| `maxPrice` | number  | Maximum price filter                                           |
| `inStock`  | boolean | Only return products with stock > 0                            |
| `search`   | string  | Full-text search across name and description                   |
| `sort`     | string  | `price`, `-price`, `name`, `-name`, `createdAt`, `-createdAt`  |
| `page`     | integer | Page number (default: 1)                                       |
| `limit`    | integer | Items per page (default: 10, max: 100)                         |

### 💓 Health Endpoint

```
GET /api/v1/health
```

```json
{
  "success": true,
  "message": "API is healthy.",
  "data": {
    "status": "healthy",
    "environment": "development",
    "uptime": 3600,
    "database": "connected",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "memory": { "heapUsed": "45 MB" }
  }
}
```

---

## 🔐 Authentication

This API uses a **dual-token strategy**:

| Token             | Lifetime | Usage                                |
| ----------------- | -------- | ------------------------------------ |
| **Access Token**  | 7 days   | Sent in every request header         |
| **Refresh Token** | 30 days  | Used only to issue new access tokens |

```http
Authorization: Bearer <accessToken>
```

### Token Lifecycle

```
Register / Login
      │
      ▼
  ┌───────────────────────────────────────┐
  │  { accessToken, refreshToken }        │
  └───────────────────────────────────────┘
      │                    │
      ▼                    ▼
  Use in API         POST /auth/refresh
  requests           (rotate tokens)
      │                    │
      ▼                    ▼
  401 Expired?    New token pair issued,
      │           old refresh token invalidated
      ▼
  POST /auth/refresh
```

### 🔁 Refresh Token Rotation

- Each refresh call **invalidates the old token** and issues a new pair
- Tokens are stored server-side (up to 5 active sessions per user)
- If a **used token is reused** (replay attack), **all sessions are immediately invalidated**

### 🔒 Account Lockout

After **5 consecutive failed login attempts**, the account is locked for **2 hours**. The lock resets automatically on a successful login.

---

## 👥 Role-Based Access Control

Three roles with escalating permissions:

```
user  ⊂  moderator  ⊂  admin
```

| Permission                  | user | moderator | admin |
| --------------------------- | :--: | :-------: | :---: |
| Manage own profile          |  ✅  |    ✅     |  ✅   |
| Create products             |  ✅  |    ✅     |  ✅   |
| Edit / delete own products  |  ✅  |    ✅     |  ✅   |
| Edit / delete any product   |  ❌  |    ✅     |  ✅   |
| View all users              |  ❌  |    ✅     |  ✅   |
| Manage user roles           |  ❌  |    ❌     |  ✅   |
| Activate / deactivate users |  ❌  |    ❌     |  ✅   |
| Permanently delete users    |  ❌  |    ❌     |  ✅   |

RBAC is enforced at the middleware level:

```js
// Example — only admin and moderator can access this route
router.get(
  "/users",
  authenticate,
  authorize("admin", "moderator"),
  userController.getAllUsers,
);
```

---

## 🛡️ Security

| Layer            | Measure                                                         | Tool                     |
| ---------------- | --------------------------------------------------------------- | ------------------------ |
| HTTP Headers     | HSTS, CSP, X-Frame-Options, X-XSS-Protection                    | `helmet`                 |
| CORS             | Configurable origin whitelist                                   | `cors`                   |
| NoSQL Injection  | Strips `$` and `.` operators from user input                    | `express-mongo-sanitize` |
| Password Hashing | bcrypt with cost factor **12**                                  | `bcryptjs`               |
| JWT Signing      | Separate secrets for access & refresh tokens with `jwtid`       | `jsonwebtoken`           |
| Body Size        | JSON body capped at **10kb**                                    | Express built-in         |
| Rate Limiting    | Auth: 10 req/15min · Global: 100 req/15min · Public: 60 req/min | `express-rate-limit`     |
| Brute Force      | Account lockout after 5 failed attempts for 2 hours             | Custom logic             |
| Error Exposure   | Stack traces only in `development` mode                         | Custom error handler     |

---

## 📊 Response Format

All API responses follow a consistent shape:

**Success:**

```json
{
  "success": true,
  "message": "Products retrieved.",
  "data": { "products": [] },
  "meta": {
    "total": 95,
    "page": 1,
    "limit": 10,
    "totalPages": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

**Error:**

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Must be a valid email address",
      "value": "notanemail"
    },
    {
      "field": "password",
      "message": "Must include uppercase, lowercase, number, and special character"
    }
  ]
}
```

---

## 🧪 Testing

```bash
# Run all tests with coverage report
npm test

# Unit tests only (no DB required)
npm run test:unit

# Integration tests (requires MongoDB)
npm run test:integration
```

### Test Coverage

| Suite                      | What's Tested                                                                                  |
| -------------------------- | ---------------------------------------------------------------------------------------------- |
| **Unit — Token Service**   | Token generation, access/refresh verification, invalid token rejection, replay token rejection |
| **Unit — AppError**        | Status codes, factory methods, error message customization, errors array                       |
| **Unit — Utilities**       | Pagination parsing, edge cases, metadata computation                                           |
| **Integration — Auth**     | Register, login, refresh, protected routes, duplicate email, weak passwords                    |
| **Integration — Products** | CRUD flow, ownership enforcement, RBAC, validation, 404 handling                               |
| **Integration — Health**   | Status response, DB connectivity                                                               |

---

## 🎯 Key Design Decisions

**`catchAsync` wrapper**  
Eliminates repetitive `try/catch` in every controller. A higher-order function wraps async handlers and forwards all errors to the global error handler — keeping controllers clean and readable.

**Dual-token authentication**  
Access tokens are short-lived and stateless (no DB lookup per request). Refresh tokens are long-lived but validated against a stored list, enabling server-side session invalidation on logout or password change.

**Refresh token replay detection**  
If a previously used refresh token is submitted again, the server detects the reuse and immediately wipes _all_ sessions for that user — a standard security response to credential theft.

**Soft-delete for users**  
`isActive: false` preserves relational data integrity (products still reference the user ID) while blocking all access. Hard delete is available to admins when genuinely needed.

**Separate rate limiters per route type**  
Auth routes are the attack surface for credential stuffing and deserve the tightest limits. Public read routes need headroom for legitimate traffic. A single global limiter would be either too restrictive or too permissive.

**MongoDB error mapping in production**  
The global error handler translates Mongoose `CastError`, `ValidationError`, and duplicate key errors (code `11000`) into clean `AppError` instances — ensuring clients never see raw database error messages in production.

---

## 🚀 Running in Production

```bash
# Set environment
NODE_ENV=production

# Use strong secrets (generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
JWT_SECRET=<64-char-random-string>
JWT_REFRESH_SECRET=<64-char-random-string>

# Point to your production MongoDB (Atlas recommended)
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/rest_api_framework

# Start
npm start
```

> **Recommended:** Run behind a reverse proxy (Nginx) with SSL termination and use a process manager like PM2.

```bash
# With PM2
npm install -g pm2
pm2 start src/server.js --name "rest-api-framework"
pm2 save
```

---

## 📜 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Made with ❤️ by **[Mohd Maaz Gani](https://github.com/mohdmaazgani)**

⭐ Star this repo if you found it useful!

[![GitHub](https://img.shields.io/badge/GitHub-yourusername-181717?style=for-the-badge&logo=github)](https://github.com/mohdmaazgani)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=for-the-badge&logo=linkedin)](https://linkedin.com/in/mohd-maaz-gani)

</div>
