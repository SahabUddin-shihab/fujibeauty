import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4002),
  SERVICE_NAME: z.string().default("user-service"),
  DATABASE_URL: z.string().min(1),
  KAFKA_BROKERS: z.string().min(1),
  KAFKA_CLIENT_ID: z.string().default("user-service"),
  KAFKA_CONSUMER_GROUP: z.string().default("user-service-group"),
  LOG_LEVEL: z.string().default("info")
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error("Invalid environment configuration:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export const kafkaBrokers = env.KAFKA_BROKERS.split(",").map((b) => b.trim());
