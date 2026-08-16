import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { validate } from "../middlewares/validate.middleware";
import { authenticate } from "../middlewares/auth.middleware";
import { registerSchema, loginSchema, refreshTokenSchema } from "../validators/auth.validator";

const router = Router();

router.post("/register", validate(registerSchema), authController.register);

router.post("/login", validate(loginSchema), authController.login);

router.post("/refresh-token", validate(refreshTokenSchema), authController.refreshToken);

router.post("/logout", validate(refreshTokenSchema), authController.logout);

router.get("/me", authenticate, authController.getProfile);

export default router;
