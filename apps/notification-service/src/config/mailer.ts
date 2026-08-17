import { Mailer } from "../providers/mailer.interface";
import { MockMailer } from "../providers/mock.mailer";
import { SmtpMailer } from "../providers/smtp.mailer";
import { env } from "./env";
import { logger } from "./logger";

function createMailer(): Mailer {
  if (env.EMAIL_PROVIDER === "smtp") {
    logger.info("Using SMTP mailer");
    return new SmtpMailer();
  }

  logger.info("Using mock mailer (set EMAIL_PROVIDER=smtp for real delivery)");
  return new MockMailer();
}

export const mailer = createMailer();
