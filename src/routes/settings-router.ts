import { Router } from "express";
import settingsController from "../controllers/settings-controller";

const settingsRouter = Router();

settingsRouter.get("/", settingsController.getSettings);
settingsRouter.post("/update", settingsController.updateProfile);

settingsRouter.get("/password", settingsController.getPasswordSettings);
settingsRouter.post("/password", settingsController.updatePassword);

settingsRouter.get("/delete", settingsController.getDeleteConfirmation);
settingsRouter.post("/delete", settingsController.deleteAccount);

export default settingsRouter;
