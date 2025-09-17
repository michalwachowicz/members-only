import { Express } from "express";
import pool from "../db/pool";
import session from "express-session";
import pgSession from "connect-pg-simple";

const sessionMiddleware = session({
  store: new (pgSession(session))({ pool, tableName: "session" }),
  secret: process.env.SESSION_SECRET || "secret",
  name: "session",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    maxAge: 1000 * 60 * 60 * 24 * 1, // 1 day
  },
});

export default function initializeSession(app: Express) {
  app.use(sessionMiddleware);
}
