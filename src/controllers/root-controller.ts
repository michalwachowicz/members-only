import { Request, Response } from "express";
import { SafeUser } from "../types/user";
import { LOGGER } from "../utils/logger";
import MessageService from "../services/message-service";
import { AppError } from "../error/app-error";
import { errorFor } from "../error/http-errors";
import { LogLevel } from "../utils/logger";
import render from "../utils/renderer";

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

      render("index", res, req, {
        messages: messages.map((message) => ({
          ...message,
          canDelete: user ? user.id === message.userId || user.isAdmin : false,
        })),
        success: req.query.success || undefined,
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw errorFor(req).internalError({
        logTitle: "Home page load failed",
        logLevel: LogLevel.Error,
        message: "Failed to load home page",
        context: {
          error: (error as Error).message,
          stack: (error as Error).stack,
        },
      });
    }
  }
}

export default new RootController();
