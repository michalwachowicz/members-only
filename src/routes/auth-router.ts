import { Router } from "express";
import passport from "passport";
import authController from "../controllers/auth-controller";

const authRouter = Router();

authRouter.post("/register", authController.register);
authRouter.post(
  "/login",
  authController.login,
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/auth/login",
    failureMessage: true,
  })
);

authRouter.get("/login", authController.getLogin);
authRouter.get("/register", authController.getRegister);
authRouter.get("/logout", authController.logout);

export default authRouter;
