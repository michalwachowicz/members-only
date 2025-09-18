import { Router } from "express";
import authController from "../controllers/auth-controller";

const authRouter = Router();

authRouter.post("/register", authController.register);
authRouter.post("/login", authController.login);

authRouter.get("/login", authController.getLogin);
authRouter.get("/register", authController.getRegister);
authRouter.get("/logout", authController.logout);

export default authRouter;
