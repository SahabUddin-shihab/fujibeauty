import { z } from "zod";
import { loadConfig } from "@fujibeauty/config";
const envSchema = z.object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    AUTH_SERVICE_PORT: z.coerce.number().default(4001),
    AUTH_DATABASE_URL: z.string().min(1, "AUTH_DATABASE_URL is required"),
    JWT_ACCESS_SECRET: z.string().min(1, "JWT_ACCESS_SECRET is required"),
    JWT_REFRESH_SECRET: z.string().min(1, "JWT_REFRESH_SECRET is required"),
    JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
    JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
    BCRYPT_SALT_ROUNDS: z.coerce.number().default(10),
    REDIS_HOST: z.string().default("localhost"),
    REDIS_PORT: z.coerce.number().default(6379),
    KAFKA_BROKERS: z.string().default("localhost:9092"),
    KAFKA_CLIENT_ID: z.string().default("auth-service"),
});
export const env = loadConfig(envSchema);
//# sourceMappingURL=env.js.map