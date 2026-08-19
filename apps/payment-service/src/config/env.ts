import { z } from "zod";
import { loadConfig } from "@fujibeauty/config";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PAYMENT_SERVICE_PORT: z.coerce.number().default(4004),
  PAYMENT_DATABASE_URL: z.string().min(1, "PAYMENT_DATABASE_URL is required"),
  JWT_ACCESS_SECRET: z.string().min(1, "JWT_ACCESS_SECRET is required"),
  REDIS_HOST: z.string().default("localhost"),
  REDIS_PORT: z.coerce.number().default(6379),
  KAFKA_BROKERS: z.string().default("localhost:9092"),
  KAFKA_CLIENT_ID: z.string().default("payment-service"),
  PAYMENT_PROVIDER: z.enum(["mock", "stripe"]).default("mock"),
  STRIPE_SECRET_KEY: z.string().optional(),
  PAYMENT_CURRENCY: z.string().default("usd"),
})
  .refine((data) => data.PAYMENT_PROVIDER !== "stripe" || !!data.STRIPE_SECRET_KEY, {
    message: "STRIPE_SECRET_KEY is required when PAYMENT_PROVIDER=stripe",
    path: ["STRIPE_SECRET_KEY"],
  });

export const env = loadConfig(envSchema);
