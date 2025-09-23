import { Pool } from "pg";
import { config } from "../config";

export default new Pool({
  connectionString: config.dbUrl,
});
