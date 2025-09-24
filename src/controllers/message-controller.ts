import { Request, Response, NextFunction } from "express";
import { MessageService } from "../services";
import type { MessageCreate } from "../types/message";
import type { SafeUser } from "../types/user";
import { MessageSchema } from "../validations/message-validation";
import { formatZodErrors } from "../utils/zod-formatter";
import { LOGGER, LogLevel } from "../utils/logger";
import { AppError } from "../error/app-error";
import { notFound, forbidden, errorFor } from "../error/http-errors";
import render from "../utils/renderer";

class MessageController {
  async createMessage(req: Request, res: Response) {
    const { requestId, ip } = req;

    try {
      const user = req.user as SafeUser;
      const { title, content } = req.body;
      const { error } = MessageSchema.safeParse(req.body);

      if (error) {
        LOGGER.warn("Message creation validation error", {
          requestId,
          userId: user.id,
          username: user.username,
          errors: formatZodErrors(error),
          ip,
        });

        return render("create-message", res, req, {
          errors: formatZodErrors(error),
        });
      }

      const userId = user.id;
      const messageData: MessageCreate = { userId, title, content };

      LOGGER.info("Creating message", {
        requestId,
        userId,
        username: user.username,
        title,
        contentLength: content.length,
        ip,
      });

      const newMessage = await MessageService.createMessage(messageData);

      LOGGER.info("Message created successfully", {
        requestId,
        messageId: newMessage.id,
        userId,
        username: user.username,
        title,
        ip,
      });

      res.redirect("/");
    } catch (error) {
      LOGGER.error("Message creation error", {
        requestId,
        userId: (req.user as SafeUser)?.id,
        username: (req.user as SafeUser)?.username,
        error: (error as Error).message,
        stack: (error as Error).stack,
        ip,
      });

      render("create-message", res, req, {
        errors: [
          error instanceof Error
            ? error.message
            : "An unexpected error occurred. Please try again.",
        ],
      });
    }
  }

  async getCreateMessage(req: Request, res: Response) {
    render("create-message", res, req);
  }

  async getDeleteConfirmation(req: Request, res: Response, next: NextFunction) {
    const { requestId, ip } = req;
    const user = req.user as SafeUser;
    const messageId = Number(req.params.id);

    LOGGER.info("Delete confirmation request", {
      requestId,
      userId: user.id,
      username: user.username,
      messageId,
      ip,
    });

    try {
      const message = await MessageService.getMessageById(messageId);

      if (!message) {
        throw notFound("Message not found", req, {
          messageId,
        });
      }

      if (user.id !== message.userId && !user.isAdmin) {
        throw forbidden(
          "You are not allowed to delete this message",
          req,
          {
            messageId,
            messageAuthorId: message.userId,
            isAdmin: user.isAdmin,
          },
          {
            logTitle: "Unauthorized delete attempt",
            logLevel: LogLevel.Warn,
          }
        );
      }

      render("delete-message", res, req, {
        message,
      });
    } catch (error) {
      if (error instanceof AppError) {
        next(error);
      } else {
        next(
          errorFor(req).internalError({
            logTitle: "Delete Confirmation Error",
            logLevel: LogLevel.Error,
            message: "An error occurred while loading the message",
            context: {
              messageId,
              error: (error as Error).message,
              stack: (error as Error).stack,
            },
          })
        );
      }
    }
  }

  async deleteMessage(req: Request, res: Response, next: NextFunction) {
    const { requestId, ip } = req;
    const user = req.user as SafeUser;
    const messageId = Number(req.params.id);

    LOGGER.info("Message deletion attempt", {
      requestId,
      userId: user.id,
      username: user.username,
      messageId,
      ip,
    });

    try {
      const err = errorFor(req);
      const message = await MessageService.getMessageById(messageId);

      if (!message)
        throw err.notFound({
          logTitle: "Message not found for deletion",
          logLevel: LogLevel.Warn,
          message: "Message not found",
          context: { messageId },
        });

      if (user.id !== message.userId && !user.isAdmin)
        throw err.forbidden({
          logTitle: "Unauthorized delete attempt",
          logLevel: LogLevel.Warn,
          message: "You are not allowed to delete this message",
          context: {
            messageId,
            messageAuthorId: message.userId,
            isAdmin: user.isAdmin,
          },
        });

      await MessageService.deleteMessage(messageId);

      LOGGER.info("Message deleted successfully", {
        requestId,
        messageId,
        deletedBy: user.id,
        deletedByUsername: user.username,
        messageAuthorId: message.userId,
        messageTitle: message.title,
        isAdminAction: user.id !== message.userId,
        ip,
      });

      res.redirect("/?success=deleteMessage");
    } catch (error) {
      if (error instanceof AppError) {
        next(error);
      } else {
        next(
          errorFor(req).internalError({
            logTitle: "Message Deletion Error",
            logLevel: LogLevel.Error,
            message: "An error occurred while deleting the message",
            context: {
              messageId,
              error: (error as Error).message,
              stack: (error as Error).stack,
            },
          })
        );
      }
    }
  }
}

export default new MessageController();
