import { z } from 'zod';
import { GuideStatusEnum } from './enums';
import { userSchema } from './user';
import { mediaSchema } from './media';

export const guideSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  user: userSchema.pick({
    id: true,
    email: true,
    first_name: true,
    last_name: true,
    role: true,
  }).optional(),
  bio: z.string().nullish(),
  languages: z.string().nullish(),
  years_of_experience: z.number().int().nullish(),
  guide_status: GuideStatusEnum,
  pro_card: z.boolean().default(false),
  country: z.string().nullish(),
  card_request_date: z.string().or(z.date()).nullish(),
  card_verification_date: z.string().or(z.date()).nullish(),
  internal_comment: z.string().nullish(),
  response_time_hours: z.number().nullish(),
  is_active: z.boolean().default(true),
  suspended_at: z.string().or(z.date()).nullish(),
  suspension_reason: z.string().nullish(),
  created_at: z.string().or(z.date()),
  updated_at: z.string().or(z.date()),
  reviewCount: z.number().optional(),
  experiencesCount: z.number().optional(),
  categories: z.array(z.string()).optional(),
  medias: z.array(mediaSchema).optional(),
  hobbies: z.array(z.object({
    category_id: z.string().uuid(),
    category: z.object({
      id: z.string().uuid(),
      name: z.string(),
    }).optional(),
  })).optional(),
});

export const createGuideSchema = z.object({
  user_id: z.string().uuid(),
  bio: z.string().min(50, 'La bio doit contenir au moins 50 caractères').max(1000),
  languages: z.string().min(1, 'Veuillez indiquer au moins une langue'),
  years_of_experience: z.number().int().min(0).max(99),
  guide_status: GuideStatusEnum,
  country: z.string().min(1, 'Le pays est requis'),
});

export const updateGuideSchema = z.object({
  bio: z.string().min(50).max(1000).optional(),
  languages: z.string().optional(),
  years_of_experience: z.number().int().min(0).max(99).optional(),
  guide_status: GuideStatusEnum.optional(),
  country: z.string().optional(),
  response_time_hours: z.number().optional(),
});

export const guidesSchema = z.array(guideSchema);

export const guidesResponseSchema = z.object({
  data: z.array(guideSchema),
  total: z.number().optional(),
}).transform(response => response.data);

export type Guide = z.infer<typeof guideSchema>;
export type Guides = z.infer<typeof guidesSchema>;
export type CreateGuide = z.infer<typeof createGuideSchema>;
export type UpdateGuide = z.infer<typeof updateGuideSchema>;
