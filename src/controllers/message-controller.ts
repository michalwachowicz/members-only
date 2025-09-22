import { Request, Response } from "express";
import { MessageService } from "../services";
import type { MessageCreate } from "../types/message";
import type { SafeUser } from "../types/user";
import { MessageSchema } from "../validations/message-validation";
import { formatZodErrors } from "../utils/zod-formatter";

class MessageController {
  async createMessage(req: Request, res: Response) {
    try {
      if (!req.isAuthenticated()) {
        res.redirect("/auth/login");
        return;
      }

      const user = req.user as SafeUser;
      if (!user.isMember) {
        res.redirect("/auth/upgrade");
        return;
      }

      const { title, content } = req.body;
      const { error } = MessageSchema.safeParse(req.body);

      if (error) {
        res.render("create-message", {
          errors: formatZodErrors(error),
          user: req.user,
          isAuthenticated: req.isAuthenticated(),
        });
        return;
      }

      const userId = user.id;
      const messageData: MessageCreate = { userId, title, content };

      await MessageService.createMessage(messageData);
      res.redirect("/");
    } catch (error) {
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
    if (!req.isAuthenticated()) return res.redirect("/auth/login");
    if (!(req.user as SafeUser).isMember) return res.redirect("/auth/upgrade");

    const user = req.user as SafeUser;
    const messageId = Number(req.params.id);

    try {
      const message = await MessageService.getMessageById(messageId);

      if (!message) {
        return res.render("error", {
          title: "Not Found",
          message: "Message not found",
        });
      }

      // Check if user can delete this message
      if (user.id !== message.userId && !user.isAdmin) {
        return res.render("error", {
          title: "Forbidden",
          message: "You are not allowed to delete this message",
        });
      }

      res.render("delete-message", {
        message,
        user: req.user,
        isAuthenticated: req.isAuthenticated(),
      });
    } catch (error) {
      res.render("error", {
        title: "Error",
        message: "An error occurred while loading the message",
      });
    }
  }

  async deleteMessage(req: Request, res: Response) {
    if (!req.isAuthenticated()) return res.redirect("/auth/login");
    if (!(req.user as SafeUser).isMember) return res.redirect("/auth/upgrade");

    const user = req.user as SafeUser;
    const messageId = Number(req.params.id);

    try {
      const message = await MessageService.getMessageById(messageId);

      if (!message) {
        return res.render("error", {
          title: "Not Found",
          message: "Message not found",
        });
      }

      // Check if user can delete this message
      if (user.id !== message.userId && !user.isAdmin) {
        return res.render("error", {
          title: "Forbidden",
          message: "You are not allowed to delete this message",
        });
      }

      await MessageService.deleteMessage(messageId);
      res.redirect("/?success=deleteMessage");
    } catch (error) {
      res.render("error", {
        title: "Error",
        message: "An error occurred while deleting the message",
      });
    }
  }
}

export default new MessageController();
