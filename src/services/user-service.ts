import bcrypt from "bcrypt";
import pool from "../db/pool";
import type { User, UserRegister, SafeUser } from "../types/user";

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
    const result = await pool.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);
    const dbRow = result.rows[0] as DbUserRow | undefined;
    return dbRow ? this.adaptDbRowToUser(dbRow) : null;
  }

  async getSafeUserById(id: number): Promise<SafeUser | null> {
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    const dbRow = result.rows[0] as DbUserRow | undefined;

    if (!dbRow) return null;

    const user = this.adaptDbRowToUser(dbRow);
    const { password, ...safeUser } = user;

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
    return this.adaptDbRowToUser(dbRow);
  }

  async updateUser(id: number, user: User): Promise<User> {
    const { username, firstName, lastName, password } = user;
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "UPDATE users SET username = $1, first_name = $2, last_name = $3, password = $4 WHERE id = $5 RETURNING *",
      [username, firstName, lastName, hashedPassword, id]
    );
    const dbRow = result.rows[0] as DbUserRow;
    return this.adaptDbRowToUser(dbRow);
  }

  async deleteUser(id: number): Promise<void> {
    await pool.query("DELETE FROM users WHERE id = $1", [id]);
  }

  async getSafeUsers(): Promise<SafeUser[]> {
    const result = await pool.query("SELECT * FROM users");
    return result.rows
      .map((row) => this.adaptDbRowToUser(row))
      .map((user) => {
        const { password, ...safeUser } = user;
        return safeUser;
      });
  }
}

export default new UserService();
