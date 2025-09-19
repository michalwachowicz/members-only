import { z } from "zod";

export const PasswordSchema = (isNewPassword = false) =>
  z
    .string()
    .min(
      8,
      `${isNewPassword ? "New " : ""}Password must be at least 8 characters`
    )
    .max(
      100,
      `${isNewPassword ? "New " : ""}Password must be less than 100 characters`
    )
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      `${
        isNewPassword ? "New " : ""
      }Password must contain at least one lowercase letter, one uppercase letter, and one number`
    );

export const ConfirmPasswordSchema = z
  .string()
  .min(1, "Confirm password is required");

export const UsernameSchema = z
  .string()
  .min(5, "Username must be at least 5 characters")
  .max(50, "Username must be less than 50 characters")
  .regex(
    /^[a-zA-Z0-9_]+$/,
    "Username can only contain letters, numbers, and underscores"
  );

export const FirstNameSchema = z
  .string()
  .min(1, "First name is required")
  .max(50, "First name must be less than 50 characters")
  .trim();

export const LastNameSchema = z
  .string()
  .min(1, "Last name is required")
  .max(50, "Last name must be less than 50 characters")
  .trim();
