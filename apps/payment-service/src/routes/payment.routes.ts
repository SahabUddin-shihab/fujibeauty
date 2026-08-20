import { Router } from "express";
import * as paymentController from "../controllers/payment.controller";
import { validate } from "../middlewares/validate.middleware";
import { authenticate } from "../middlewares/auth.middleware";
import { payOrderParamSchema, getPaymentParamSchema } from "../validators/payment.validator";

const router = Router();

router.post("/:orderId/pay", authenticate, validate(payOrderParamSchema), paymentController.payOrder);

router.get("/:orderId", authenticate, validate(getPaymentParamSchema), paymentController.getPayment);

export default router;
