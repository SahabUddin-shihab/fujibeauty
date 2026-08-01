import { z } from "zod";

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  phone: z
    .string()
    .regex(/^\+?[0-9]{7,15}$/, "Phone must be a valid number")
    .optional(),
  avatarUrl: z.string().url().optional()
});

export const createAddressSchema = z.object({
  label: z.string().min(1).max(50),
  line1: z.string().min(1).max(200),
  line2: z.string().max(200).optional(),
  city: z.string().min(1).max(100),
  state: z.string().min(1).max(100),
  postalCode: z.string().min(1).max(20),
  country: z.string().min(2).max(100),
  isDefault: z.boolean().optional().default(false)
});

export const updateAddressSchema = createAddressSchema.partial();

export const idParamSchema = z.object({
  id: z.string().uuid("Invalid id")
});

export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;
export type CreateAddressDto = z.infer<typeof createAddressSchema>;
export type UpdateAddressDto = z.infer<typeof updateAddressSchema>;
