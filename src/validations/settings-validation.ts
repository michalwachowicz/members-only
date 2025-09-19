import { z } from "zod";
import {
  PasswordSchema,
  ConfirmPasswordSchema,
  UsernameSchema,
  FirstNameSchema,
  LastNameSchema,
} from "./field-validation";

export const PasswordChangeSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  password: PasswordSchema(true),
  confirmPassword: ConfirmPasswordSchema,
});

export const ProfileChangeSchema = z.object({
  username: UsernameSchema,
  firstName: FirstNameSchema,
  lastName: LastNameSchema,
});
