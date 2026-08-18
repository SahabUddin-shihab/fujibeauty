import { Request, Response } from "express";
import { asyncHandler, sendSuccess, UnauthorizedError } from "@fujibeauty/utils";
import { ProductService } from "../services/product.service";

const productService = new ProductService();

export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError();
  const product = await productService.create(req.body, req.user);
  sendSuccess(res, product, "Product created successfully", 201);
});

export const listProducts = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, categoryId, search } = req.query as unknown as {
    page: number;
    limit: number;
    categoryId?: string;
    search?: string;
  };
  const result = await productService.list({ page, limit, categoryId, search });
  sendSuccess(res, result, "Products fetched successfully");
});

export const getProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.getById(req.params.id);
  sendSuccess(res, product, "Product fetched successfully");
});

export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError();
  const product = await productService.update(req.params.id, req.body, req.user);
  sendSuccess(res, product, "Product updated successfully");
});

export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError();
  await productService.delete(req.params.id, req.user);
  sendSuccess(res, null, "Product deleted successfully");
});

export const reserveStock = asyncHandler(async (req: Request, res: Response) => {
  await productService.reserveStock(req.params.id, req.body.quantity);
  sendSuccess(res, null, "Stock reserved successfully");
});

export const releaseStock = asyncHandler(async (req: Request, res: Response) => {
  await productService.releaseStock(req.params.id, req.body.quantity);
  sendSuccess(res, null, "Stock released successfully");
});
