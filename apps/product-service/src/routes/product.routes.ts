import { Router } from "express";
import * as productController from "../controllers/product.controller";
import { validate } from "../middlewares/validate.middleware";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { requireInternalApiKey } from "../middlewares/internal-auth.middleware";
import {
  createProductSchema,
  updateProductSchema,
  listProductsSchema,
  productIdParamSchema,
  adjustStockSchema,
} from "../validators/product.validator";

const router = Router();

router.get("/", validate(listProductsSchema), productController.listProducts);

router.get("/:id", validate(productIdParamSchema), productController.getProduct);

router.post(
  "/",
  authenticate,
  authorize("VENDOR", "ADMIN"),
  validate(createProductSchema),
  productController.createProduct
);

router.patch(
  "/:id",
  authenticate,
  authorize("VENDOR", "ADMIN"),
  validate(updateProductSchema),
  productController.updateProduct
);


router.delete(
  "/:id",
  authenticate,
  authorize("VENDOR", "ADMIN"),
  validate(productIdParamSchema),
  productController.deleteProduct
);


router.post(
  "/:id/reserve-stock",
  requireInternalApiKey,
  validate(adjustStockSchema),
  productController.reserveStock
);


router.post(
  "/:id/release-stock",
  requireInternalApiKey,
  validate(adjustStockSchema),
  productController.releaseStock
);

export default router;
