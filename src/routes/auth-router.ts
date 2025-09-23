import { Router } from "express";
import { checkAuth } from "../middlewares/auth-middleware";
import authController from "../controllers/auth-controller";

const authRouter = Router();

authRouter.post("/register", authController.register);
authRouter.post("/login", authController.login);

authRouter.get("/login", authController.getLogin);
authRouter.get("/register", authController.getRegister);

authRouter.get("/upgrade", checkAuth, authController.getUpgrade);
authRouter.post("/upgrade", checkAuth, authController.upgrade);

authRouter.get("/logout", authController.logout);

export default authRouter;
