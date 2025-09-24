import passport from "passport";
import { Request, Response } from "express";
import { SafeUser } from "../types/user";

export interface AuthResult {
  user: SafeUser | null;
  info: { message?: string } | null;
}

export interface LoginResult {
  success: boolean;
  user?: SafeUser;
  error?: string;
}

const authenticateLocal = (
  req: Request,
  res: Response
): Promise<AuthResult> => {
  return new Promise((resolve, reject) => {
    passport.authenticate(
      "local",
      (
        err: Error | null,
        user: SafeUser | null,
        info: { message?: string } | null
      ) => {
        if (err) reject(err);
        else resolve({ user, info });
      }
    )(req, res);
  });
};

const loginSession = (req: Request, user: SafeUser): Promise<void> => {
  return new Promise((resolve, reject) => {
    req.logIn(user, (err: Error | null) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

export const completeLogin = async (
  req: Request,
  res: Response
): Promise<LoginResult> => {
  try {
    const { user, info } = await authenticateLocal(req, res);

    if (!user) {
      return {
        success: false,
        error: info?.message || "Invalid username or password",
      };
    }

    await loginSession(req, user);

    return { success: true, user };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
};

export default {
  authenticateLocal,
  loginSession,
  completeLogin,
};
