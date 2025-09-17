import { Express } from "express";
import initializeSession from "./session";
import initializePassport from "./passport";

export const initializeMiddlewares = (app: Express) => {
  initializeSession(app);
  initializePassport(app);
};
