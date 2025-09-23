import { Request, Response, NextFunction, Express } from "express";
import { v4 as uuidv4 } from "uuid";
import { LOGGER } from "../utils/logger";

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}

export default function initializeRequestLogging(app: Express) {
  app.use((req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    const requestId = uuidv4();
    req.requestId = requestId;

    const { method, url, ip, headers } = req;
    const userAgent = headers["user-agent"] || "unknown";
    const userId = (req.user as any)?.id;

    LOGGER.info("Incoming request", {
      requestId,
      method,
      url,
      ip,
      userAgent,
      userId,
    });

    const originalEnd = res.end;
    res.end = function (chunk?: any, encoding?: any) {
      const duration = Date.now() - start;
      const { statusCode } = res;

      LOGGER.info("Request completed", {
        requestId,
        method,
        url,
        statusCode,
        duration,
        userId,
      });

      if (duration > 1000) {
        LOGGER.warn("Slow request detected", {
          requestId,
          method,
          url,
          duration,
          userId,
        });
      }

      if (statusCode >= 400) {
        LOGGER.warn("Error response", {
          requestId,
          method,
          url,
          statusCode,
          duration,
          userId,
        });
      }

      return originalEnd.call(this, chunk, encoding);
    };

    next();
  });
}
