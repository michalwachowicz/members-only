import { LOGGER } from "../utils/logger";
import pool from "./pool";

export async function testDatabaseConnection() {
  try {
    await pool.query("SELECT NOW()");
    LOGGER.info(`Database connected successfully!`);
  } catch (error) {
    LOGGER.error(`Database connection failed: ${error}`);
  }
}
