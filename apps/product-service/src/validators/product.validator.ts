import { z } from "zod";

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(150),
    description: z.string().min(10),
    price: z.number().positive("Price must be greater than 0"),
    stock: z.number().int().nonnegative().default(0),
    sku: z.string().min(3),
    categoryId: z.string().uuid("categoryId must be a valid UUID"),
    images: z.array(z.string().url()).default([]),
  }),
});

export const updateProductSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(150).optional(),
    description: z.string().min(10).optional(),
    price: z.number().positive().optional(),
    stock: z.number().int().nonnegative().optional(),
    categoryId: z.string().uuid().optional(),
    images: z.array(z.string().url()).optional(),
    isActive: z.boolean().optional(),
  }),
  params: z.object({
    id: z.string().uuid("Invalid product id"),
  }),
});

export const listProductsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    categoryId: z.string().uuid().optional(),
    search: z.string().optional(),
  }),
});

export const productIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid product id"),
  }),
});

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100),
  }),
});

export const adjustStockSchema = z.object({
  body: z.object({
    quantity: z.number().int().positive("quantity must be at least 1"),
  }),
  params: z.object({
    id: z.string().uuid("Invalid product id"),
  }),
});

export type CreateProductInput = z.infer<typeof createProductSchema>["body"];
export type UpdateProductInput = z.infer<typeof updateProductSchema>["body"];
export type ListProductsQuery = z.infer<typeof listProductsSchema>["query"];
