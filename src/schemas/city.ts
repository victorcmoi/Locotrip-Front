import { z } from 'zod';

export const citySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  country: z.string(),
  slug: z.string(),
  description: z.string().nullish(),
  latitude: z.number().nullish(),
  longitude: z.number().nullish(),
  image_url: z.string().nullish(),
  is_active: z.boolean(),
  created_at: z.string().or(z.date()),
});

export const citiesSchema = z.array(citySchema);

export type City = z.infer<typeof citySchema>;
export type Cities = z.infer<typeof citiesSchema>;
