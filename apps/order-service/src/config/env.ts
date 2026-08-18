import { z } from "zod";
import { loadConfig } from "@ecommerce-ai/config";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  ORDER_SERVICE_PORT: z.coerce.number().default(4003),
  ORDER_DATABASE_URL: z.string().min(1, "ORDER_DATABASE_URL is required"),
  JWT_ACCESS_SECRET: z.string().min(1, "JWT_ACCESS_SECRET is required"),
  INTERNAL_API_KEY: z.string().min(1, "INTERNAL_API_KEY is required"),
  PRODUCT_SERVICE_URL: z.string().url().default("http://localhost:4002"),
  ORDER_RESERVATION_TTL_MINUTES: z.coerce.number().default(15),
  ORDER_EXPIRY_CRON: z.string().default("*/1 * * * *"),
  REDIS_HOST: z.string().default("localhost"),
  REDIS_PORT: z.coerce.number().default(6379),
  KAFKA_BROKERS: z.string().default("localhost:9092"),
  KAFKA_CLIENT_ID: z.string().default("order-service"),
});

export const env = loadConfig(envSchema);
