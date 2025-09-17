import pool from "../db/pool";
import User from "../types/user";

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
}

export default new UserService();
