import { Router } from "express";
import passport from "passport";
import authController from "../controllers/auth-controller";

const authRouter = Router();

authRouter.post("/register", authController.register);
authRouter.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/auth/login",
  })
);

authRouter.get("/login", authController.getLogin);
authRouter.get("/register", authController.getRegister);

export default authRouter;
