import { z } from 'zod';
import { mediaSchema } from './media';

export const citySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  country: z.string(),
  slug: z.string(),
  description: z.string().nullish(),
  latitude: z.number().nullish(),
  longitude: z.number().nullish(),
  image: mediaSchema.nullish(),
  is_active: z.boolean(),
  is_suggested: z.boolean(),
  created_at: z.string().or(z.date()),
});

export const citiesSchema = z.array(citySchema);

export const citiesResponseSchema = z.object({
  data: z.array(citySchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
  }).optional(),
}).transform(response => response.data);

export type City = z.infer<typeof citySchema>;
export type Cities = z.infer<typeof citiesSchema>;
