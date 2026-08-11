import { Redis } from "ioredis";
export function createRedisClient(options) {
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
//# sourceMappingURL=redis.js.map