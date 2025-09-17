import { Express } from "express";
import authRouter from "./auth-router";

export const initializeRoutes = (app: Express) => {
  app.use("/auth", authRouter);
};
