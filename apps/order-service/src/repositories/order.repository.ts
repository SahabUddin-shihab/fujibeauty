import { prisma } from "../config/prisma";
import { Prisma, Order, OrderStatus } from "../generated/prisma";

export class OrderRepository {
  create(data: Prisma.OrderCreateInput): Promise<Order> {
    return prisma.order.create({ data, include: { items: true } });
  }

  findById(id: string) {
    return prisma.order.findUnique({ where: { id }, include: { items: true } });
  }

  findByUserId(userId: string) {
    return prisma.order.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });
  }

  updateStatus(id: string, status: OrderStatus): Promise<Order> {
    return prisma.order.update({ where: { id }, data: { status }, include: { items: true } });
  }

  // Orders still PENDING (never paid) whose stock reservation has lapsed —
  // candidates for the expiry job to cancel and release stock for.
  findExpiredPending() {
    return prisma.order.findMany({
      where: { status: "PENDING", reservationExpiresAt: { lt: new Date() } },
      include: { items: true },
    });
  }
}
