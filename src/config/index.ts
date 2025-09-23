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
    ttl: {
      user: Number(process.env.REDIS_TTL_USER || 300),
      userSafe: Number(process.env.REDIS_TTL_USER_SAFE || 300),
      usersSafeAll: Number(process.env.REDIS_TTL_USERS_SAFE_ALL || 60),
      messagesList: Number(process.env.REDIS_TTL_MESSAGES_LIST || 30),
      messagesByUser: Number(process.env.REDIS_TTL_MESSAGES_BY_USER || 30),
    },
  },
};
