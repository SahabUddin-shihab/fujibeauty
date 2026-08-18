import { KafkaTopics, ProductCreatedEvent } from "@fujibeauty/shared-types";
import { kafkaClient } from "../config/kafka";
import { logger } from "../config/logger";

export class ProductEventsProducer {
  async publishProductCreated(event: ProductCreatedEvent): Promise<void> {
    try {
      await kafkaClient.publish(KafkaTopics.PRODUCT_CREATED, { ...event }, event.productId);
    } catch (error) {
      logger.error("Failed to publish product.created event", { error, productId: event.productId });
    }
  }
}
