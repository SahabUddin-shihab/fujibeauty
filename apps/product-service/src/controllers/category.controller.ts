import { Request, Response } from "express";
import { asyncHandler, sendSuccess } from "@fujibeauty/utils";
import { CategoryService } from "../services/category.service";

const categoryService = new CategoryService();

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoryService.create(req.body.name);
  sendSuccess(res, category, "Category created successfully", 201);
});

export const listCategories = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await categoryService.list();
  sendSuccess(res, categories, "Categories fetched successfully");
});
