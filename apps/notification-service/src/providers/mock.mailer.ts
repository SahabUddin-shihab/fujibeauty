import { logger } from "../config/logger";
import { Mailer } from "./mailer.interface";


export class MockMailer implements Mailer {
  async send(to: string, subject: string, body: string): Promise<void> {
    logger.info(`Sending email to ${to}`, { subject });
    
    console.log(`\n--- MOCK EMAIL ---\nTo: ${to}\nSubject: ${subject}\n\n${body}\n------------------\n`);
  }
}
