import { Request, Response, NextFunction } from "express";
import { MessageService, UserService } from "../services";
import { SafeUser, User } from "../types/user";
import { LOGGER } from "../utils/logger";
import { AppError } from "../error/AppError";

class AccountController {
  async getAccount(req: Request, res: Response) {
    const user = req.user as SafeUser;
    const account = await UserService.getSafeUserById(user.id);
    const messages = await MessageService.getMessagesByUserId(
      user.id,
      user.isMember
    );

    res.render("account", {
      account,
      messages: messages.map((message) => ({
        ...message,
        canDelete: true,
      })),
      isAuthenticated: req.isAuthenticated(),
    });
  }

  async updateAccount(req: Request, res: Response, next: NextFunction) {
    const user = req.user as User;
    const { requestId, ip } = req;
    const { username, firstName, lastName, password } = req.body;

    LOGGER.info("Account update attempt", {
      requestId,
      userId: user.id,
      username: user.username,
      newUsername: username,
      newFirstName: firstName,
      newLastName: lastName,
      ip,
    });

    try {
      user.username = username;
      user.firstName = firstName;
      user.lastName = lastName;
      user.password = password;

      await UserService.updateUser(user.id, user);

      LOGGER.info("Account updated successfully", {
        requestId,
        userId: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        ip,
      });

      res.redirect("/account");
    } catch (error) {
      next(
        new AppError(
          "Account Update Error",
          "An error occurred while updating your account",
          {
            statusCode: 500,
            logContext: {
              requestId,
              userId: user.id,
              username: user.username,
              error: (error as Error).message,
              stack: (error as Error).stack,
              ip,
            },
          }
        )
      );
    }
  }

  async deleteAccount(req: Request, res: Response, next: NextFunction) {
    const user = req.user as User;
    const { requestId, ip } = req;

    LOGGER.info("Account deletion attempt", {
      requestId,
      userId: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      ip,
    });

    try {
      await UserService.deleteUser(user.id);

      LOGGER.info("Account deleted successfully", {
        requestId,
        userId: user.id,
        username: user.username,
        ip,
      });

      req.logout((err) => {
        if (err) {
          LOGGER.error("Logout error during account deletion", {
            requestId,
            userId: user.id,
            username: user.username,
            error: err.message,
            ip,
          });
          return res.redirect("/auth/login");
        }

        LOGGER.info("User logged out after account deletion", {
          requestId,
          userId: user.id,
          username: user.username,
          ip,
        });
      });

      res.redirect("/auth/login");
    } catch (err) {
      next(
        new AppError(
          "Account Deletion Error",
          "An error occurred while deleting your account",
          {
            statusCode: 500,
            logContext: {
              requestId,
              userId: user.id,
              username: user.username,
              error: (err as Error).message,
              stack: (err as Error).stack,
              ip,
            },
          }
        )
      );
    }
  }
}

export default new AccountController();
