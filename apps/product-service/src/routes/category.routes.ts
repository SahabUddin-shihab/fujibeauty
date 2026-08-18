import { Router } from "express";
import * as categoryController from "../controllers/category.controller";
import { validate } from "../middlewares/validate.middleware";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { createCategorySchema } from "../validators/product.validator";

const router = Router();

/**
 * @openapi
 * /categories:
 *   get:
 *     summary: List all categories
 *     tags: [Categories]
 */
router.get("/", categoryController.listCategories);

/**
 * @openapi
 * /categories:
 *   post:
 *     summary: Create a category (admin only)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 */
router.post("/", authenticate, authorize("ADMIN"), validate(createCategorySchema), categoryController.createCategory);

export default router;
