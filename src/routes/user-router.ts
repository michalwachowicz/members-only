import { Router } from "express";
import userController from "../controllers/users-controller";

const userRouter = Router();

userRouter.get("/:id", userController.getUser);
userRouter.get("/", userController.getUsers);

export default userRouter;
