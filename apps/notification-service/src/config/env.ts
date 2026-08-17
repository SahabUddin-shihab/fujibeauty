import { z } from "zod";
import { loadConfig } from "@fujibeauty/config";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  NOTIFICATION_SERVICE_PORT: z.coerce.number().default(4005),
  NOTIFICATION_DATABASE_URL: z.string().min(1, "NOTIFICATION_DATABASE_URL is required"),
  KAFKA_BROKERS: z.string().default("localhost:9092"),
  KAFKA_CLIENT_ID: z.string().default("notification-service"),
  EMAIL_PROVIDER: z.enum(["mock", "smtp"]).default("mock"),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.string().default("no-reply@fujibeauty.example"),
})
  .refine((data) => data.EMAIL_PROVIDER !== "smtp" || (!!data.SMTP_HOST && !!data.SMTP_USER && !!data.SMTP_PASS), {
    message: "SMTP_HOST, SMTP_USER and SMTP_PASS are required when EMAIL_PROVIDER=smtp",
    path: ["SMTP_HOST"],
  });

export const env = loadConfig(envSchema);
