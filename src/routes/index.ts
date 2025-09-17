import { Express } from "express";
import authRouter from "./auth-router";
import messageRouter from "./message-router";

export const initializeRoutes = (app: Express) => {
  app.use("/auth", authRouter);
  app.use("/messages", messageRouter);
};
