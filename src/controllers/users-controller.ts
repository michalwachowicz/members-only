import { Request, Response } from "express";
import type { SafeUser } from "../types/user";
import { MessageService, UserService } from "../services";
import { LogLevel } from "../utils/logger";
import { AppError } from "../error/AppError";

class UserController {
  async getUser(req: Request, res: Response) {
    if (!req.isAuthenticated()) return res.redirect("/auth/login");

    const authUser = req.user as SafeUser;
    if (!authUser.isMember) return res.redirect("/auth/upgrade");

    const id = req.params.id;
    if (!id || isNaN(Number(id))) {
      throw new AppError("Invalid User ID", "Invalid user ID", {
        logTitle: "Invalid User ID",
        logLevel: LogLevel.Error,
        logContext: {
          requestId: req.requestId,
          userId: (req.user as SafeUser).id,
          username: (req.user as SafeUser).username,
          ip: req.ip,
        },
      });
    }

    if (id === (req.user as SafeUser).id.toString()) {
      res.redirect("/account");
      return;
    }

    try {
      const user = await UserService.getSafeUserById(Number(id));
      if (!user) {
        throw new AppError("User Not Found", "User not found", {
          logTitle: "User Not Found",
          logLevel: LogLevel.Warn,
          logContext: {
            requestId: req.requestId,
            userId: (req.user as SafeUser).id,
            username: (req.user as SafeUser).username,
            targetUserId: id,
            ip: req.ip,
          },
        });
      }

      const messages = await MessageService.getMessagesByUserId(
        user.id,
        user.isMember
      );

      const canDelete = authUser.id === user.id || authUser.isAdmin;

      res.render("user", {
        user,
        messages: messages.map((message) => ({
          ...message,
          canDelete,
        })),
        isAuthenticated: req.isAuthenticated(),
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError("Database Error", "Failed to fetch user data", {
        logTitle: "User data fetch failed",
        logLevel: LogLevel.Error,
        logContext: {
          requestId: req.requestId,
          userId: (req.user as SafeUser).id,
          username: (req.user as SafeUser).username,
          targetUserId: id,
          error: (error as Error).message,
          stack: (error as Error).stack,
          ip: req.ip,
        },
      });
    }
  }

  async getUsers(req: Request, res: Response) {
    if (!req.isAuthenticated()) return res.redirect("/auth/login");
    if (!(req.user as SafeUser).isMember) return res.redirect("/auth/upgrade");

    try {
      const users = await UserService.getSafeUsers();
      res.render("users", {
        users,
        isAuthenticated: req.isAuthenticated(),
        user: req.user,
      });
    } catch (error) {
      throw new AppError("Database Error", "Failed to fetch users", {
        logTitle: "Users fetch failed",
        logLevel: LogLevel.Error,
        logContext: {
          requestId: req.requestId,
          userId: (req.user as SafeUser).id,
          username: (req.user as SafeUser).username,
          error: (error as Error).message,
          stack: (error as Error).stack,
          ip: req.ip,
        },
      });
    }
  }
}

export default new UserController();
