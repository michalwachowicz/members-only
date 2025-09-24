import { NextFunction, Request, Response } from "express";
import { AuthService, UserService } from "../services";
import { RegisterInput } from "../validations/auth-validation";
import { SafeUser } from "../types/user";
import { LOGGER } from "../utils/logger";
import { AppError } from "../error/AppError";
import render from "../utils/renderer";
import { completeLogin } from "../utils/passport";

class AuthController {
  async register(req: Request, res: Response) {
    const { username, firstName, lastName, password } =
      (req.validatedBody as RegisterInput) ?? req.body;
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
        errors.push("Username already exists");
        LOGGER.warn("Registration failed - username already exists", {
          requestId,
          username,
          ip,
        });
      }

      if (req.validationErrors && req.validationErrors.length > 0) {
        errors.push(...req.validationErrors);
        LOGGER.warn("Registration failed - validation error", {
          requestId,
          username,
          errors,
          ip,
        });
      }

      if (errors.length > 0) {
        return render("register", res, undefined, {
          errors,
          formData: req.body,
        });
      }

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

      render("register", res, req, {
        errors: ["An unexpected error occurred. Please try again."],
        formData: req.body,
      });
    }
  }

  async login(req: Request, res: Response) {
    const { username } = req.body;
    const { ip, requestId } = req;

    try {
      LOGGER.info("Login attempt", {
        requestId,
        username,
        ip,
      });

      if (req.validationErrors && req.validationErrors.length > 0) {
        LOGGER.warn("Login validation error", {
          requestId,
          username,
          errors: req.validationErrors,
          ip,
        });

        return render("login", res, undefined, {
          errors: req.validationErrors,
          formData: req.body,
        });
      }

      const result = await completeLogin(req, res);

      if (!result.success) {
        LOGGER.warn("Failed login attempt", {
          requestId,
          username,
          reason: result.error,
          ip,
        });

        return render("login", res, undefined, {
          errors: [result.error || "Invalid username or password."],
          formData: req.body,
        });
      }

      const user = result.user as SafeUser;
      LOGGER.info("User logged in successfully", {
        requestId,
        userId: user.id,
        username,
        isMember: user.isMember,
        isAdmin: user.isAdmin,
        ip,
      });

      return res.redirect("/");
    } catch (error) {
      LOGGER.error("Login error", {
        requestId,
        username,
        error: (error as Error).message,
        stack: (error as Error).stack,
        ip,
      });

      return render("login", res, undefined, {
        errors: ["An error occurred during login. Please try again."],
        formData: req.body,
      });
    }
  }

  async getLogin(req: Request, res: Response) {
    if (req.isAuthenticated()) return res.redirect("/");
    render("login", res);
  }

  async getRegister(req: Request, res: Response) {
    if (req.isAuthenticated()) return res.redirect("/");
    render("register", res);
  }

  async getUpgrade(req: Request, res: Response) {
    if ((req.user as SafeUser).isMember) return res.redirect("/");
    render("upgrade", res, req);
  }

  async upgrade(req: Request, res: Response) {
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

      return render("upgrade", res, req, {
        errors: ["Invalid answer."],
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
      const { message, stack } = error as Error;
      LOGGER.error("Upgrade error", {
        requestId,
        userId: user.id,
        username: user.username,
        error: message,
        stack,
        ip,
      });

      render("upgrade", res, req, {
        errors: ["An error occurred during upgrade. Please try again."],
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
