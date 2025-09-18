import { Router } from "express";
import accountController from "../controllers/account-controller";

const accountRouter = Router();

accountRouter.get("/", accountController.getAccount);
accountRouter.post("/update", accountController.updateAccount);
accountRouter.post("/delete", accountController.deleteAccount);

export default accountRouter;
