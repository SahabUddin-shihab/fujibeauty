import { z } from 'zod';
import {config as loadEnv} from 'dotenv';

loadEnv();

export function loadConfig<T extends z.ZodTypeAny>(schema: T): z.infer<T> {

        const result= schema.safeParse(process.env);

        if(!result.data){
            console.error("Invalid environment configuration:");
            console.error(result.error?.flatten().fieldErrors);
            process.exit(1);
        }
        return result.data;
}


export const commonEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  REDIS_HOST: z.string().default("localhost"),
  REDIS_PORT: z.coerce.number().default(6379),
  KAFKA_BROKERS: z.string().default("localhost:9092"),
  KAFKA_CLIENT_ID: z.string().default("ecommerce-ai"),
});
