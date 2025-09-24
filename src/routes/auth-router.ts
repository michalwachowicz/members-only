import { Router } from "express";
import { checkAuth, checkGuest } from "../middlewares/auth-middleware";
import authController from "../controllers/auth-controller";
import { validateBody } from "../middlewares/validate";
import { LoginSchema, RegisterSchema } from "../validations/auth-validation";

const authRouter = Router();

authRouter.post(
  "/register",
  checkGuest,
  validateBody(RegisterSchema),
  authController.register
);
authRouter.post(
  "/login",
  checkGuest,
  validateBody(LoginSchema),
  authController.login
);

authRouter.get("/login", checkGuest, authController.getLogin);
authRouter.get("/register", checkGuest, authController.getRegister);

authRouter.get("/upgrade", checkAuth, authController.getUpgrade);
authRouter.post("/upgrade", checkAuth, authController.upgrade);

authRouter.get("/logout", authController.logout);

export default authRouter;
