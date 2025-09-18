import passport from "passport";
import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { UserService } from "../services";
import { LoginSchema, RegisterSchema } from "../validations/auth-validation";
import { formatZodErrors } from "../utils/zod-formatter";

class AuthController {
  async register(req: Request, res: Response) {
    try {
      const errors: string[] = [];
      const existingUser = await UserService.getUserByUsername(
        req.body.username
      );

      if (existingUser) {
        errors.push("Username: Username already exists");
      }

      const parseResult = RegisterSchema.safeParse(req.body);
      if (!parseResult.success) {
        errors.push(...formatZodErrors(parseResult.error));
      }

      if (errors.length > 0) {
        return res.render("register", {
          errors,
          formData: req.body,
        });
      }

      const { username, password, firstName, lastName } = parseResult.data!;
      await UserService.createUser({
        username,
        password,
        firstName,
        lastName,
      });

      res.redirect("/auth/login");
    } catch (error) {
      res.render("register", {
        errors: ["An unexpected error occurred. Please try again."],
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
            errors: ["An error occurred during login. Please try again."],
            formData: req.body,
          });
        }
        if (!user) {
          return res.render("login", {
            errors: [info?.message || "Invalid username or password."],
            formData: req.body,
          });
        }
        req.logIn(user, (err) => {
          if (err) {
            return res.render("login", {
              errors: ["An error occurred during login. Please try again."],
              formData: req.body,
            });
          }
          return res.redirect("/");
        });
      })(req, res, next);
    } catch (error) {
      res.render("login", {
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
          title: "Logout Error",
          message: (err as Error).message,
        });
      }
      res.redirect("/");
    });
  }
}

export default new AuthController();
