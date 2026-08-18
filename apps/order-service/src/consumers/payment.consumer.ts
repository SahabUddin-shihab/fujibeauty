import { KafkaTopics, PaymentSucceededEvent } from "@fujibeauty/shared-types";
import { kafkaClient } from "../config/kafka";
import { logger } from "../config/logger";
import { OrderService } from "../services/order.service";

const orderService = new OrderService();

/**
 * Listens for payment.succeeded events (published by a future payment-service)
 * and moves the matching order to CONFIRMED, then emits order.confirmed.
 * This is the event-driven counterpart to the synchronous order-creation flow.
 */
export async function startPaymentConsumer(): Promise<void> {
  await kafkaClient.subscribe("order-service-payment-group", [KafkaTopics.PAYMENT_SUCCEEDED], async ({ message }) => {
    if (!message.value) return;

    const event = JSON.parse(message.value.toString()) as PaymentSucceededEvent;
    logger.info("Received payment.succeeded event", { orderId: event.orderId });

    await orderService.confirmAfterPayment(event.orderId);
  });
}
