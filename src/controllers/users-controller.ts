import { Request, Response } from "express";
import type { SafeUser } from "../types/user";
import { MessageService, UserService } from "../services";
import { badRequest, notFound } from "../error/http-errors";
import render from "../utils/renderer";

class UserController {
  async getUser(req: Request, res: Response) {
    const authUser = req.user as SafeUser;

    const id = req.params.id;
    if (!id || isNaN(Number(id))) throw badRequest("Invalid user ID", req);

    if (id === (req.user as SafeUser).id.toString()) {
      res.redirect("/account");
      return;
    }

    const user = await UserService.getSafeUserById(Number(id));
    if (!user) {
      throw notFound("User not found", req, {
        requestedUserId: id,
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
