import passport from "passport";
import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { UserService } from "../services";
import { LoginSchema, RegisterSchema } from "../validations/auth-validation";
import { formatZodErrors } from "../utils/zod-formatter";

class AuthController {
  async register(req: Request, res: Response) {
    try {
      const parsed = RegisterSchema.parse(req.body);
      const { username, password, firstName, lastName } = parsed;
      const newUser = await UserService.createUser({
        username,
        password,
        firstName,
        lastName,
      });

      const { password: _password, ...safeUser } = newUser;

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
      passport.authenticate("local", (err: any, user: any, info: any) => {
        if (err) {
          return res.render("login", {
            success: false,
            error: "An error occurred during login. Please try again.",
            formData: req.body,
          });
        }
        if (!user) {
          return res.render("login", {
            success: false,
            error: info?.message || "Invalid username or password.",
            formData: req.body,
          });
        }
        req.logIn(user, (err) => {
          if (err) {
            return res.render("login", {
              success: false,
              error: "An error occurred during login. Please try again.",
              formData: req.body,
            });
          }
          return res.redirect("/");
        });
      })(req, res, next);
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
