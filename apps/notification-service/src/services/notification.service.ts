import { EmailRequestedEvent } from "@fujibeauty/shared-types";
import { sendEmail } from "../utils/mailer";
import { EmailLogRepository } from "../repositories/email-log.repository";
import { logger } from "../config/logger";

const emailLogRepository = new EmailLogRepository();

const templates: Record<EmailRequestedEvent["template"], (data: Record<string, unknown>) => string> = {
  welcome: (data) => `Welcome aboard, ${data.name ?? "there"}! We're glad to have you.`,
  "order-confirmation": (data) => `Your order ${data.orderId ?? ""} has been confirmed. Thanks for shopping with us!`,
  "password-reset": () => `We received a request to reset your password. If this wasn't you, ignore this email.`,
};

export class NotificationService {
  async handleEmailRequested(event: EmailRequestedEvent): Promise<void> {
    const buildBody = templates[event.template];
    const body = buildBody ? buildBody(event.data) : "";

    try {
      await sendEmail(event.to, event.subject, body);
      await emailLogRepository.create(event.to, event.subject, event.template, "SENT");
    } catch (error) {
      logger.error("Failed to send email", { error, to: event.to, template: event.template });
      await emailLogRepository.create(
        event.to,
        event.subject,
        event.template,
        "FAILED",
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }
}
