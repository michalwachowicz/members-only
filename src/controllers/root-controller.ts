import { Request, Response } from "express";
import { SafeUser } from "../types/user";
import { LOGGER } from "../utils/logger";
import MessageService from "../services/message-service";
import { AppError } from "../error/AppError";
import { LogLevel } from "../utils/logger";

class RootController {
  async getHome(req: Request, res: Response) {
    const { requestId, ip } = req;

    try {
      const user = req.user as SafeUser;
      const isMember = user ? user.isMember : false;

      LOGGER.info("Home page request", {
        requestId,
        userId: user?.id,
        username: user?.username,
        isMember,
        ip,
      });

      const messages = await MessageService.getMessages(isMember);

      LOGGER.info("Messages fetched successfully", {
        requestId,
        userId: user?.id,
        messageCount: messages.length,
        isMember,
        ip,
      });

      res.render("index", {
        user: req.user,
        messages: messages.map((message) => ({
          ...message,
          canDelete: user ? user.id === message.userId || user.isAdmin : false,
        })),
        isAuthenticated: req.isAuthenticated(),
        success: req.query.success || undefined,
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError("Database Error", "Failed to load home page", {
        logTitle: "Home page load failed",
        logLevel: LogLevel.Error,
        logContext: {
          requestId,
          userId: (req.user as SafeUser)?.id,
          username: (req.user as SafeUser)?.username,
          error: (error as Error).message,
          stack: (error as Error).stack,
          ip,
        },
      });
    }
  }
}

export default new RootController();
