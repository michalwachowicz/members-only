import pool from "../db/pool";
import type { Message, MessageCreate } from "../types/message";
import { getRelativeTime } from "../utils/time";
import { getRedisClient } from "../redis";
import { LOGGER } from "../utils/logger";
import { config } from "../config";

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
    const redis = getRedisClient();
    const cacheKey = `messages:list:${isMember ? "member" : "guest"}`;

    if (redis) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        LOGGER.info("MessageService.getMessages cache hit", { isMember });
        return JSON.parse(cached) as Message[];
      }
    }

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

    const mapped = messages.rows.map((row) => ({
      ...this.adaptDbRowToMessage(row, isMember),
      author: isMember
        ? `${row.first_name} ${row.last_name} (${row.username})`
        : "******** (********)",
    }));
    LOGGER.info("MessageService.getMessages fetched from db", { isMember });

    if (redis)
      await redis.set(cacheKey, JSON.stringify(mapped), {
        EX: config.redis.ttl.messagesList,
      });
    return mapped;
  }

  async createMessage(message: MessageCreate): Promise<Message> {
    const newMessage = await pool.query(
      "INSERT INTO messages (title, content, user_id) VALUES ($1, $2, $3) RETURNING *",
      [message.title, message.content, message.userId]
    );
    const created = newMessage.rows[0] as DbMessageRow;

    const redis = getRedisClient();
    if (redis) {
      await redis.del(["messages:list:member", "messages:list:guest"]);
    }

    return this.adaptDbRowToMessage(created, true);
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
    const redis = getRedisClient();
    if (redis) {
      await redis.del(["messages:list:member", "messages:list:guest"]);
    }
  }

  async getMessagesByUserId(
    userId: number,
    isMember: boolean
  ): Promise<Message[]> {
    const redis = getRedisClient();
    const cacheKey = `messages:byUser:${userId}:${
      isMember ? "member" : "guest"
    }`;

    if (redis) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        LOGGER.info("MessageService.getMessagesByUserId cache hit", {
          userId,
          isMember,
        });
        return JSON.parse(cached) as Message[];
      }
    }

    const messages = await pool.query(
      "SELECT * FROM messages WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    );
    const mapped = messages.rows.map((row) =>
      this.adaptDbRowToMessage(row, isMember)
    );
    LOGGER.info("MessageService.getMessagesByUserId fetched from db", {
      userId,
      isMember,
    });
    if (redis)
      await redis.set(cacheKey, JSON.stringify(mapped), {
        EX: config.redis.ttl.messagesByUser,
      });
    return mapped;
  }
}

export default new MessageService();
