import { Express, Request, Response, NextFunction } from "express";
import { log, LOGGER, LogLevel } from "../utils/logger";
import { SafeUser } from "../types/user";
import { AppError } from "../error/app-error";
import render from "../utils/renderer";

export default function initializeErrorMiddleware(app: Express) {
  app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
    const baseContext = {
      requestId: req.requestId,
      method: req.method,
      url: req.url,
      userId: (req.user as SafeUser)?.id,
      username: (req.user as SafeUser)?.username,
      ip: req.ip,
      error: error.message,
      stack: error.stack,
    };

    if (error instanceof AppError) {
      const level = error.logLevel || LogLevel.Error;
      const title = error.logTitle || error.title || "Application Error";
      const context =
        error.logContext && Object.keys(error.logContext).length > 0
          ? error.logContext
          : baseContext;

      log(level, title, context);

      const status = error.statusCode || 500;
      return render("error", res, req, {
        title: error.title || "Error",
        message: error.message,
        status,
      });
    }

    LOGGER.error("Unhandled error", baseContext);

    return render("error", res, req, {
      title: "Internal Server Error",
      message: "An unexpected error occurred. Please try again later.",
      status: 500,
    });
  });
}
