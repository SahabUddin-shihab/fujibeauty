import { mailer } from "../config/mailer";

export async function sendEmail(to: string, subject: string, body: string): Promise<void> {
  await mailer.send(to, subject, body);
}
