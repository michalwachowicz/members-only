import pool from "../db/pool";
import type { Message, MessageCreate } from "../types/message";
import { getRelativeTime } from "../utils/time";

interface DbMessageRow {
  id: number;
  title: string;
  content: string;
  user_id: number;
  created_at: Date;
}

class MessageService {
  private adaptDbRowToMessage(dbRow: DbMessageRow, isMember: boolean): Message {
    return {
      id: dbRow.id,
      userId: dbRow.user_id,
      title: dbRow.title,
      content: dbRow.content,
      createdAt: dbRow.created_at,
      relativeTime: isMember ? getRelativeTime(dbRow.created_at) : "*********",
    };
  }

  async getMessages(isMember: boolean): Promise<Message[]> {
    const messages = await pool.query(`
      SELECT 
        m.id, 
        m.title, 
        m.content, 
        m.user_id,
        m.created_at,
        u.username,
        u.first_name,
        u.last_name
      FROM messages m 
      JOIN users u ON m.user_id = u.id 
      ORDER BY m.created_at DESC
    `);

    return messages.rows.map((row) => ({
      ...this.adaptDbRowToMessage(row, isMember),
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

  async getMessageById(id: number): Promise<Message | null> {
    const result = await pool.query("SELECT * FROM messages WHERE id = $1", [
      id,
    ]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.adaptDbRowToMessage(result.rows[0], true);
  }

  async deleteMessage(id: number): Promise<void> {
    await pool.query("DELETE FROM messages WHERE id = $1", [id]);
  }

  async getMessagesByUserId(
    userId: number,
    isMember: boolean
  ): Promise<Message[]> {
    const messages = await pool.query(
      "SELECT * FROM messages WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    );
    return messages.rows.map((row) => this.adaptDbRowToMessage(row, isMember));
  }
}

export default new MessageService();
