import { prisma } from "../config/prisma";
import { Prisma, Payment, PaymentStatus } from "../generated/prisma";

export class PaymentRepository {
  
  create(data: Prisma.PaymentCreateInput): Promise<Payment> {
    return prisma.payment.create({ data });
  }

  findByOrderId(orderId: string): Promise<Payment | null> {
    return prisma.payment.findUnique({ where: { orderId } });
  }

  updateStatus(orderId: string, status: PaymentStatus, transactionRef?: string): Promise<Payment> {
    return prisma.payment.update({
      where: { orderId },
      data: { status, ...(transactionRef && { transactionRef }) },
    });
  }
}
