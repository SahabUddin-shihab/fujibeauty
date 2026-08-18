import { Router } from "express";
import * as categoryController from "../controllers/category.controller";
import { validate } from "../middlewares/validate.middleware";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { createCategorySchema } from "../validators/product.validator";

const router = Router();

router.get("/", categoryController.listCategories);

router.post("/", authenticate, authorize("ADMIN"), validate(createCategorySchema), categoryController.createCategory);

export default router;
