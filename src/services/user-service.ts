import bcrypt from "bcrypt";
import pool from "../db/pool";
import type { User, UserRegister } from "../types/user";

class UserService {
  async getUserByUsername(username: string): Promise<User | null> {
    const result = await pool.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);
    return result.rows[0] || null;
  }

  async getUserById(id: number): Promise<User | null> {
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    return result.rows[0] || null;
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
    return result.rows[0];
  }
}

export default new UserService();
