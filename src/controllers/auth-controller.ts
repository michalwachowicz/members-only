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
}

export default new AuthController();
