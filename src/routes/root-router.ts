import { Router } from "express";
import rootController from "../controllers/root-controller";

const rootRouter = Router();

rootRouter.get("/", rootController.getHome);

export default rootRouter;
