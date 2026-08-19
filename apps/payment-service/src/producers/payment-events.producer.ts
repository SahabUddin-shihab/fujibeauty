import { KafkaTopics, PaymentSucceededEvent } from "@fujibeauty/shared-types";
import { kafkaClient } from "../config/kafka";
import { logger } from "../config/logger";

export class PaymentEventsProducer {
  async publishPaymentSucceeded(event: PaymentSucceededEvent): Promise<void> {
    try {
      await kafkaClient.publish(KafkaTopics.PAYMENT_SUCCEEDED, { ...event }, event.orderId);
    } catch (error) {
      logger.error("Failed to publish payment.succeeded event", { error, orderId: event.orderId });
    }
  }
}
