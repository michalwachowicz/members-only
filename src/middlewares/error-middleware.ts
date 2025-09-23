import { Express, Request, Response, NextFunction } from "express";
import { log, LOGGER, LogLevel } from "../utils/logger";
import { SafeUser } from "../types/user";
import { AppError } from "../error/AppError";

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

      return res
        .status(
          "statusCode" in context && context.statusCode
            ? context.statusCode
            : 500
        )
        .render("error", {
          title: error.title || "Error",
          message: error.message,
          user: req.user,
          isAuthenticated: req.isAuthenticated(),
        });
    }

    LOGGER.error("Unhandled error", baseContext);

    return res.status(500).render("error", {
      title: "Internal Server Error",
      message: "An unexpected error occurred. Please try again later.",
      user: req.user,
      isAuthenticated: req.isAuthenticated(),
    });
  });
}
