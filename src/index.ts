import "dotenv/config";
import express from "express";
import { LOGGER } from "./utils/logger";
import { initDatabase } from "./db/queries";
import { initializeMiddlewares } from "./middlewares";
import { initializeRoutes } from "./routes";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

initializeMiddlewares(app);
initializeRoutes(app);

app.listen(PORT, async () => {
  LOGGER.info(`Server is running on http://localhost:${PORT}`);
  await initDatabase();
});

export default app;
