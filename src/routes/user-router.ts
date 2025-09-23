import { Router } from "express";
import { checkAuth, checkMember } from "../middlewares/auth-middleware";
import userController from "../controllers/users-controller";

const userRouter = Router();

userRouter.get("/:id", checkAuth, checkMember, userController.getUser);
userRouter.get("/", checkAuth, checkMember, userController.getUsers);

export default userRouter;
