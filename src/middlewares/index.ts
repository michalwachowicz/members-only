import { Express } from "express";
import initializeSession from "./session-middleware";
import initializePassport from "./passport-middleware";
import initializeRequestLogging from "./request-logging-middleware";

export const initializeMiddlewares = (app: Express) => {
  initializeRequestLogging(app);
  initializeSession(app);
  initializePassport(app);
};
