import { z } from 'zod';
import { UserRoleEnum } from './enums';

export const createUserSchema = z.object({
  email: z.string().email(),
  role: UserRoleEnum,
  firstName: z.string().min(1, 'Ce champ est requis.'),
  lastName: z.string().min(1, 'Ce champ est requis.'),
});

export const updateUserSchema = z.object({
  email: z.string().email().optional(),
  role: UserRoleEnum.optional(),
  firstName: z.string().min(1, 'Ce champ est requis.').optional(),
  lastName: z.string().min(1, 'Ce champ est requis.').optional(),
});

export const userApiResponseSchema = z.object({
  id: z.string().cuid(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  role: UserRoleEnum,
});

export const usersApiResponseSchema = z.array(userApiResponseSchema);

export const sessionUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  first_name: z.string(),
  last_name: z.string(),
  role: UserRoleEnum,
});

export type UserApiResponse = z.infer<typeof userApiResponseSchema>;
export type UsersApiResponse = z.infer<typeof usersApiResponseSchema>;
export type CreateUser = z.infer<typeof createUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type SessionUser = z.infer<typeof sessionUserSchema>;
