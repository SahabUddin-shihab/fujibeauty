import { z } from "zod";

export const payOrderParamSchema = z.object({
  params: z.object({
    orderId: z.string().uuid("Invalid order id"),
  }),
  body: z.object({
    paymentMethodId: z.string().optional(),
  }),
});

export const getPaymentParamSchema = z.object({
  params: z.object({
    orderId: z.string().uuid("Invalid order id"),
  }),
});
