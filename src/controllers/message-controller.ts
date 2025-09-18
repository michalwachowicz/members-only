import { Request, Response } from "express";
import { MessageService } from "../services";
import type { MessageCreate } from "../types/message";
import type { SafeUser } from "../types/user";

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

      if (!title || !content) {
        res.redirect("/messages/create");
        return;
      }

      const userId = user.id;
      const messageData: MessageCreate = { userId, title, content };

      await MessageService.createMessage(messageData);
      res.redirect("/");
    } catch (error) {
      res.render("error", {
        title: "Message Creation Error",
        message: (error as Error).message,
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
}

export default new MessageController();
