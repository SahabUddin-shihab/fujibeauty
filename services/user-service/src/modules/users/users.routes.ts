import { Router } from "express";
import { UsersController } from "./users.controller";
import { validate } from "../../middleware/validate";
import { requireIdentity } from "../../middleware/identity";
import { asyncHandler } from "../../common/async-handler";
import { createAddressSchema, idParamSchema, updateAddressSchema, updateProfileSchema } from "./users.dto";

const router = Router();
const controller = new UsersController();

router.use(requireIdentity);

/**
 * @openapi
 * /api/v1/users/me:
 *   get:
 *     summary: Get the current user's profile
 *     tags: [Users]
 *     responses:
 *       200: { description: Profile returned }
 *   put:
 *     summary: Update the current user's profile
 *     tags: [Users]
 *     responses:
 *       200: { description: Profile updated }
 */
router.get("/me", asyncHandler(controller.getMyProfile));
router.put("/me", validate({ body: updateProfileSchema }), asyncHandler(controller.updateMyProfile));

/**
 * @openapi
 * /api/v1/users/me/addresses:
 *   get:
 *     summary: List the current user's saved addresses
 *     tags: [Users]
 *     responses:
 *       200: { description: Addresses returned }
 *   post:
 *     summary: Add a new address
 *     tags: [Users]
 *     responses:
 *       201: { description: Address created }
 */
router.get("/me/addresses", asyncHandler(controller.listAddresses));
router.post(
  "/me/addresses",
  validate({ body: createAddressSchema }),
  asyncHandler(controller.createAddress)
);

/**
 * @openapi
 * /api/v1/users/me/addresses/{id}:
 *   put:
 *     summary: Update an address
 *     tags: [Users]
 *     responses:
 *       200: { description: Address updated }
 *   delete:
 *     summary: Soft-delete an address
 *     tags: [Users]
 *     responses:
 *       204: { description: Address deleted }
 */
router.put(
  "/me/addresses/:id",
  validate({ params: idParamSchema, body: updateAddressSchema }),
  asyncHandler(controller.updateAddress)
);
router.delete(
  "/me/addresses/:id",
  validate({ params: idParamSchema }),
  asyncHandler(controller.deleteAddress)
);

export default router;
