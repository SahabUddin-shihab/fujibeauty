import { Request, Response } from "express";
import { asyncHandler, sendSuccess, UnauthorizedError } from "@fujibeauty/utils";
import { OrderService } from "../services/order.service";

const orderService = new OrderService();

export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError();
  const order = await orderService.create(req.body, req.user);
  sendSuccess(res, order, "Order created successfully", 201);
});

export const getOrder = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError();
  const order = await orderService.getById(req.params.id, req.user);
  sendSuccess(res, order, "Order fetched successfully");
});

export const listMyOrders = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError();
  const orders = await orderService.listForUser(req.user.id);
  sendSuccess(res, orders, "Orders fetched successfully");
});
