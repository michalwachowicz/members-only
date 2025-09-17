import { LOGGER } from "../utils/logger";
import { capitalize } from "../utils/string";
import pool from "./pool";

async function createTableIfNotExists(
  tableName: string,
  createTableQuery: string
): Promise<void> {
  try {
    const result = await pool.query(
      `
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        );
      `,
      [tableName]
    );
    const tableExists = result.rows[0].exists;

    if (!tableExists) {
      await pool.query(createTableQuery);
      LOGGER.info(`${capitalize(tableName)} table created successfully!`);
    }
  } catch (error) {
    LOGGER.error(`Failed to create ${tableName} table: ${error}`);
    throw error;
  }
}

async function createSessionTable(): Promise<void> {
  const query = `
    CREATE TABLE "session" (
      "sid" varchar NOT NULL COLLATE "default",
      "sess" json NOT NULL,
      "expire" timestamp(6) NOT NULL
    )
    WITH (OIDS=FALSE);

    ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;

    CREATE INDEX "IDX_session_expire" ON "session" ("expire");
  `;

  await createTableIfNotExists("session", query);
}

async function createUserTable(): Promise<void> {
  const query = `
    CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      password VARCHAR(255) NOT NULL,
      is_member BOOLEAN DEFAULT FALSE,
      is_admin BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await createTableIfNotExists("users", query);
}

async function createMessageTable(): Promise<void> {
  const query = `
    CREATE TABLE messages (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(200) NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await createTableIfNotExists("messages", query);
}

export async function initDatabase(): Promise<void> {
  try {
    await createUserTable();
    await createMessageTable();
    await createSessionTable();

    LOGGER.info("Database initialized successfully!");
  } catch (error) {
    LOGGER.error(`Database initialization failed: ${error}`);
    throw error;
  }
}
