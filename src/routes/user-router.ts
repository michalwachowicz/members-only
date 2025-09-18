import { Router } from "express";
import userController from "../controllers/user-controller";

const userRouter = Router();

userRouter.get("/:id", userController.getUser);

export default userRouter;
