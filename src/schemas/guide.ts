import { z } from 'zod';

export const guideSchema = z.object({
  id: z.string(),
  user: z
    .object({
      id: z.string(),
      email: z.string().email().optional(),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      role: z.string().optional(),
    })
    .optional(),
  bio: z.string().nullish(),
  languages: z.string().nullish(),
  years_of_experience: z.number().nullish(),
  guide_status: z.string(),
  pro_card: z.boolean().nullish(),
  country: z.string().nullish(),
  internal_comment: z.string().nullish(),
  created_at: z.any().optional(),
  updated_at: z.any().optional(),
  reviewCount: z.number().optional(),
  categories: z.array(z.string()).optional(),
});

export const guidesSchema = z.array(guideSchema);

export type GuideSchema = z.infer<typeof guideSchema>;
export type GuidesSchema = z.infer<typeof guidesSchema>;
