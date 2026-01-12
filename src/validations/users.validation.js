import { z } from 'zod';

// Schema for validating the user id (typically from route params)
export const userIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

// Schema for validating updates to a user
// All fields are optional, but at least one must be provided.
export const updateUserSchema = z
  .object({
    name: z.string().min(2).max(255).trim().optional(),
    email: z.string().email().max(255).toLowerCase().trim().optional(),
    role: z.enum(['user', 'admin']).optional(),
  })
  .refine(
    (data) =>
      typeof data.name !== 'undefined' ||
      typeof data.email !== 'undefined' ||
      typeof data.role !== 'undefined',
    {
      message: 'At least one field must be provided to update',
      path: ['_root'],
    },
  );
