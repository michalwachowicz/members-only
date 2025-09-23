import passport from "passport";
import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AuthService, UserService } from "../services";
import { LoginSchema, RegisterSchema } from "../validations/auth-validation";
import { formatZodErrors } from "../utils/zod-formatter";
import { SafeUser } from "../types/user";
import { LOGGER } from "../utils/logger";
import { AppError } from "../error/AppError";

class AuthController {
  async register(req: Request, res: Response) {
    const { username, firstName, lastName } = req.body;
    const { ip, requestId } = req;

    try {
      LOGGER.info("Registration attempt", {
        requestId,
        username,
        firstName,
        lastName,
        ip,
      });

      const errors: string[] = [];
      const existingUser = await UserService.getUserByUsername(username);

      if (existingUser) {
        errors.push("Username: Username already exists");
        LOGGER.warn("Registration failed - username already exists", {
          requestId,
          username,
          ip,
        });
      }

      const parseResult = RegisterSchema.safeParse(req.body);
      if (!parseResult.success) {
        errors.push(...formatZodErrors(parseResult.error));
        LOGGER.warn("Registration failed - validation error", {
          requestId,
          username,
          errors: formatZodErrors(parseResult.error),
          ip,
        });
      }

      if (errors.length > 0) {
        return res.render("register", {
          errors,
          formData: req.body,
          isAuthenticated: false,
          user: null,
        });
      }

      const { password } = parseResult.data!;
      const newUser = await UserService.createUser({
        username,
        password,
        firstName,
        lastName,
      });

      LOGGER.info("User registered successfully", {
        requestId,
        userId: newUser.id,
        username,
        firstName,
        lastName,
        ip,
      });

      res.redirect("/auth/login");
    } catch (error) {
      LOGGER.error("Registration error", {
        requestId,
        username,
        error: (error as Error).message,
        stack: (error as Error).stack,
        ip,
      });

      res.render("register", {
        errors: ["An unexpected error occurred. Please try again."],
        formData: req.body,
        isAuthenticated: false,
        user: null,
      });
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    const { username } = req.body;
    const { ip, requestId } = req;

    try {
      LOGGER.info("Login attempt", {
        requestId,
        username,
        ip,
      });

      LoginSchema.parse(req.body);
      passport.authenticate("local", (err: any, user: any, info: any) => {
        if (err) {
          LOGGER.error("Login error", {
            requestId,
            username,
            error: err.message,
            stack: err.stack,
            ip,
          });

          return res.render("login", {
            errors: ["An error occurred during login. Please try again."],
            formData: req.body,
            isAuthenticated: false,
            user: null,
          });
        }
        if (!user) {
          LOGGER.warn("Failed login attempt", {
            requestId,
            username,
            reason: info?.message || "Invalid username or password",
            ip,
          });

          return res.render("login", {
            errors: [info?.message || "Invalid username or password."],
            formData: req.body,
            isAuthenticated: false,
            user: null,
          });
        }
        req.logIn(user, (err) => {
          if (err) {
            LOGGER.error("Session creation error", {
              requestId,
              username,
              userId: user.id,
              error: err.message,
              ip,
            });

            return res.render("login", {
              errors: ["An error occurred during login. Please try again."],
              formData: req.body,
              isAuthenticated: false,
              user: null,
            });
          }

          LOGGER.info("User logged in successfully", {
            requestId,
            userId: user.id,
            username,
            isMember: user.isMember,
            isAdmin: user.isAdmin,
            ip,
          });

          return res.redirect("/");
        });
      })(req, res, next);
    } catch (error) {
      LOGGER.warn("Login validation error", {
        requestId,
        username,
        errors: formatZodErrors(error as ZodError),
        ip,
      });

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
    const { requestId, ip } = req;

    if (user.isMember) return res.redirect("/");

    LOGGER.info("Upgrade attempt", {
      requestId,
      userId: user.id,
      username: user.username,
      ip,
    });

    const { answer } = req.body;
    if (answer !== "object") {
      LOGGER.warn("Upgrade failed - invalid answer", {
        requestId,
        userId: user.id,
        username: user.username,
        answer,
        ip,
      });

      return res.render("upgrade", {
        errors: ["Invalid answer."],
        isAuthenticated: req.isAuthenticated(),
        user: req.user,
      });
    }

    try {
      await AuthService.upgrade(user.id);

      LOGGER.info("User upgraded to member", {
        requestId,
        userId: user.id,
        username: user.username,
        ip,
      });

      res.redirect("/?success=upgrade");
    } catch (error) {
      LOGGER.error("Upgrade error", {
        requestId,
        userId: user.id,
        username: user.username,
        error: (error as Error).message,
        stack: (error as Error).stack,
        ip,
      });

      res.render("upgrade", {
        errors: ["An error occurred during upgrade. Please try again."],
        isAuthenticated: req.isAuthenticated(),
        user: req.user,
      });
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    const user = req.user as SafeUser;
    const { requestId, ip } = req;

    LOGGER.info("Logout attempt", {
      requestId,
      userId: user?.id,
      username: user?.username,
      ip,
    });

    req.logout((err) => {
      if (err) {
        next(
          new AppError("Logout Error", (err as Error).message, {
            logContext: {
              requestId,
              userId: user?.id,
              username: user?.username,
              error: err.message,
              ip,
            },
          })
        );
      }

      LOGGER.info("User logged out successfully", {
        requestId,
        userId: user?.id,
        username: user?.username,
        ip,
      });

      res.redirect("/");
    });
  }
}

export default new AuthController();
