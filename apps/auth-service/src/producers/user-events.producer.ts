import { KafkaTopics, UserRegisteredEvent, UserLoggedInEvent, EmailRequestedEvent } from "@fujibeauty/shared-types";
import { kafkaClient } from "../config/kafka";
import { logger } from "../config/logger";

export class UserEventsProducer {
  
  async publishUserRegistered(event: UserRegisteredEvent): Promise<void> {
    try {
      await kafkaClient.publish(KafkaTopics.USER_REGISTERED, { ...event }, event.userId);

      const welcomeEmail: EmailRequestedEvent = {
        to: event.email,
        subject: "Welcome to our store!",
        template: "welcome",
        data: { name: event.name },
      };
      await kafkaClient.publish(KafkaTopics.EMAIL_REQUESTED, { ...welcomeEmail }, event.userId);
      
    } catch (error) {
      logger.error("Failed to publish user.registered event", { error, userId: event.userId });
    }
  }

  async publishUserLoggedIn(event: UserLoggedInEvent): Promise<void> {
    try {
      await kafkaClient.publish(KafkaTopics.USER_LOGGED_IN, { ...event }, event.userId);
    } catch (error) {
      logger.error("Failed to publish user.logged-in event", { error, userId: event.userId });
    }
  }
}
