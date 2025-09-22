import { Router } from "express";
import messageController from "../controllers/message-controller";

const messageRouter = Router();

messageRouter.post("/create", messageController.createMessage);
messageRouter.get("/create", messageController.getCreateMessage);
messageRouter.get(
  "/delete/:id/confirm",
  messageController.getDeleteConfirmation
);
messageRouter.post("/delete/:id", messageController.deleteMessage);

export default messageRouter;
