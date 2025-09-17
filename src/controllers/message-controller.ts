import { Request, Response } from "express";
import MessageService from "../services/message-service";
import type { MessageCreate } from "../types/message";
import type { SafeUser, User } from "../types/user";

class MessageController {
  async createMessage(req: Request, res: Response) {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const user = req.user as User;
      if (!user.isMember) {
        return res
          .status(403)
          .json({ message: "Membership required to create messages" });
      }

      const { title, content } = req.body;

      if (!title || !content) {
        return res
          .status(400)
          .json({ message: "Title and content are required" });
      }

      const userId = user.id;
      const messageData: MessageCreate = { userId, title, content };

      await MessageService.createMessage(messageData);
      res.redirect("/");
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  }

  async getCreateMessage(req: Request, res: Response) {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const user = req.user as SafeUser;
    if (!user.isMember) {
      return res
        .status(403)
        .json({ message: "Membership required to create messages" });
    }

    res.render("create-message");
  }
}

export default new MessageController();
