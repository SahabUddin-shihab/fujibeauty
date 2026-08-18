import { z } from "zod";

export const createOrderSchema = z.object({
  body: z.object({
    items: z
      .array(
        z.object({
          productId: z.string().uuid("productId must be a valid UUID"),
          quantity: z.number().int().positive("quantity must be at least 1"),
        })
      )
      .min(1, "Order must contain at least one item"),
  }),
});

export const orderIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid order id"),
  }),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>["body"];
