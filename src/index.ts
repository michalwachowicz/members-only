import "dotenv/config";
import path from "path";
import express from "express";
import { LOGGER } from "./utils/logger";
import { initDatabase } from "./db/queries";
import {
  initializeMiddlewares,
  initializeErrorMiddleware,
} from "./middlewares";
import { initializeRoutes } from "./routes";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "..", "public")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

initializeMiddlewares(app);
initializeRoutes(app);
initializeErrorMiddleware(app);

app.listen(PORT, async () => {
  LOGGER.info(`Server is running on http://localhost:${PORT}`);
  await initDatabase();
});

export default app;
