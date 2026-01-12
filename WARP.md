# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Commands

### Install dependencies
- `npm install`

### Run the development server
- `npm run dev`
  - Starts the Express app in watch mode via `src/index.js` / `src/server.js`.
  - The server listens on `process.env.PORT` or `3000` by default.

### Linting
- `npm run lint`
  - Runs ESLint across the project.
- `npm run lint:fix`
  - Runs ESLint with `--fix` to auto-fix simple issues.

### Formatting
- `npm run format`
  - Formats the codebase with Prettier.
- `npm run format:check`
  - Checks formatting without writing changes.

### Database (Drizzle + Neon/Postgres)
- `npm run db:generate`
  - Generates Drizzle migrations from the schema in `src/models`.
- `npm run db:migrate` (alias: `npm run db:migrate:up`)
  - Applies pending migrations.
- `npm run db:migrate:down`
  - Opens `drizzle-kit studio` (interactive UI) for managing migrations.

### Tests
- There is currently **no** `npm test` script configured. If you add tests, also add a script (e.g. `"test": "vitest"` or similar) so future agents can run them.

## Architecture overview

### Runtime entrypoint and HTTP server
- `src/index.js`
  - Loads environment variables via `dotenv/config` and imports `src/server.js` to start the app.
- `src/server.js`
  - Imports the Express app from `src/app.js` and calls `app.listen` on `PORT` (env) or `3000`.

### Express app composition
- `src/app.js`
  - Creates the Express application and wires global middleware:
    - `helmet` for security headers.
    - `cors` for cross-origin handling.
    - `cookie-parser` for cookie parsing.
    - `express.json` / `express.urlencoded` for body parsing.
    - `morgan` HTTP request logging, configured to write through the shared Winston logger.
  - Defines basic health and info endpoints:
    - `GET /` simple hello.
    - `GET /health` health check with uptime and timestamp.
    - `GET /api` basic API info.
  - Mounts feature routes under `/api/auth` using the auth router (`src/routes/auth.routes.js`).

### Module path aliases
- `package.json` defines Node ESM `imports` aliases for cleaner, non-relative imports:
  - `#config/*` → `./src/config/*`
  - `#controllers/*` → `./src/controllers/*`
  - `#models/*` → `./src/models/*`
  - `#routes/*` → `./src/routes/*`
  - `#services/*` → `./src/services/*`
  - `#utils/*` → `./src/utils/*`
  - `#middleware/*` → `./src/middleware/*`
  - `#validations/*` → `./src/validations/*`
- Prefer these aliases over long relative paths when adding new modules.

### Request flow: routing → controller → service → DB
- Routes: `src/routes/auth.routes.js`
  - Creates an Express router and wires endpoints under `/api/auth`:
    - `POST /api/auth/sign-up` → `signup` controller.
    - `POST /api/auth/sign-in` and `POST /api/auth/sign-out` are stubbed and ready for implementation.
- Controller: `src/controllers/auth.controller.js`
  - `signup` controller implements the high-level HTTP flow:
    - Validates `req.body` using the Zod `signupSchema` from `src/validations/auth.validation.js`.
    - On validation failure, returns `400` with a formatted error message via `formatValidationError`.
    - Calls `createUser` in `src/services/auth.service.js` to actually create the user.
    - Signs a JWT using `jwttoken.sign` and sets it as a cookie via the `cookies` utility.
    - Logs success/failure using the shared logger.
    - Handles specific domain errors (e.g., email already in use → `409`) and passes others to Express error handling via `next(err)`.
- Service: `src/services/auth.service.js`
  - Encapsulates domain logic for authentication and user creation:
    - `hashPassword(password)`: wraps `bcrypt.hash` with logging and error translation.
    - `createUser({ name, email, password, role })`:
      - Uses Drizzle ORM (`db` from `#config/database.js` and `users` table from `#models/user.model.js`) to check for existing users and insert new ones.
      - Returns a minimal user DTO (id, name, email, role) suitable for API responses.
      - Logs both success and errors.
  - This layer is the right place for future business logic around users/auth (e.g., password policies, account status checks).

### Data layer: Drizzle + Neon
- Config: `src/config/database.js`
  - Creates a Neon SQL client from `process.env.DATABASE_URL`.
  - Wraps it with Drizzle ORM and exports both the raw `sql` and `db` instance.
- Schema: `src/models/user.model.js`
  - Defines the `users` table using Drizzle's `pgTable` and column helpers.
  - Fields include `id`, `name`, `email` (unique), `password`, `role`, and timestamp columns (`createdAt`, `updatedAt`).
- When adding new database-backed features, define Drizzle models alongside `user.model.js` and use the shared `db` from `#config/database.js`.

### Validation layer
- `src/validations/auth.validation.js`
  - Defines Zod schemas for authentication payloads:
    - `signupSchema` for sign-up (`name`, `email`, `password`, `role`).
    - `signInSchema` for sign-in (`email`, `password`).
- `src/utils/format.js`
  - Provides `formatValidationError`, a helper that converts Zod error objects into a human-readable string for API responses.
- Controllers should call `safeParse` on the relevant schema and use `formatValidationError` on failures.

### Auth & security utilities
- `src/utils/jwt.js`
  - Wraps `jsonwebtoken` with a small API:
    - `jwttoken.sign(payload)` signs a JWT with `JWT_SECRET` and a default expiration (1 day).
    - `jwttoken.verify(token)` verifies and decodes a token.
  - On error, logs via the shared logger and throws a domain-level error.
  - Use this wrapper instead of calling `jsonwebtoken` directly so logging and configuration remain centralized.
- `src/utils/cookies.js`
  - Centralizes HTTP-only cookie handling for auth tokens:
    - `getOptions()` returns the default cookie options (e.g., `httpOnly`, `secure` in production, `sameSite: 'strict'`).
    - `set(res, name, value, options)` sets a cookie with merged defaults.
    - `clear(res, name, options)` clears a cookie with merged defaults.
    - `get(req, name)` reads a cookie from the request.
  - Use these helpers instead of manipulating cookies directly in controllers or middleware.

### Logging
- `src/config/logger.js`
  - Configures a Winston logger used throughout the app.
  - Writes to `logs/error.lg` for errors and `logs/combined.log` for all logs.
  - In non-production environments, adds a colorized console transport for easier local debugging.
- `src/app.js` integrates `morgan` with this logger for HTTP access logs.
- Prefer importing `logger` from `#config/logger.js` instead of creating ad-hoc loggers.

### Conventions and notes
- The project uses native ES modules (`"type": "module"` in `package.json`). Use `import`/`export` syntax.
- Keep the layering clear:
  - Routes → Controllers → Services → Data/Utilities.
  - Controllers should handle HTTP concerns (status codes, shaping responses).
  - Services should handle business logic and data orchestration.
- When introducing new features, mirror the existing structure:
  - Add schemas under `src/validations`.
  - Add controllers under `src/controllers`.
  - Add services under `src/services`.
  - Add Drizzle models under `src/models`.
  - Mount routes under `src/routes` and wire them in `src/app.js`.
