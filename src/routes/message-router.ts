import { Router } from "express";
import { checkAuth, checkMember } from "../middlewares/auth-middleware";
import messageController from "../controllers/message-controller";

const messageRouter = Router();

messageRouter.post(
  "/create",
  checkAuth,
  checkMember,
  messageController.createMessage
);

messageRouter.get(
  "/create",
  checkAuth,
  checkMember,
  messageController.getCreateMessage
);

messageRouter.get(
  "/delete/:id/confirm",
  checkAuth,
  checkMember,
  messageController.getDeleteConfirmation
);

messageRouter.post(
  "/delete/:id",
  checkAuth,
  checkMember,
  messageController.deleteMessage
);

export default messageRouter;
