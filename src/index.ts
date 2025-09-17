import "dotenv/config";
import express from "express";
import { LOGGER } from "./utils/logger";
import { testDatabaseConnection } from "./db/db-test";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.listen(PORT, async () => {
  LOGGER.info(`Server is running on http://localhost:${PORT}`);
  await testDatabaseConnection();
});

export default app;
