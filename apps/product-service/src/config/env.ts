import { z } from "zod";
import { loadConfig } from "@fujibeauty/config";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PRODUCT_SERVICE_PORT: z.coerce.number().default(4002),
  PRODUCT_DATABASE_URL: z.string().min(1, "PRODUCT_DATABASE_URL is required"),
  JWT_ACCESS_SECRET: z.string().min(1, "JWT_ACCESS_SECRET is required"),
  INTERNAL_API_KEY: z.string().min(1, "INTERNAL_API_KEY is required"),
  REDIS_HOST: z.string().default("localhost"),
  REDIS_PORT: z.coerce.number().default(6379),
  KAFKA_BROKERS: z.string().default("localhost:9092"),
  KAFKA_CLIENT_ID: z.string().default("product-service"),
});

export const env = loadConfig(envSchema);
