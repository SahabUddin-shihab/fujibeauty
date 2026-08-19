import Stripe from "stripe";
import { AppError } from "@fujibeauty/utils";
import { ChargeInput, ChargeResult, PaymentProvider } from "./payment-provider.interface";
import { env } from "../config/env";
import { logger } from "../config/logger";


export class StripePaymentProvider implements PaymentProvider {
  private stripe: Stripe;

  constructor() {
    if (!env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is required when PAYMENT_PROVIDER=stripe");
    }
    this.stripe = new Stripe(env.STRIPE_SECRET_KEY);
  }

  async charge(input: ChargeInput): Promise<ChargeResult> {
    if (!input.paymentMethodId) {
      throw new AppError("paymentMethodId is required to charge with Stripe", 400);
    }

    try {
      const intent = await this.stripe.paymentIntents.create({
        amount: Math.round(input.amount * 100), 
        currency: input.currency,
        payment_method: input.paymentMethodId,
        confirm: true,
        off_session: true,
        metadata: { orderId: input.orderId },
      });

      if (intent.status !== "succeeded") {
        
        throw new AppError(`Payment requires further action (status: ${intent.status})`, 402);
      }

      return { transactionRef: intent.id };
    } catch (error) {
      if (error instanceof Stripe.errors.StripeCardError) {
        logger.warn("Stripe card declined", { orderId: input.orderId, message: error.message });
        throw new AppError(error.message ?? "Card was declined", 402);
      }
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Stripe charge failed", { orderId: input.orderId, error });
      throw new AppError("Payment provider error", 502);
    }
  }
}
