import { Router } from "express";
import accountController from "../controllers/account-controller";

const accountRouter = Router();

accountRouter.get("/", accountController.getAccount);

export default accountRouter;
