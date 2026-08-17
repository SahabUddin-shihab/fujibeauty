import { KafkaTopics, EmailRequestedEvent } from "@fujibeauty/shared-types";
import { kafkaClient } from "../config/kafka";
import { logger } from "../config/logger";
import { NotificationService } from "../services/notification.service";

const notificationService = new NotificationService();

export async function startEmailConsumer(): Promise<void> {
  
  await kafkaClient.subscribe("notification-service-email-group", [KafkaTopics.EMAIL_REQUESTED], async ({ message }) => {
    if (!message.value) return;

    const event = JSON.parse(message.value.toString()) as EmailRequestedEvent;
    logger.info("Received email.requested event", { to: event.to, template: event.template });

    await notificationService.handleEmailRequested(event);
  });
}
