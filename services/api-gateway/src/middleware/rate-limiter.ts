import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { redis } from "../config/redis";
import { env } from "../config/env";

/**
 * A single Redis-backed limiter so the limit is enforced consistently even
 * when the gateway is horizontally scaled to multiple instances.
 */
export const rateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    sendCommand: (...args: string[]) => redis.call(...args) as Promise<unknown> as never
  }),
  keyGenerator: (req) => (req.headers["x-user-id"] as string) || req.ip || "anonymous",
  message: { error: { code: "TOO_MANY_REQUESTS", message: "Rate limit exceeded, slow down" } }
});
