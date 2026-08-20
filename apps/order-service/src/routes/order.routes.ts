import { Router } from "express";
import * as orderController from "../controllers/order.controller";
import { validate } from "../middlewares/validate.middleware";
import { authenticate } from "../middlewares/auth.middleware";
import { createOrderSchema, orderIdParamSchema } from "../validators/order.validator";

const router = Router();


router.post("/", authenticate, validate(createOrderSchema), orderController.createOrder);


router.get("/", authenticate, orderController.listMyOrders);


router.get("/:id", authenticate, validate(orderIdParamSchema), orderController.getOrder);

export default router;
