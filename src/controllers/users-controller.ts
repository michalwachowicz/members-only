import { Request, Response } from "express";
import type { SafeUser } from "../types/user";
import { MessageService, UserService } from "../services";

class UserController {
  async getUser(req: Request, res: Response) {
    if (!req.isAuthenticated()) return res.redirect("/auth/login");

    const authUser = req.user as SafeUser;
    if (!authUser.isMember) return res.redirect("/auth/upgrade");

    const id = req.params.id;
    if (!id || isNaN(Number(id))) {
      res.render("error", {
        title: "Invalid User ID",
        message: "Invalid user ID",
      });
      return;
    }

    if (id === (req.user as SafeUser).id.toString()) {
      res.redirect("/account");
      return;
    }

    const user = await UserService.getSafeUserById(Number(id));
    if (!user) {
      res.render("error", {
        title: "User Not Found",
        message: "User not found",
      });
      return;
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
  }

  async getUsers(req: Request, res: Response) {
    if (!req.isAuthenticated()) return res.redirect("/auth/login");
    if (!(req.user as SafeUser).isMember) return res.redirect("/auth/upgrade");

    const users = await UserService.getSafeUsers();
    res.render("users", {
      users,
      isAuthenticated: req.isAuthenticated(),
      user: req.user,
    });
  }
}

export default new UserController();
