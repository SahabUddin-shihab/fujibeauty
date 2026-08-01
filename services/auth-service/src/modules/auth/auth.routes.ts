import { Router } from "express";
import { AuthController } from "./auth.controller";
import { validate } from "../../middleware/validate";
import { authenticate } from "../../middleware/authenticate";
import { asyncHandler } from "../../common/async-handler";
import { loginSchema, logoutSchema, refreshSchema, registerSchema } from "./auth.dto";

const router = Router();
const controller = new AuthController();

/**
 * @openapi
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user account
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, firstName, lastName]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *               firstName: { type: string }
 *               lastName: { type: string }
 *     responses:
 *       201: { description: Account created }
 *       409: { description: Email already registered }
 */
router.post("/register", validate({ body: registerSchema }), asyncHandler(controller.register));

/**
 * @openapi
 * /api/v1/auth/login:
 *   post:
 *     summary: Authenticate and receive an access/refresh token pair
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       200: { description: Authenticated }
 *       401: { description: Invalid credentials }
 */
router.post("/login", validate({ body: loginSchema }), asyncHandler(controller.login));

/**
 * @openapi
 * /api/v1/auth/refresh:
 *   post:
 *     summary: Exchange a refresh token for a new access/refresh token pair
 *     tags: [Auth]
 *     responses:
 *       200: { description: New token pair issued }
 *       401: { description: Refresh token invalid, expired, or revoked }
 */
router.post("/refresh", validate({ body: refreshSchema }), asyncHandler(controller.refresh));

/**
 * @openapi
 * /api/v1/auth/logout:
 *   post:
 *     summary: Revoke a refresh token
 *     tags: [Auth]
 *     responses:
 *       204: { description: Logged out }
 */
router.post("/logout", validate({ body: logoutSchema }), asyncHandler(controller.logout));

/**
 * @openapi
 * /api/v1/auth/me:
 *   get:
 *     summary: Return the identity encoded in the current access token
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Current user claims }
 *       401: { description: Missing or invalid access token }
 */
router.get("/me", authenticate, asyncHandler(controller.me));

export default router;
