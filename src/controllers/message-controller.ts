import { Request, Response, NextFunction } from "express";
import { MessageService } from "../services";
import type { MessageCreate } from "../types/message";
import type { SafeUser } from "../types/user";
import { MessageSchema } from "../validations/message-validation";
import { formatZodErrors } from "../utils/zod-formatter";
import { LOGGER, LogLevel } from "../utils/logger";
import { AppError } from "../error/AppError";

class MessageController {
  async createMessage(req: Request, res: Response) {
    const { requestId, ip } = req;

    try {
      if (!req.isAuthenticated()) {
        LOGGER.warn("Unauthenticated message creation attempt", {
          requestId,
          ip,
        });
        res.redirect("/auth/login");
        return;
      }

      const user = req.user as SafeUser;
      if (!user.isMember) {
        LOGGER.warn("Non-member message creation attempt", {
          requestId,
          userId: user.id,
          username: user.username,
          ip,
        });
        res.redirect("/auth/upgrade");
        return;
      }

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

        res.render("create-message", {
          errors: formatZodErrors(error),
          user: req.user,
          isAuthenticated: req.isAuthenticated(),
        });
        return;
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

      res.render("create-message", {
        errors: [
          error instanceof Error
            ? error.message
            : "An unexpected error occurred. Please try again.",
        ],
        user: req.user,
        isAuthenticated: req.isAuthenticated(),
      });
    }
  }

  async getCreateMessage(req: Request, res: Response) {
    if (!req.isAuthenticated()) return res.redirect("/auth/login");
    if (!(req.user as SafeUser).isMember) return res.redirect("/auth/upgrade");

    res.render("create-message", {
      user: req.user,
      isAuthenticated: req.isAuthenticated(),
    });
  }

  async getDeleteConfirmation(req: Request, res: Response, next: NextFunction) {
    const { requestId, ip } = req;

    if (!req.isAuthenticated()) {
      LOGGER.warn("Unauthenticated delete confirmation attempt", {
        requestId,
        ip,
      });
      return res.redirect("/auth/login");
    }

    if (!(req.user as SafeUser).isMember) {
      LOGGER.warn("Non-member delete confirmation attempt", {
        requestId,
        userId: (req.user as SafeUser).id,
        username: (req.user as SafeUser).username,
        ip,
      });
      return res.redirect("/auth/upgrade");
    }

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
        throw new AppError("Not Found", "Message not found", {
          logTitle: "Message not found for deletion",
          logLevel: LogLevel.Warn,
          logContext: {
            requestId,
            userId: user.id,
            username: user.username,
            messageId,
            ip,
          },
        });
      }

      if (user.id !== message.userId && !user.isAdmin) {
        throw new AppError(
          "Forbidden",
          "You are not allowed to delete this message",
          {
            logTitle: "Unauthorized delete attempt",
            logLevel: LogLevel.Warn,
            logContext: {
              requestId,
              userId: user.id,
              username: user.username,
              messageId,
              messageAuthorId: message.userId,
              isAdmin: user.isAdmin,
              ip,
            },
          }
        );
      }

      res.render("delete-message", {
        message,
        user: req.user,
        isAuthenticated: req.isAuthenticated(),
      });
    } catch (error) {
      if (error instanceof AppError) {
        next(error);
      } else {
        next(
          new AppError("Error", "An error occurred while loading the message", {
            logTitle: "Delete Confirmation Error",
            logLevel: LogLevel.Error,
            logContext: {
              requestId,
              userId: user.id,
              username: user.username,
              messageId,
              error: (error as Error).message,
              stack: (error as Error).stack,
              ip,
            },
          })
        );
      }
    }
  }

  async deleteMessage(req: Request, res: Response, next: NextFunction) {
    const { requestId, ip } = req;

    if (!req.isAuthenticated()) {
      LOGGER.warn("Unauthenticated message deletion attempt", {
        requestId,
        ip,
      });
      return res.redirect("/auth/login");
    }

    if (!(req.user as SafeUser).isMember) {
      LOGGER.warn("Non-member message deletion attempt", {
        requestId,
        userId: (req.user as SafeUser).id,
        username: (req.user as SafeUser).username,
        ip,
      });
      return res.redirect("/auth/upgrade");
    }

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
      const message = await MessageService.getMessageById(messageId);

      if (!message) {
        throw new AppError("Not Found", "Message not found", {
          logTitle: "Message not found for deletion",
          logLevel: LogLevel.Warn,
          logContext: {
            requestId,
            userId: user.id,
            username: user.username,
            messageId,
            ip,
          },
        });
      }

      if (user.id !== message.userId && !user.isAdmin) {
        throw new AppError(
          "Forbidden",
          "You are not allowed to delete this message",
          {
            logTitle: "Unauthorized delete attempt",
            logLevel: LogLevel.Warn,
            logContext: {
              requestId,
              userId: user.id,
              username: user.username,
              messageId,
              messageAuthorId: message.userId,
              isAdmin: user.isAdmin,
              ip,
            },
          }
        );
      }

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
          new AppError(
            "Error",
            "An error occurred while deleting the message",
            {
              logTitle: "Message Deletion Error",
              logLevel: LogLevel.Error,
              logContext: {
                requestId,
                userId: user.id,
                username: user.username,
                messageId,
                error: (error as Error).message,
                stack: (error as Error).stack,
                ip,
              },
            }
          )
        );
      }
    }
  }
}

export default new MessageController();
