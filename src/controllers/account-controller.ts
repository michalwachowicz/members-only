import { Request, Response } from "express";
import { MessageService, UserService } from "../services";
import { SafeUser } from "../types/user";

class AccountController {
  async getAccount(req: Request, res: Response) {
    if (!req.isAuthenticated()) return res.redirect("/auth/login");

    const user = req.user as SafeUser;
    const account = await UserService.getSafeUserById(user.id);
    const messages = await MessageService.getMessagesByUserId(user.id);

    res.render("account", { account, messages });
  }
}

export default new AccountController();
