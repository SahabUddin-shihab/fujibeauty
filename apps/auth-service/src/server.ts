
import { createApp } from "./app";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { prisma } from "./config/prisma";
import { kafkaClient } from "./config/kafka";

async function bootstrap() {
  const app = createApp();

  await prisma.$connect();
  logger.info("Connected to PostgreSQL");

  await kafkaClient.getProducer();
  logger.info("Connected to Kafka");

  const server = app.listen(env.AUTH_SERVICE_PORT, () => {
    logger.info(`Auth service listening on port ${env.AUTH_SERVICE_PORT}`);
    logger.info(`Swagger docs available at http://localhost:${env.AUTH_SERVICE_PORT}/api-docs`);
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
  logger.error("Failed to start auth-service", { error });
  process.exit(1);
});
