import nodemailer, { Transporter } from "nodemailer";
import { Mailer } from "./mailer.interface";
import { env } from "../config/env";
import { logger } from "../config/logger";

export class SmtpMailer implements Mailer {
  
  private transporter: Transporter;

  constructor() {
    if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
      throw new Error("SMTP_HOST, SMTP_USER and SMTP_PASS are required when EMAIL_PROVIDER=smtp");
    }

    this.transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    });
  }

  async send(to: string, subject: string, body: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: env.EMAIL_FROM,
        to,
        subject,
        text: body,
      });
      logger.info(`Email sent to ${to}`, { subject });
    } catch (error) {
      logger.error("Failed to send email via SMTP", { error, to, subject });
      throw error;
    }
  }
}
