import { createClient } from "redis";
import logger from "./logger";

// Connect to Redis
const redis = createClient({
  url: process.env.REDIS_URL || "redis://127.0.0.1:6379"
});

redis.connect();

redis.on('connect', () => {
  logger.info('✅ Workers Redis connected');
});

redis.on('error', (err) => {
  logger.error('❌ Workers Redis connection error:', err);
});

// Parse Redis URL for BullMQ connection
const redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";
const url = new URL(redisUrl);

// Export the connection object for BullMQ
export const connection = {
  host: process.env.REDIS_HOST || url.hostname,
  port: Number(process.env.REDIS_PORT) || Number(url.port),
};

export default redis;
