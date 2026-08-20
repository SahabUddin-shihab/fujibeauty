import { Request, Response } from "express";
import { asyncHandler, sendSuccess, UnauthorizedError } from "@fujibeauty/utils";
import { PaymentService } from "../services/payment.service";

const paymentService = new PaymentService();

export const payOrder = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError();
  const payment = await paymentService.pay(req.params.orderId, req.user, req.body?.paymentMethodId);
  sendSuccess(res, payment, "Payment processed successfully");
});

export const getPayment = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError();
  const payment = await paymentService.getByOrderId(req.params.orderId, req.user);
  sendSuccess(res, payment, "Payment fetched successfully");
});
