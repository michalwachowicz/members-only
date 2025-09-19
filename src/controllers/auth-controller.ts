import passport from "passport";
import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AuthService, UserService } from "../services";
import { LoginSchema, RegisterSchema } from "../validations/auth-validation";
import { formatZodErrors } from "../utils/zod-formatter";
import { SafeUser } from "../types/user";

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
          isAuthenticated: false,
          user: null,
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
        isAuthenticated: false,
        user: null,
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
            isAuthenticated: false,
            user: null,
          });
        }
        if (!user) {
          return res.render("login", {
            errors: [info?.message || "Invalid username or password."],
            formData: req.body,
            isAuthenticated: false,
            user: null,
          });
        }
        req.logIn(user, (err) => {
          if (err) {
            return res.render("login", {
              errors: ["An error occurred during login. Please try again."],
              formData: req.body,
              isAuthenticated: false,
              user: null,
            });
          }
          return res.redirect("/");
        });
      })(req, res, next);
    } catch (error) {
      res.render("login", {
        errors: formatZodErrors(error as ZodError),
        isAuthenticated: false,
        user: null,
        formData: req.body,
      });
    }
  }

  async getLogin(req: Request, res: Response) {
    if (req.isAuthenticated()) return res.redirect("/");

    res.render("login", {
      isAuthenticated: false,
      user: null,
    });
  }

  async getRegister(req: Request, res: Response) {
    if (req.isAuthenticated()) return res.redirect("/");

    res.render("register", {
      isAuthenticated: false,
      user: null,
    });
  }

  async getUpgrade(req: Request, res: Response) {
    if (!req.isAuthenticated()) return res.redirect("/auth/login");
    if ((req.user as SafeUser).isMember) return res.redirect("/");

    res.render("upgrade", {
      user: req.user,
      isAuthenticated: req.isAuthenticated(),
    });
  }

  async upgrade(req: Request, res: Response) {
    if (!req.isAuthenticated()) return res.redirect("/auth/login");

    const user = req.user as SafeUser;
    if (user.isMember) return res.redirect("/");

    const { answer } = req.body;
    if (answer !== "object") {
      return res.render("upgrade", {
        errors: ["Invalid answer."],
        isAuthenticated: req.isAuthenticated(),
        user: req.user,
      });
    }

    await AuthService.upgrade(user.id);

    res.redirect("/?success=upgrade");
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
