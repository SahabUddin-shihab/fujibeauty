import { AppError, ForbiddenError, NotFoundError } from "@fujibeauty/utils";
import { PaymentRepository } from "../repositories/payment.repository";
import { PaymentEventsProducer } from "../producers/payment-events.producer";
import { paymentProvider } from "../config/payment-provider";
import { env } from "../config/env";
import { AuthenticatedUser } from "@fujibeauty/shared-types";
import { logger } from "../config/logger";

const paymentRepository = new PaymentRepository();
const paymentEventsProducer = new PaymentEventsProducer();

export class PaymentService {
  async pay(orderId: string, requester: AuthenticatedUser, paymentMethodId?: string) {
    const payment = await paymentRepository.findByOrderId(orderId);

    if (!payment) {
      throw new NotFoundError(
        "No payment record found for this order yet — the order.created event may not have been processed"
      );
    }

    if (payment.userId !== requester.id && requester.role !== "ADMIN") {
      throw new ForbiddenError("You do not have permission to pay for this order");
    }

    if (payment.status === "SUCCEEDED") {
      throw new AppError("This order has already been paid", 409);
    }

    let transactionRef: string;
    try {
      const result = await paymentProvider.charge({
        orderId: payment.orderId,
        amount: Number(payment.amount),
        currency: env.PAYMENT_CURRENCY,
        paymentMethodId,
      });
      transactionRef = result.transactionRef;
    } catch (error) {
      await paymentRepository.updateStatus(orderId, "FAILED");
      throw error;
    }

    const updated = await paymentRepository.updateStatus(orderId, "SUCCEEDED", transactionRef);

    logger.info("Payment succeeded", { orderId, paymentId: updated.id });

    await paymentEventsProducer.publishPaymentSucceeded({
      orderId: updated.orderId,
      userId: updated.userId,
      userEmail: updated.userEmail,
      amount: updated.amount.toString(),
      paymentId: updated.id,
      paidAt: new Date().toISOString(),
    });

    return updated;
  }

  async getByOrderId(orderId: string, requester: AuthenticatedUser) {
    const payment = await paymentRepository.findByOrderId(orderId);
    if (!payment) {
      throw new NotFoundError("Payment not found");
    }
    if (payment.userId !== requester.id && requester.role !== "ADMIN") {
      throw new ForbiddenError("You do not have permission to view this payment");
    }
    return payment;
  }
}
