import { PaymentProvider } from "../providers/payment-provider.interface";
import { MockPaymentProvider } from "../providers/mock.provider";
import { StripePaymentProvider } from "../providers/stripe.provider";
import { env } from "./env";
import { logger } from "./logger";

function createPaymentProvider(): PaymentProvider {
  if (env.PAYMENT_PROVIDER === "stripe") {
    logger.info("Using Stripe payment provider");
    return new StripePaymentProvider();
  }

  logger.info("Using mock payment provider (set PAYMENT_PROVIDER=stripe for real charges)");
  return new MockPaymentProvider();
}

export const paymentProvider = createPaymentProvider();
