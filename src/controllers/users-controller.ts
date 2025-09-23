import { Request, Response } from "express";
import type { SafeUser } from "../types/user";
import { MessageService, UserService } from "../services";
import { LogLevel } from "../utils/logger";
import { AppError } from "../error/AppError";
import render from "../utils/renderer";

class UserController {
  async getUser(req: Request, res: Response) {
    const authUser = req.user as SafeUser;

    const id = req.params.id;
    if (!id || isNaN(Number(id))) {
      throw new AppError("Invalid User ID", "Invalid user ID", {
        logTitle: "Invalid User ID",
        logLevel: LogLevel.Error,
        logContext: {
          requestId: req.requestId,
          userId: authUser.id,
          username: authUser.username,
          ip: req.ip,
        },
      });
    }

    if (id === (req.user as SafeUser).id.toString()) {
      res.redirect("/account");
      return;
    }

    const user = await UserService.getSafeUserById(Number(id));
    if (!user) {
      throw new AppError("User Not Found", "User not found", {
        logTitle: "User Not Found",
        logLevel: LogLevel.Error,
        logContext: {
          requestId: req.requestId,
          userId: authUser.id,
          username: authUser.username,
          ip: req.ip,
        },
      });
    }

    const messages = await MessageService.getMessagesByUserId(
      user.id,
      user.isMember
    );

    const canDelete = authUser.id === user.id || authUser.isAdmin;

    render("user", res, req, {
      visitedUser: user,
      messages: messages.map((message) => ({
        ...message,
        canDelete,
      })),
    });
  }

  async getUsers(req: Request, res: Response) {
    const users = await UserService.getSafeUsers();
    render("users", res, req, { users });
  }
}

export default new UserController();
