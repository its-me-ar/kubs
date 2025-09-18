import { createClient } from "redis";
import logger from "./logger";

// Connect to Redis
const redis = createClient({
  url: process.env.REDIS_URL || "redis://127.0.0.1:6379"
});

redis.connect();

redis.on('connect', () => {
  logger.info('✅ Submitter Redis connected');
});

redis.on('error', (err) => {
  logger.error('❌ Submitter Redis connection error:', err);
});

// Export the connection object for BullMQ
export const connection = {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: Number(process.env.REDIS_PORT) || 6379,
};

export default redis;

