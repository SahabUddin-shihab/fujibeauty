import { z } from 'zod';
import { loadConfig } from "@fujibeauty/config";


const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  API_GATEWAY_PORT: z.coerce.number().default(4000),
  AUTH_SERVICE_URL: z.string().url().default("http://localhost:4001"),
  PRODUCT_SERVICE_URL: z.string().url().default("http://localhost:4005"),
  ORDER_SERVICE_URL: z.string().url().default("http://localhost:4003"),
  PAYMENT_SERVICE_URL: z.string().url().default("http://localhost:4004"),
  NOTIFICATION_SERVICE_URL: z.string().url().default("http://localhost:4002"),
});

export const ENV= loadConfig(envSchema); 