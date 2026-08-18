import { KafkaTopics, OrderCreatedEvent, OrderConfirmedEvent, OrderCancelledEvent, EmailRequestedEvent } from "@fujibeauty/shared-types";
import { kafkaClient } from "../config/kafka";
import { logger } from "../config/logger";

export class OrderEventsProducer {
  async publishOrderCreated(event: OrderCreatedEvent): Promise<void> {
    try {
      await kafkaClient.publish(KafkaTopics.ORDER_CREATED, { ...event }, event.orderId);
    } catch (error) {
      logger.error("Failed to publish order.created event", { error, orderId: event.orderId });
    }
  }

  async publishOrderConfirmed(event: OrderConfirmedEvent): Promise<void> {
    try {
      await kafkaClient.publish(KafkaTopics.ORDER_CONFIRMED, { ...event }, event.orderId);

      const confirmationEmail: EmailRequestedEvent = {
        to: event.userEmail,
        subject: "Your order has been confirmed",
        template: "order-confirmation",
        data: { orderId: event.orderId },
      };
      await kafkaClient.publish(KafkaTopics.EMAIL_REQUESTED, { ...confirmationEmail }, event.orderId);
    } catch (error) {
      logger.error("Failed to publish order.confirmed event", { error, orderId: event.orderId });
    }
  }

  async publishOrderCancelled(event: OrderCancelledEvent): Promise<void> {
    try {
      await kafkaClient.publish(KafkaTopics.ORDER_CANCELLED, { ...event }, event.orderId);
    } catch (error) {
      logger.error("Failed to publish order.cancelled event", { error, orderId: event.orderId });
    }
  }
}
