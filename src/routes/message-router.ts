import { Router } from "express";
import messageController from "../controllers/message-controller";

const messageRouter = Router();

messageRouter.post("/", messageController.createMessage);
messageRouter.get("/create", messageController.getCreateMessage);

export default messageRouter;
