import { AppError, ForbiddenError, NotFoundError } from "@ecommerce-ai/utils";
import { OrderRepository } from "../repositories/order.repository";
import { OrderEventsProducer } from "../producers/order-events.producer";
import { getProductById, reserveStock, releaseStock } from "../utils/product-client";
import { CreateOrderInput } from "../validators/order.validator";
import { AuthenticatedUser } from "@ecommerce-ai/shared-types";
import { env } from "../config/env";
import { logger } from "../config/logger";

const orderRepository = new OrderRepository();
const orderEventsProducer = new OrderEventsProducer();

export class OrderService {
  async create(input: CreateOrderInput, user: AuthenticatedUser) {

    const resolvedItems = await Promise.all(
      input.items.map(async (item) => {
        const product = await getProductById(item.productId);

        if (!product.isActive) {
          throw new AppError(`Product ${product.name} is no longer available`, 409);
        }

        return {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: item.quantity,
        };
      })
    );

    const reserved: { productId: string; quantity: number }[] = [];
    try {
      for (const item of resolvedItems) {
        await reserveStock(item.productId, item.quantity);
        reserved.push({ productId: item.productId, quantity: item.quantity });
      }
    } catch (error) {
      await Promise.all(
        reserved.map((item) =>
          releaseStock(item.productId, item.quantity).catch((releaseError) =>
            logger.error("Failed to release stock during order rollback", {
              error: releaseError,
              productId: item.productId,
            })
          )
        )
      );
      throw error;
    }

    const totalAmount = resolvedItems.reduce(
      (sum, item) => sum + parseFloat(item.price) * item.quantity,
      0
    );

    const reservationExpiresAt = new Date(Date.now() + env.ORDER_RESERVATION_TTL_MINUTES * 60_000);

    const order = await orderRepository.create({
      userId: user.id,
      userEmail: user.email,
      totalAmount,
      reservationExpiresAt,
      items: { create: resolvedItems },
    });

    logger.info("Order created", { orderId: order.id, userId: user.id, totalAmount });

    await orderEventsProducer.publishOrderCreated({
      orderId: order.id,
      userId: order.userId,
      userEmail: order.userEmail,
      items: resolvedItems,
      totalAmount: order.totalAmount.toString(),
      createdAt: order.createdAt.toISOString(),
    });

    return order;
  }

  async getById(id: string, requester: AuthenticatedUser) {
    const order = await orderRepository.findById(id);
    if (!order) {
      throw new NotFoundError("Order not found");
    }
    if (requester.role !== "ADMIN" && order.userId !== requester.id) {
      throw new ForbiddenError("You do not have permission to view this order");
    }
    return order;
  }

  async listForUser(userId: string) {
    return orderRepository.findByUserId(userId);
  }

  async confirmAfterPayment(orderId: string) {
    const order = await orderRepository.findById(orderId);
    if (!order) {
      logger.error("Received payment.succeeded for unknown order", { orderId });
      return;
    }

    if (order.status === "CANCELLED") {

      logger.error("Payment succeeded for an already-cancelled order — needs manual refund review", {
        orderId,
      });
      return;
    }

    if (order.status === "CONFIRMED") {
      logger.warn("Received duplicate payment.succeeded for an already-confirmed order", { orderId });
      return;
    }

    const confirmed = await orderRepository.updateStatus(orderId, "CONFIRMED");

    await orderEventsProducer.publishOrderConfirmed({
      orderId: confirmed.id,
      userId: confirmed.userId,
      userEmail: confirmed.userEmail,
      confirmedAt: new Date().toISOString(),
    });
  }

  async expirePendingOrders(): Promise<number> {
    const expiredOrders = await orderRepository.findExpiredPending();

    for (const order of expiredOrders) {
      await Promise.all(
        order.items.map((item: { productId: string; quantity: number }) =>
          releaseStock(item.productId, item.quantity).catch((error) =>
            logger.error("Failed to release stock while expiring order", {
              error,
              orderId: order.id,
              productId: item.productId,
            })
          )
        )
      );

      await orderRepository.updateStatus(order.id, "CANCELLED");

      await orderEventsProducer.publishOrderCancelled({
        orderId: order.id,
        userId: order.userId,
        reason: "Payment not received before the reservation expired",
        cancelledAt: new Date().toISOString(),
      });

      logger.info("Expired unpaid order and released its stock", { orderId: order.id });
    }

    return expiredOrders.length;
  }
}
