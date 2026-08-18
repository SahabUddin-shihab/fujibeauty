import { createApp } from "./app";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { prisma } from "./config/prisma";
import { kafkaClient } from "./config/kafka";
import { startPaymentConsumer } from "./consumers/payment.consumer";
import { startReservationExpiryJob } from "./jobs/expire-reservations.job";

async function bootstrap() {
  const app = createApp();

  await prisma.$connect();
  logger.info("Connected to PostgreSQL");

  await kafkaClient.getProducer();
  logger.info("Connected to Kafka");

  await startPaymentConsumer();
  logger.info("Subscribed to payment.succeeded events");

  startReservationExpiryJob();

  const server = app.listen(env.ORDER_SERVICE_PORT, () => {
    logger.info(`Order service listening on port ${env.ORDER_SERVICE_PORT}`);
    logger.info(`Swagger docs available at http://localhost:${env.ORDER_SERVICE_PORT}/api-docs`);
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
  logger.error("Failed to start order-service", { error });
  process.exit(1);
});
