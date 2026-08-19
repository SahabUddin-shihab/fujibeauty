import { KafkaTopics, OrderCreatedEvent } from "@ecommerce-ai/shared-types";
import { kafkaClient } from "../config/kafka";
import { logger } from "../config/logger";
import { PaymentRepository } from "../repositories/payment.repository";

const paymentRepository = new PaymentRepository();

/**
 * Listens for order.created events and opens a PENDING payment record so the
 * user has something to pay against via POST /payments/:orderId/pay.
 */
export async function startOrderConsumer(): Promise<void> {
  await kafkaClient.subscribe("payment-service-order-group", [KafkaTopics.ORDER_CREATED], async ({ message }) => {
    if (!message.value) return;

    const event = JSON.parse(message.value.toString()) as OrderCreatedEvent;
    logger.info("Received order.created event", { orderId: event.orderId });

    const existing = await paymentRepository.findByOrderId(event.orderId);
    if (existing) return;

    await paymentRepository.create({
      orderId: event.orderId,
      userId: event.userId,
      userEmail: event.userEmail,
      amount: event.totalAmount,
    });
  });
}
