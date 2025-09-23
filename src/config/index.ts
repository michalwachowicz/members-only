import "dotenv/config";

export const config = {
  port: process.env.PORT || 3000,
  sessionSecret: process.env.SESSION_SECRET || "secret",
  dbUrl:
    process.env.DATABASE_URL ||
    "postgresql://user:password@localhost:5432/database",
};
