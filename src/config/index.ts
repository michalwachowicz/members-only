import "dotenv/config";

export const config = {
  port: process.env.PORT || 3000,
  sessionSecret: process.env.SESSION_SECRET || "secret",
  dbUrl:
    process.env.DATABASE_URL ||
    "postgresql://user:password@localhost:5432/database",
  redis: {
    enabled: process.env.REDIS_ENABLED === "true",
    url: process.env.REDIS_URL || "redis://localhost:6379",
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    tls: process.env.REDIS_TLS === "true",
  },
};
