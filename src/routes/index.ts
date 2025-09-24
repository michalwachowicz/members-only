import { Express } from "express";
import { notFound } from "../error/http-errors";
import authRouter from "./auth-router";
import accountRouter from "./account-router";
import messageRouter from "./message-router";
import settingsRouter from "./settings-router";
import userRouter from "./user-router";
import rootRouter from "./root-router";

export const initializeRoutes = (app: Express) => {
  app.use("/auth", authRouter);
  app.use("/account", accountRouter);
  app.use("/messages", messageRouter);
  app.use("/settings", settingsRouter);
  app.use("/users", userRouter);
  app.use("/", rootRouter);
  app.use((req, _, next) => next(notFound("Not found", req)));
};
