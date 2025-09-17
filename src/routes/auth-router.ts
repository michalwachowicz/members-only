import { Router } from "express";
import passport from "passport";
import authController from "../controllers/auth-controller";

const authRouter = Router();

authRouter.post("/register", authController.register);
authRouter.post("/login", passport.authenticate("local"));

export default authRouter;
