import { Router } from "express";
import { checkAuth } from "../middlewares/auth-middleware";
import accountController from "../controllers/account-controller";

const accountRouter = Router();

accountRouter.get("/", checkAuth, accountController.getAccount);
accountRouter.post("/update", checkAuth, accountController.updateAccount);
accountRouter.post("/delete", checkAuth, accountController.deleteAccount);

export default accountRouter;
