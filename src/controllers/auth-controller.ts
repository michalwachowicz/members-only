import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { UserService } from "../services";
import { LoginSchema, RegisterSchema } from "../validations/auth-validation";
import { formatZodErrors } from "../utils/zod-formatter";

class AuthController {
  async register(req: Request, res: Response) {
    try {
      const user = RegisterSchema.parse(req.body);
      const newUser = await UserService.createUser(user);

      const { password, ...safeUser } = newUser;

      res.render("register", {
        success: true,
        user: safeUser,
        message: "Registration successful! You can now login.",
      });
    } catch (error) {
      res.render("register", {
        success: false,
        errors: formatZodErrors(error as ZodError),
        formData: req.body,
      });
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      LoginSchema.parse(req.body);
      next();
    } catch (error) {
      res.render("login", {
        success: false,
        errors: formatZodErrors(error as ZodError),
        formData: req.body,
      });
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
      if (err) {
        return res.render("error", {
          message: (err as Error).message,
          title: "Logout Error",
        });
      }
      res.redirect("/");
    });
  }
}

export default new AuthController();
