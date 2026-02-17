import { z } from 'zod';
import { UserRoleEnum } from './enums';

export const userSchema = z.object({
  id: z.string().uuid(),
  last_name: z.string(),
  first_name: z.string(),
  email: z.string().email(),
  phone: z.string().nullish(),
  birth_date: z.string().or(z.date()).nullish(),
  role: UserRoleEnum,
  is_active: z.boolean().default(true),
  is_verified: z.boolean().default(false),
  marketing_consent: z.boolean().default(false),
  marketing_consent_date: z.string().or(z.date()).nullish(),
  data_processing_consent: z.boolean().default(true),
  data_processing_consent_date: z.string().or(z.date()),
  created_at: z.string().or(z.date()),
  updated_at: z.string().or(z.date()),
});

export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  role: UserRoleEnum,
  first_name: z.string().min(1, 'Ce champ est requis.'),
  last_name: z.string().min(1, 'Ce champ est requis.'),
  phone: z.string().optional(),
});

export const updateUserSchema = z.object({
  email: z.string().email().optional(),
  role: UserRoleEnum.optional(),
  first_name: z.string().min(1, 'Ce champ est requis.').optional(),
  last_name: z.string().min(1, 'Ce champ est requis.').optional(),
  phone: z.string().optional(),
  birth_date: z.string().or(z.date()).optional(),
});

export const userApiResponseSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  first_name: z.string(),
  last_name: z.string(),
  role: UserRoleEnum,
  phone: z.string().nullish(),
  is_active: z.boolean(),
  is_verified: z.boolean(),
});

export const usersApiResponseSchema = z.array(userApiResponseSchema);

export const sessionUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  first_name: z.string(),
  last_name: z.string(),
  role: UserRoleEnum,
});

export const loginApiResponseSchema = z.object({
  token: z.string(),
  user: z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    firstName: z.string(),
    lastName: z.string(),
    role: UserRoleEnum,
  }),
});

export type User = z.infer<typeof userSchema>;
export type UserApiResponse = z.infer<typeof userApiResponseSchema>;
export type UsersApiResponse = z.infer<typeof usersApiResponseSchema>;
export type CreateUser = z.infer<typeof createUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type SessionUser = z.infer<typeof sessionUserSchema>;
export type LoginApiResponse = z.infer<typeof loginApiResponseSchema>;
