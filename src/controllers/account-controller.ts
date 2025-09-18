import { Request, Response } from "express";
import { MessageService, UserService } from "../services";
import { SafeUser, User } from "../types/user";

class AccountController {
  async getAccount(req: Request, res: Response) {
    if (!req.isAuthenticated()) return res.redirect("/auth/login");

    const user = req.user as SafeUser;
    const account = await UserService.getSafeUserById(user.id);
    const messages = await MessageService.getMessagesByUserId(user.id);

    res.render("account", { account, messages });
  }

  async updateAccount(req: Request, res: Response) {
    if (!req.isAuthenticated()) return res.redirect("/auth/login");

    const user = req.user as User;
    const { username, firstName, lastName, password } = req.body;

    user.username = username;
    user.firstName = firstName;
    user.lastName = lastName;
    user.password = password;

    await UserService.updateUser(user.id, user);

    res.redirect("/account");
  }

  async deleteAccount(req: Request, res: Response) {
    if (!req.isAuthenticated()) return res.redirect("/auth/login");

    try {
      const user = req.user as User;
      await UserService.deleteUser(user.id);

      req.logout((err) => {
        if (err) return res.redirect("/auth/login");
      });

      res.redirect("/auth/login");
    } catch (err) {
      res.render("error", {
        title: "Account Deletion Error",
        message: (err as Error).message,
      });
    }
  }
}

export default new AccountController();
