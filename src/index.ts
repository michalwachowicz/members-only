import "./types/express";
import path from "path";
import express from "express";
import { LOGGER } from "./utils/logger";
import { initRedis } from "./redis";
import { initDatabase } from "./db/queries";
import {
  initializeMiddlewares,
  initializeErrorMiddleware,
} from "./middlewares";
import { initializeRoutes } from "./routes";
import { config } from "./config";

const app = express();
const PORT = config.port;

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
  await initRedis();
  await initDatabase();
});

export default app;
