# Acquisitions API

A secure **Node.js Express REST API** built with **Express**, **Drizzle ORM**, **Neon PostgreSQL**, **JWT Authentication**, **Arcjet Security**, **Zod Validation**, **bcrypt**, and **Winston Logging**.

This project demonstrates a clean backend API structure with authentication, validation, database integration, security middleware, logging, and environment-based configuration.

## Overview

Acquisitions API is a backend application designed with a scalable Express.js architecture. It includes user authentication features such as sign up, sign in, and sign out, while using JWT tokens stored in secure HTTP-only cookies.

The project follows a layered backend structure with routes, controllers, services, models, validations, middleware, utilities, and configuration files.

## Features

* Node.js Express API
* User sign-up endpoint
* User sign-in endpoint
* User sign-out endpoint
* JWT authentication
* Secure HTTP-only cookie handling
* Password hashing using bcrypt
* PostgreSQL database integration
* Neon serverless PostgreSQL support
* Drizzle ORM database models and migrations
* Zod request validation
* Arcjet security middleware
* Bot protection
* Rate limiting
* Security headers using Helmet
* CORS support
* Cookie parser support
* HTTP request logging with Morgan
* Application logging with Winston
* Modular folder structure
* Native ES module support
* ESLint and Prettier configuration

## Tech Stack

* Node.js
* Express.js
* JavaScript
* Drizzle ORM
* Neon PostgreSQL
* PostgreSQL
* JSON Web Token
* bcrypt
* Zod
* Arcjet
* Helmet
* CORS
* Cookie Parser
* Morgan
* Winston
* Dotenv
* ESLint
* Prettier

## Project Structure

```bash
acquisitions/
├── drizzle/
├── logs/
├── src/
│   ├── config/
│   │   ├── arcjet.js
│   │   ├── database.js
│   │   └── logger.js
│   │
│   ├── controllers/
│   │   └── auth.controller.js
│   │
│   ├── middleware/
│   │   └── security.middleware.js
│   │
│   ├── models/
│   │   └── user.model.js
│   │
│   ├── routes/
│   │   └── auth.routes.js
│   │
│   ├── services/
│   │   └── auth.service.js
│   │
│   ├── utils/
│   │   ├── cookies.js
│   │   ├── format.js
│   │   └── jwt.js
│   │
│   ├── validations/
│   │   └── auth.validation.js
│   │
│   ├── app.js
│   ├── index.js
│   └── server.js
│
├── .gitignore
├── .prettierignore
├── .prettierrc
├── drizzle.config.js
├── eslint.config.js
├── package.json
└── README.md
```

## Architecture

```txt
Client
  |
  v
Express App
  |
  |-- Global Middleware
  |   |-- Helmet
  |   |-- CORS
  |   |-- Cookie Parser
  |   |-- Morgan Logger
  |   |-- Arcjet Security Middleware
  |
  v
Routes
  |
  v
Controllers
  |
  v
Services
  |
  v
Drizzle ORM
  |
  v
Neon PostgreSQL
```

## API Endpoints

### Health Check

```http
GET /health
```

Returns application health status, timestamp, and uptime.

### API Info

```http
GET /api
```

Returns a welcome message for the Acquisitions API.

### Sign Up

```http
POST /api/auth/sign-up
```

Creates a new user account.

#### Request Body

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user"
}
```

#### Success Response

```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

### Sign In

```http
POST /api/auth/sign-in
```

Authenticates an existing user and sets a JWT token in an HTTP-only cookie.

#### Request Body

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Success Response

```json
{
  "message": "Signed in successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

### Sign Out

```http
POST /api/auth/sign-out
```

Clears the authentication cookie and signs the user out.

#### Success Response

```json
{
  "message": "Signed out successfully"
}
```

## Authentication Flow

```txt
User submits credentials
        |
        v
Zod validates request body
        |
        v
Service checks user in database
        |
        v
bcrypt verifies password
        |
        v
JWT token is generated
        |
        v
Token is stored in HTTP-only cookie
```

## Security Features

This project includes multiple security layers:

* Helmet for secure HTTP headers
* Arcjet Shield protection
* Bot detection
* Role-based rate limiting
* HTTP-only cookies
* Strict same-site cookie policy
* bcrypt password hashing
* JWT token signing and verification
* Zod request validation
* Centralized error formatting

## Rate Limiting

The Arcjet middleware applies different request limits based on user role:

| Role  | Limit                  |
| ----- | ---------------------- |
| Admin | 20 requests per minute |
| User  | 10 requests per minute |
| Guest | 5 requests per minute  |

## Database

The project uses **Drizzle ORM** with **Neon PostgreSQL**.

### Users Table

| Field       | Description                         |
| ----------- | ----------------------------------- |
| `id`        | Primary key                         |
| `name`      | User full name                      |
| `email`     | Unique user email                   |
| `password`  | Hashed user password                |
| `role`      | User role, either `user` or `admin` |
| `createdAt` | Account creation timestamp          |
| `updatedAt` | Account update timestamp            |

## Environment Variables

Create a `.env` file in the root directory and add the following values:

```env
PORT=3000
NODE_ENV=development

DATABASE_URL=your_neon_postgresql_database_url
JWT_SECRET=your_jwt_secret_key
ARCJET_KEY=your_arcjet_key
LOG_LEVEL=info
```

Important: never commit your real `.env` file to GitHub.

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/DANUCKSAN/acquisitions.git
```

### 2. Navigate to the project folder

```bash
cd acquisitions
```

### 3. Install dependencies

```bash
npm install
```

### 4. Create environment variables

Create a `.env` file in the root directory and add your database, JWT, and Arcjet configuration.

### 5. Generate database migrations

```bash
npm run db:generate
```

### 6. Run database migrations

```bash
npm run db:migrate
```

### 7. Start the development server

```bash
npm run dev
```

The server will run locally at:

```txt
http://localhost:3000
```

## Available Scripts

### Start development server

```bash
npm run dev
```

Runs the app in watch mode using Node.js.

### Run linting

```bash
npm run lint
```

Checks the project using ESLint.

### Fix linting issues

```bash
npm run lint:fix
```

Automatically fixes supported ESLint issues.

### Format code

```bash
npm run format
```

Formats the codebase using Prettier.

### Check formatting

```bash
npm run format:check
```

Checks whether the code follows Prettier formatting.

### Generate Drizzle migrations

```bash
npm run db:generate
```

Generates database migrations from the schema.

### Apply database migrations

```bash
npm run db:migrate
```

Applies pending database migrations.

### Open Drizzle Studio

```bash
npm run db:migrate:down
```

Opens Drizzle Studio for database management.

## Path Aliases

The project uses Node.js import aliases for cleaner imports.

| Alias            | Path                  |
| ---------------- | --------------------- |
| `#config/*`      | `./src/config/*`      |
| `#controllers/*` | `./src/controllers/*` |
| `#models/*`      | `./src/models/*`      |
| `#routes/*`      | `./src/routes/*`      |
| `#services/*`    | `./src/services/*`    |
| `#utils/*`       | `./src/utils/*`       |
| `#middleware/*`  | `./src/middleware/*`  |
| `#validations/*` | `./src/validations/*` |

## Validation

The project uses Zod schemas for authentication validation.

### Sign Up Validation

* Name must be between 2 and 255 characters
* Email must be valid
* Password must be at least 6 characters
* Role must be either `user` or `admin`

### Sign In Validation

* Email must be valid
* Password is required

## Logging

The project uses Winston for application logging and Morgan for HTTP request logging.

Log files are stored in the `logs` directory:

```txt
logs/error.lg
logs/combined.log
```

## Development Notes

This project uses native ES modules, so use:

```js
import something from 'module';
```

instead of:

```js
const something = require('module');
```

## Future Improvements

* Add protected user profile route
* Add authentication middleware for secured routes
* Add refresh token support
* Add password reset functionality
* Add email verification
* Add role-based authorization
* Add global error handling middleware
* Add API documentation with Swagger/OpenAPI
* Add automated tests
* Add Docker support
* Add Docker Compose setup
* Add GitHub Actions CI workflow
* Add Kubernetes deployment files
* Add production deployment documentation

## Repository Description

A secure Node.js Express API with JWT authentication, Drizzle ORM, Neon PostgreSQL, Arcjet security, Zod validation, bcrypt password hashing, and Winston logging.

## Suggested Topics

```txt
nodejs
express
expressjs
javascript
rest-api
backend
jwt-authentication
bcrypt
drizzle-orm
postgresql
neon
zod
arcjet
helmet
cors
winston
morgan
eslint
prettier
api-security
backend-development
```

## Author

**Danucksan Sathiyaraj**

GitHub: DANUCKSAN

## License

This project is open-source and available for learning, portfolio, and demonstration purposes.
