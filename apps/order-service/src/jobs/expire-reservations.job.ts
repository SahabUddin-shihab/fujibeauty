import cron from "node-cron";
import { env } from "../config/env";
import { logger } from "../config/logger";
import { OrderService } from "../services/order.service";

const orderService = new OrderService();

export function startReservationExpiryJob(): void {
  cron.schedule(env.ORDER_EXPIRY_CRON, async () => {
    try {
      const expiredCount = await orderService.expirePendingOrders();
      if (expiredCount > 0) {
        logger.info(`Reservation-expiry job cancelled ${expiredCount} unpaid order(s)`);
      }
    } catch (error) {
      logger.error("Reservation-expiry job failed", { error });
    }
  });

  logger.info(`Reservation-expiry job scheduled (${env.ORDER_EXPIRY_CRON})`);
}
