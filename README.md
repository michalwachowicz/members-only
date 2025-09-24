# Members Only

A private clubhouse app where members can post messages. Features role-based access control with different visibility levels for guests, members, and admins. Built with modern web technologies including Express, TypeScript, PostgreSQL, and Redis.

This project was built as part of The Odin Project assignment: [Project: Members Only](https://www.theodinproject.com/lessons/node-path-nodejs-members-only).

[Visit the Preview](https://members-only-a007.onrender.com/auth/register)

## 🧩 Tech Stack

![Express](https://img.shields.io/badge/-Express-000?logo=express)
![TypeScript](https://img.shields.io/badge/-TypeScript-000?logo=typescript)
![EJS](https://img.shields.io/badge/-EJS-000?logo=ejs)
![Passport.js](https://img.shields.io/badge/-Passport.js-000?logo=passport)
![PostgreSQL](https://img.shields.io/badge/-PostgreSQL-000?logo=postgresql)
![Redis](https://img.shields.io/badge/-Redis-000?logo=redis)
![Zod](https://img.shields.io/badge/-Zod-000?logo=zod)

## 🛠️ Features

- Authentication with Passport (local strategy)
- Membership and admin roles (visibility and deletion permissions)
- Zod validation and reusable validation middleware
- Structured error handling with helpers and request‑bound factory
- Structured logging with request context
- PostgreSQL with automatic table creation and idempotent indexes
- Optional Redis caching (configurable TTLs)
- EJS views and partials

## ✅ Prerequisites

- [Node.js](https://nodejs.org/)
- [PostgreSQL](https://www.postgresql.org/)
- (Optional) [Redis](https://redis.io/)

## ⚙️ Environment

1. Rename `.env.template` to `.env`
2. Update the configuration values with your database credentials and settings

## 🚀 Getting Started

### Install Dependencies

```
npm install
```

### Database Setup

**PostgreSQL (Required):**

1. Start your PostgreSQL server
2. Create a database (e.g., `members_only`)
3. Update `DATABASE_URL` in your `.env` file with your connection string
4. The app will automatically create tables and indexes on startup

**Redis (Optional):**

1. Start your Redis server
2. Set `REDIS_ENABLED=true` in your `.env` file
3. Configure Redis settings:
   - `REDIS_URL` - Redis connection string
   - `REDIS_USERNAME` - Redis username (if required)
   - `REDIS_PASSWORD` - Redis password (if required)
   - `REDIS_TLS` - Enable TLS connection (true/false)
   - TTL settings for different cache types (user data, messages, etc.)
4. Redis is used for caching user data and messages to improve performance

### Development

```
npm run dev
```

Visit: `http://localhost:PORT/` (PORT is configured in your `.env` file, defaults to 3001)

### Production

```
npm start
```

## 📂 Project Structure

```
src/
  config/           # env config
  controllers/      # route handlers
  db/               # pg pool + init (tables, indexes)
  error/            # AppError and http helpers
    http/           # context, helpers, factory
  middlewares/      # auth, sessions, validation, error handler
  routes/           # express routers
  services/         # domain services (users, messages)
  validations/      # zod schemas
  views/            # EJS templates
  utils/            # logger, renderer, helpers
```

## 🔐 Roles & Permissions

- Guest:
  - View all messages without author info and timestamps
- Member:
  - View all messages with author info and timestamps
  - View users list and individual user profiles with their messages
  - Create new messages
  - Delete their own messages
- Admin:
  - All permissions of the user
  - Delete any message

## 🧪 Scripts

- `npm run dev` — Development mode with `ts-node-dev`
- `npm run build` — TypeScript build
- `npm start` — Production mode after successful build
