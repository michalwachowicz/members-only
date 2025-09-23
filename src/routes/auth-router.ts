import { Router } from "express";
import { checkAuth } from "../middlewares/auth-middleware";
import authController from "../controllers/auth-controller";
import { validateBody } from "../middlewares/validate";
import { LoginSchema, RegisterSchema } from "../validations/auth-validation";

const authRouter = Router();

authRouter.post(
  "/register",
  validateBody(RegisterSchema),
  authController.register
);
authRouter.post("/login", validateBody(LoginSchema), authController.login);

authRouter.get("/login", authController.getLogin);
authRouter.get("/register", authController.getRegister);

authRouter.get("/upgrade", checkAuth, authController.getUpgrade);
authRouter.post("/upgrade", checkAuth, authController.upgrade);

authRouter.get("/logout", authController.logout);

export default authRouter;
