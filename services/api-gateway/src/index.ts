import { createApp } from "./app";
import { env } from "./config/env";
import { redis } from "./config/redis";
import { createLogger } from "@ecommerce/logger";

const logger = createLogger({ serviceName: env.SERVICE_NAME });

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info(`api-gateway listening on port ${env.PORT}`);
});

const shutdown = async (signal: string): Promise<void> => {
  logger.info(`Received ${signal}, shutting down gracefully`);
  server.close(async () => {
    await redis.quit();
    logger.info("Shutdown complete");
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
