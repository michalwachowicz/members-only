import { Express } from "express";
import { config } from "../config";
import pool from "../db/pool";
import session from "express-session";
import pgSession from "connect-pg-simple";

const isProduction = process.env.NODE_ENV === "production";

const sessionMiddleware = session({
  store: new (pgSession(session))({ pool, tableName: "session" }),
  secret: config.sessionSecret,
  name: "session",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: isProduction,
    httpOnly: true,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 1000 * 60 * 60 * 24 * 1, // 1 day
  },
});

export default function initializeSession(app: Express) {
  app.use(sessionMiddleware);
}
