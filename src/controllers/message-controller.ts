import { Request, Response } from "express";
import { MessageService } from "../services";
import type { MessageCreate } from "../types/message";
import type { SafeUser } from "../types/user";
import { MessageSchema } from "../validations/message-validation";
import { formatZodErrors } from "../utils/zod-formatter";
import { LOGGER } from "../utils/logger";

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

  async getDeleteConfirmation(req: Request, res: Response) {
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
        LOGGER.warn("Message not found for deletion", {
          requestId,
          userId: user.id,
          username: user.username,
          messageId,
          ip,
        });

        return res.render("error", {
          title: "Not Found",
          message: "Message not found",
          user: req.user,
          isAuthenticated: req.isAuthenticated(),
        });
      }

      // Check if user can delete this message
      if (user.id !== message.userId && !user.isAdmin) {
        LOGGER.warn("Unauthorized delete attempt", {
          requestId,
          userId: user.id,
          username: user.username,
          messageId,
          messageAuthorId: message.userId,
          isAdmin: user.isAdmin,
          ip,
        });

        return res.render("error", {
          title: "Forbidden",
          message: "You are not allowed to delete this message",
          user: req.user,
          isAuthenticated: req.isAuthenticated(),
        });
      }

      res.render("delete-message", {
        message,
        user: req.user,
        isAuthenticated: req.isAuthenticated(),
      });
    } catch (error) {
      LOGGER.error("Delete confirmation error", {
        requestId,
        userId: user.id,
        username: user.username,
        messageId,
        error: (error as Error).message,
        stack: (error as Error).stack,
        ip,
      });

      res.render("error", {
        title: "Error",
        message: "An error occurred while loading the message",
        user: req.user,
        isAuthenticated: req.isAuthenticated(),
      });
    }
  }

  async deleteMessage(req: Request, res: Response) {
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
        LOGGER.warn("Message not found for deletion", {
          requestId,
          userId: user.id,
          username: user.username,
          messageId,
          ip,
        });

        return res.render("error", {
          title: "Not Found",
          message: "Message not found",
          user: req.user,
          isAuthenticated: req.isAuthenticated(),
        });
      }

      if (user.id !== message.userId && !user.isAdmin) {
        LOGGER.warn("Unauthorized message deletion attempt", {
          requestId,
          userId: user.id,
          username: user.username,
          messageId,
          messageAuthorId: message.userId,
          isAdmin: user.isAdmin,
          ip,
        });

        return res.render("error", {
          title: "Forbidden",
          message: "You are not allowed to delete this message",
          user: req.user,
          isAuthenticated: req.isAuthenticated(),
        });
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
      LOGGER.error("Message deletion error", {
        requestId,
        userId: user.id,
        username: user.username,
        messageId,
        error: (error as Error).message,
        stack: (error as Error).stack,
        ip,
      });

      res.render("error", {
        title: "Error",
        message: "An error occurred while deleting the message",
        user: req.user,
        isAuthenticated: req.isAuthenticated(),
      });
    }
  }
}

export default new MessageController();
