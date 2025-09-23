import bcrypt from "bcrypt";
import pool from "../db/pool";
import type { User, UserRegister, SafeUser } from "../types/user";
import { getRedisClient } from "../redis";
import { LOGGER } from "../utils/logger";
import { config } from "../config";

interface DbUserRow {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  password: string;
  is_member: boolean;
  is_admin: boolean;
  created_at: Date;
}

class UserService {
  private adaptDbRowToUser(dbRow: DbUserRow): User {
    return {
      id: dbRow.id,
      username: dbRow.username,
      firstName: dbRow.first_name,
      lastName: dbRow.last_name,
      password: dbRow.password,
      isMember: dbRow.is_member,
      isAdmin: dbRow.is_admin,
      createdAt: dbRow.created_at,
    };
  }

  async getUserByUsername(username: string): Promise<User | null> {
    const redis = getRedisClient();
    const cacheKey = `user:byUsername:${username}`;

    if (redis) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        LOGGER.info("UserService.getUserByUsername cache hit", { username });
        return JSON.parse(cached) as User;
      }
    }

    const result = await pool.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);
    const dbRow = result.rows[0] as DbUserRow | undefined;
    const user = dbRow ? this.adaptDbRowToUser(dbRow) : null;
    LOGGER.info("UserService.getUserByUsername fetched from db", { username });

    if (redis && user)
      await redis.set(cacheKey, JSON.stringify(user), {
        EX: config.redis.ttl.user,
      });
    return user;
  }

  async getUserById(id: number): Promise<User | null> {
    const redis = getRedisClient();
    const cacheKey = `user:${id}`;

    if (redis) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        LOGGER.info("UserService.getUserById cache hit", { id });
        return JSON.parse(cached) as User;
      }
    }

    const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    const dbRow = result.rows[0] as DbUserRow | undefined;
    const user = dbRow ? this.adaptDbRowToUser(dbRow) : null;
    LOGGER.info("UserService.getUserById fetched from db", { id });

    if (redis && user)
      await redis.set(cacheKey, JSON.stringify(user), {
        EX: config.redis.ttl.user,
      });
    return user;
  }

  async getSafeUserById(id: number): Promise<SafeUser | null> {
    const redis = getRedisClient();
    const cacheKey = `user:safe:${id}`;

    if (redis) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        LOGGER.info("UserService.getSafeUserById cache hit", { id });
        return JSON.parse(cached) as SafeUser;
      }
    }

    const user = await this.getUserById(id);
    if (!user) return null;

    const { password, ...safeUser } = user;
    LOGGER.info("UserService.getSafeUserById fetched from db", { id });

    if (redis)
      await redis.set(cacheKey, JSON.stringify(safeUser), {
        EX: config.redis.ttl.userSafe,
      });
    return safeUser;
  }

  async createUser(user: UserRegister): Promise<User> {
    const { username, password, firstName, lastName } = user;
    const existingUser = await this.getUserByUsername(username);
    if (existingUser) throw new Error("User already exists.");

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (username, password, first_name, last_name, is_member, is_admin) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [username, hashedPassword, firstName, lastName, false, false]
    );
    const dbRow = result.rows[0] as DbUserRow;
    const created = this.adaptDbRowToUser(dbRow);

    const redis = getRedisClient();
    if (redis) {
      await Promise.all([
        redis.del(`user:byUsername:${created.username}`),
        redis.del(`user:${created.id}`),
        redis.del(`user:safe:${created.id}`),
        redis.del("users:safe:all"),
      ]);
    }

    return created;
  }

  async updateUser(id: number, user: Partial<User>): Promise<User> {
    const redis = getRedisClient();

    let oldUsername: string | undefined;
    if (user.username !== undefined) {
      const existing = await this.getUserById(id);
      oldUsername = existing?.username;
    }

    const updateFields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (user.username !== undefined) {
      updateFields.push(`username = $${paramCount}`);
      values.push(user.username);
      paramCount++;
    }

    if (user.firstName !== undefined) {
      updateFields.push(`first_name = $${paramCount}`);
      values.push(user.firstName);
      paramCount++;
    }

    if (user.lastName !== undefined) {
      updateFields.push(`last_name = $${paramCount}`);
      values.push(user.lastName);
      paramCount++;
    }

    if (user.password !== undefined) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      updateFields.push(`password = $${paramCount}`);
      values.push(hashedPassword);
      paramCount++;
    }

    if (user.isMember !== undefined) {
      updateFields.push(`is_member = $${paramCount}`);
      values.push(user.isMember);
      paramCount++;
    }

    if (user.isAdmin !== undefined) {
      updateFields.push(`is_admin = $${paramCount}`);
      values.push(user.isAdmin);
      paramCount++;
    }

    if (updateFields.length === 0) {
      throw new Error("No fields provided for update");
    }

    values.push(id);

    const query = `UPDATE users SET ${updateFields.join(
      ", "
    )} WHERE id = $${paramCount} RETURNING *`;

    const result = await pool.query(query, values);
    const dbRow = result.rows[0] as DbUserRow;
    const updated = this.adaptDbRowToUser(dbRow);

    if (redis) {
      const keysToDelete = [`user:${id}`, `user:safe:${id}`, "users:safe:all"];

      if (oldUsername) keysToDelete.push(`user:byUsername:${oldUsername}`);
      if (updated.username)
        keysToDelete.push(`user:byUsername:${updated.username}`);

      await redis.del(keysToDelete);
    }

    return updated;
  }

  async deleteUser(id: number): Promise<void> {
    const redis = getRedisClient();
    let usernameForInvalidation: string | undefined;
    if (redis) {
      const existing = await this.getUserById(id);
      usernameForInvalidation = existing?.username;
    }

    await pool.query("DELETE FROM users WHERE id = $1", [id]);

    if (redis) {
      const keysToDelete = [`user:${id}`, `user:safe:${id}`, "users:safe:all"];
      if (usernameForInvalidation)
        keysToDelete.push(`user:byUsername:${usernameForInvalidation}`);
      await redis.del(keysToDelete);
    }
  }

  async getSafeUsers(): Promise<SafeUser[]> {
    const redis = getRedisClient();
    const cacheKey = "users:safe:all";

    if (redis) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        LOGGER.info("UserService.getSafeUsers cache hit");
        return JSON.parse(cached) as SafeUser[];
      }
    }

    const result = await pool.query("SELECT * FROM users");
    const users = result.rows
      .map((row) => this.adaptDbRowToUser(row))
      .map((user) => {
        const { password, ...safeUser } = user;
        return safeUser;
      });
    LOGGER.info("UserService.getSafeUsers fetched from db");

    if (redis)
      await redis.set(cacheKey, JSON.stringify(users), {
        EX: config.redis.ttl.usersSafeAll,
      });
    return users;
  }
}

export default new UserService();
