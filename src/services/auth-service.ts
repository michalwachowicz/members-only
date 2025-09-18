import pool from "../db/pool";

class AuthService {
  async upgrade(userId: number) {
    await pool.query("UPDATE users SET is_member = TRUE WHERE id = $1", [
      userId,
    ]);
  }
}

export default new AuthService();
