import { createRedisClient } from "@fujibeauty/database";
import { env } from "./env";

export const redis = createRedisClient({ host: env.REDIS_HOST, port: env.REDIS_PORT });
