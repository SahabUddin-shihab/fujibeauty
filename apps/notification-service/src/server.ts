import { createApp } from "./app";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { prisma } from "./config/prisma";
import { kafkaClient } from "./config/kafka";
import { startEmailConsumer } from "./consumers/email.consumer";

async function bootstrap() {
  const app = createApp();

  await prisma.$connect();
  logger.info("Connected to PostgreSQL");

  await startEmailConsumer();
  logger.info("Subscribed to email.requested events");

  const server = app.listen(env.NOTIFICATION_SERVICE_PORT, () => {
    logger.info(`Notification service listening on port ${env.NOTIFICATION_SERVICE_PORT}`);
  });

  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal}, shutting down gracefully...`);
    server.close(async () => {
      await prisma.$disconnect();
      await kafkaClient.disconnect();
      logger.info("Shutdown complete");
      process.exit(0);
    });
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

bootstrap().catch((error) => {
  logger.error("Failed to start notification-service", { error });
  process.exit(1);
});
