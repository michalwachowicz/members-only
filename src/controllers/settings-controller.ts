import bcrypt from "bcrypt";
import { Request, Response } from "express";
import type { SafeUser } from "../types/user";
import UserService from "../services/user-service";
import {
  PasswordChangeSchema,
  ProfileChangeSchema,
} from "../validations/settings-validation";
import { formatZodErrors } from "../utils/zod-formatter";
import render from "../utils/renderer";

class SettingsController {
  async getSettings(req: Request, res: Response) {
    render("settings", res, req, {
      success: req.query.success === "true",
    });
  }

  async getPasswordSettings(req: Request, res: Response) {
    render("settings-password", res, req, {
      success: req.query.success === "true",
    });
  }

  async updatePassword(req: Request, res: Response) {
    const { currentPassword, password, confirmPassword } = req.body;
    const user = req.user as SafeUser;

    try {
      const { error } = PasswordChangeSchema.safeParse(req.body);
      const errors: string[] = [];

      const fullUser = await UserService.getUserById(user.id);

      if (!(await bcrypt.compare(currentPassword, fullUser?.password || ""))) {
        errors.push("Current password is incorrect");
      }

      if (error) errors.push(...formatZodErrors(error));

      if (password !== confirmPassword) {
        errors.push("New passwords do not match");
      }

      if (errors.length > 0) {
        return render("settings-password", res, req, {
          success: false,
          errors,
        });
      }

      await UserService.updateUser(user.id, { password });

      res.redirect("/settings?success=true");
    } catch (error) {
      render("settings-password", res, req, {
        success: false,
        errors: [
          error instanceof Error ? error.message : "Failed to update password",
        ],
      });
    }
  }

  async getDeleteConfirmation(req: Request, res: Response) {
    render("settings-delete", res, req);
  }

  async deleteAccount(req: Request, res: Response) {
    const { confirmUsername, confirmPassword } = req.body;
    const user = req.user as SafeUser;

    try {
      const errors: string[] = [];

      if (confirmUsername !== user.username) {
        errors.push("Username does not match");
      }

      const fullUser = await UserService.getUserById(user.id);
      if (!(await bcrypt.compare(confirmPassword, fullUser?.password || ""))) {
        errors.push("Password does not match");
      }

      if (errors.length > 0) {
        return render("settings-delete", res, req, {
          errors,
        });
      }

      await UserService.deleteUser(user.id);

      req.logout((err) => {
        if (err) console.error("Logout error:", err);
        res.redirect("/?success=delete");
      });
    } catch (error) {
      render("settings-delete", res, req, {
        errors: [
          error instanceof Error ? error.message : "Failed to delete account",
        ],
      });
    }
  }

  async updateProfile(req: Request, res: Response) {
    const { username, firstName, lastName } = req.body;
    const user = req.user as SafeUser;

    try {
      const { error } = ProfileChangeSchema.safeParse(req.body);
      const errors: string[] = [];

      if (
        username === user.username &&
        firstName === user.firstName &&
        lastName === user.lastName
      ) {
        throw new Error("No changes made");
      }

      const existingUser = await UserService.getUserByUsername(username);
      if (existingUser && existingUser.id !== user.id) {
        errors.push("Username already exists");
      }

      if (error) errors.push(...formatZodErrors(error));

      if (errors.length > 0) {
        return render("settings", res, req, {
          success: false,
          errors,
        });
      }

      await UserService.updateUser(user.id, {
        id: user.id,
        username,
        firstName,
        lastName,
      });

      res.redirect("/settings?success=true");
    } catch (error) {
      render("settings", res, req, {
        success: false,
        errors: [
          error instanceof Error ? error.message : "Failed to update profile",
        ],
      });
    }
  }
}

export default new SettingsController();
