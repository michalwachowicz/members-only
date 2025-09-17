import pool from "../db/pool";
import type { Message, MessageCreate } from "../types/message";

class MessageService {
  async getMessages(isMember: boolean): Promise<Message[]> {
    const messages = await pool.query(`
      SELECT 
        m.id, 
        m.title, 
        m.content, 
        m.created_at as "createdAt",
        u.username,
        u.first_name,
        u.last_name
      FROM messages m 
      JOIN users u ON m.user_id = u.id 
      ORDER BY m.created_at DESC
    `);

    return messages.rows.map((row) => ({
      ...row,
      author: isMember
        ? `${row.first_name} ${row.last_name} (${row.username})`
        : "******** (********)",
    }));
  }

  async createMessage(message: MessageCreate): Promise<Message> {
    const newMessage = await pool.query(
      "INSERT INTO messages (title, content, user_id) VALUES ($1, $2, $3) RETURNING *",
      [message.title, message.content, message.userId]
    );

    return newMessage.rows[0];
  }
}

export default new MessageService();
