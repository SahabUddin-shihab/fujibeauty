import crypto from "crypto";
import { ChargeInput, ChargeResult, PaymentProvider } from "./payment-provider.interface";

export class MockPaymentProvider implements PaymentProvider {
  async charge(_input: ChargeInput): Promise<ChargeResult> {
    return { transactionRef: crypto.randomUUID() };
  }
}
