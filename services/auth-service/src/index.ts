import { createApp } from "./app";
import { env } from "./config/env";
import { eventProducer } from "./config/kafka";
import { prisma } from "./config/prisma";
import { redis } from "./config/redis";
import { createLogger } from "@ecommerce/logger";

const logger = createLogger({ serviceName: env.SERVICE_NAME });

async function bootstrap(): Promise<void> {
  await eventProducer.connect();
  logger.info("Kafka producer connected");

  const app = createApp();

  const server = app.listen(env.PORT, () => {
    logger.info(`auth-service listening on port ${env.PORT}`, { docs: `/docs`, health: `/health` });
  });

  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`Received ${signal}, shutting down gracefully`);
    server.close(async () => {
      await Promise.allSettled([eventProducer.disconnect(), prisma.$disconnect(), redis.quit()]);
      logger.info("Shutdown complete");
      process.exit(0);
    });

    // Force-exit if graceful shutdown hangs.
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

bootstrap().catch((err) => {
  logger.error("Fatal error during bootstrap", { error: (err as Error).message, stack: (err as Error).stack });
  process.exit(1);
});
