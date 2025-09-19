import { z } from "zod";
import {
  UsernameSchema,
  FirstNameSchema,
  LastNameSchema,
  PasswordSchema,
  ConfirmPasswordSchema,
} from "./field-validation";

export const LoginSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required")
    .max(50, "Username must be less than 50 characters")
    .trim(),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be less than 100 characters"),
});

export const RegisterSchema = z
  .object({
    username: UsernameSchema,
    firstName: FirstNameSchema,
    lastName: LastNameSchema,
    password: PasswordSchema(false),
    confirmPassword: ConfirmPasswordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
