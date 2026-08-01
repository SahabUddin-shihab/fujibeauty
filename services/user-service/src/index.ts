import { createApp } from "./app";
import { env } from "./config/env";
import { eventConsumer, eventProducer } from "./config/kafka";
import { registerEventHandlers } from "./events/handlers";
import { prisma } from "./config/prisma";
import { createLogger } from "@ecommerce/logger";

const logger = createLogger({ serviceName: env.SERVICE_NAME });

async function bootstrap(): Promise<void> {
  await eventProducer.connect();

  registerEventHandlers();
  await eventConsumer.start();
  logger.info("Kafka consumer subscribed", { group: env.KAFKA_CONSUMER_GROUP });

  const app = createApp();

  const server = app.listen(env.PORT, () => {
    logger.info(`user-service listening on port ${env.PORT}`);
  });

  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`Received ${signal}, shutting down gracefully`);
    server.close(async () => {
      await Promise.allSettled([eventConsumer.stop(), eventProducer.disconnect(), prisma.$disconnect()]);
      logger.info("Shutdown complete");
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

bootstrap().catch((err) => {
  logger.error("Fatal error during bootstrap", { error: (err as Error).message, stack: (err as Error).stack });
  process.exit(1);
});
