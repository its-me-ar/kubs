import { createClient } from "redis";
import logger from "./logger";

// Connect to Redis
const redis = createClient({
  url: process.env.REDIS_URL || "redis://127.0.0.1:6379"
});

redis.connect();

redis.on('connect', () => {
  logger.info('✅ Stats Redis connected');
});

redis.on('error', (err) => {
  logger.error('❌ Stats Redis connection error:', err);
});

export default redis;
