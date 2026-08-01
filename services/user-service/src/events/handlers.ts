import { EventTopic } from "@ecommerce/kafka-client";
import { eventConsumer } from "../config/kafka";
import { UsersRepository } from "../modules/users/users.repository";
import { createLogger } from "@ecommerce/logger";
import { env } from "../config/env";
import { prisma } from "../config/prisma";

const logger = createLogger({ serviceName: env.SERVICE_NAME });
const repository = new UsersRepository();

interface UserRegisteredPayload {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export function registerEventHandlers(): void {
  eventConsumer.on<UserRegisteredPayload>(EventTopic.UserRegistered, async (event) => {
    const { userId, email, firstName, lastName, role } = event.payload;

    const existing = await prisma.user.findUnique({ where: { userId } });
    if (existing) {
      logger.warn("Duplicate UserRegistered event ignored", { userId, eventId: event.eventId });
      return;
    }

    await repository.create({ userId, email, firstName, lastName, role });
    logger.info("User profile materialized from UserRegistered event", { userId });
  });
}
