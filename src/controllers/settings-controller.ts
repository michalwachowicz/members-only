import { Request, Response } from "express";
import type { SafeUser } from "../types/user";

class SettingsController {
  async getSettings(req: Request, res: Response) {
    if (!req.isAuthenticated()) return res.redirect("/auth/login");

    const user = req.user as SafeUser;
    res.render("settings", { user });
  }
}

export default new SettingsController();
