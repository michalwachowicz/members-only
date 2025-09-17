import { Express } from "express";
import initializeSession from "./session-middleware";
import initializePassport from "./passport-middleware";

export const initializeMiddlewares = (app: Express) => {
  initializeSession(app);
  initializePassport(app);
};
