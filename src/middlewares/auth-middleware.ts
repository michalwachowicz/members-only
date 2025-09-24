import { Request, Response, NextFunction } from "express";
import { SafeUser } from "../types/user";
import { LOGGER } from "../utils/logger";

export function checkAuth(req: Request, res: Response, next: NextFunction) {
  const isAuthenticated = req.isAuthenticated();
  const user = req.user as SafeUser | undefined;

  if (!isAuthenticated) {
    LOGGER.info("Unauthenticated access - redirecting to /auth/login", {
      requestId: req.requestId,
      method: req.method,
      url: req.originalUrl || req.url,
      ip: req.ip,
      userId: user?.id,
      statusCode: 302,
    });

    return res.redirect("/auth/login");
  }

  next();
}

export function checkMember(req: Request, res: Response, next: NextFunction) {
  checkAuth(req, res, (err) => {
    if (err) return next(err);

    const user = req.user as SafeUser | undefined;
    const isMember = Boolean(user?.isMember);

    if (!isMember) {
      LOGGER.info("Non-member access - redirecting to /auth/upgrade", {
        requestId: req.requestId,
        method: req.method,
        url: req.originalUrl || req.url,
        ip: req.ip,
        userId: user?.id,
        isMember,
        statusCode: 302,
      });

      return res.redirect("/auth/upgrade");
    }

    next();
  });
}

export function checkGuest(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }
  next();
}
