import Redis from "ioredis";
import { env } from "./env";
import { createLogger } from "@ecommerce/logger";

const logger = createLogger({ serviceName: env.SERVICE_NAME });

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 5,
  retryStrategy: (times) => Math.min(times * 200, 2000)
});

redis.on("connect", () => logger.info("Redis connected"));
redis.on("error", (err) => logger.error("Redis connection error", { error: err.message }));
