import { createClient, RedisClientType } from "redis";
import { config } from "../config";
import { LOGGER } from "../utils/logger";

let client: RedisClientType | null = null;
let isReady = false;

export async function initRedis(): Promise<void> {
  if (!config.redis.enabled) {
    LOGGER.info("Redis is disabled by configuration");
    return;
  }

  if (client) return;

  try {
    client = createClient({
      url: config.redis.url,
      username: config.redis.username,
      password: config.redis.password,
      socket: config.redis.tls ? { tls: true } : undefined,
    });

    client.on("ready", () => {
      isReady = true;
      LOGGER.info("Redis client is ready");
    });

    client.on("end", () => {
      isReady = false;
      LOGGER.warn("Redis connection closed");
    });

    client.on("error", (error) => {
      isReady = false;
      LOGGER.error("Redis client error", { error });
    });

    await client.connect();
  } catch (error) {
    isReady = false;
    LOGGER.error("Failed to initialize Redis", {
      error: (error as Error).message,
    });
  }
}

export function getRedisClient(): RedisClientType | null {
  if (!config.redis.enabled) return null;
  return isReady && client ? client : null;
}
