import { Redis } from "ioredis";

export interface RedisOptions {
  host: string;
  port: number;
}


export function createRedisClient(options: RedisOptions): Redis {

  const client = new Redis({
    host: options.host,
    port: options.port,
    maxRetriesPerRequest: 3,
  });

  client.on("error", (err) => {
    console.error("Redis connection error:", err.message);
  });

  return client;
}
