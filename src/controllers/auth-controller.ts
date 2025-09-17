import { Request, Response } from "express";
import { UserService } from "../services";

class AuthController {
  async register(req: Request, res: Response) {
    try {
      const user = req.body;
      const newUser = await UserService.createUser(user);

      const { password, ...safeUser } = newUser;

      res.status(201).json(safeUser);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }

  async getLogin(req: Request, res: Response) {
    if (req.isAuthenticated()) return res.redirect("/");
    res.render("login");
  }

  async getRegister(req: Request, res: Response) {
    if (req.isAuthenticated()) return res.redirect("/");
    res.render("register");
  }

  async logout(req: Request, res: Response) {
    req.logout((err) => {
      if (err) return res.status(500).json({ message: (err as Error).message });
      res.redirect("/");
    });
  }
}

export default new AuthController();
