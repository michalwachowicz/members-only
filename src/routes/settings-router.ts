import { Router } from "express";
import { checkAuth } from "../middlewares/auth-middleware";
import settingsController from "../controllers/settings-controller";

const settingsRouter = Router();

settingsRouter.get("/", checkAuth, settingsController.getSettings);
settingsRouter.post("/update", checkAuth, settingsController.updateProfile);

settingsRouter.get(
  "/password",
  checkAuth,
  settingsController.getPasswordSettings
);

settingsRouter.post("/password", checkAuth, settingsController.updatePassword);

settingsRouter.get(
  "/delete",
  checkAuth,
  settingsController.getDeleteConfirmation
);

settingsRouter.post("/delete", checkAuth, settingsController.deleteAccount);

export default settingsRouter;
