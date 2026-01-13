import { z } from 'zod';

export const experienceSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullish(),
  price: z.number(),
  duration: z.number(),
  city_id: z.string().uuid(),
  guide_id: z.string().uuid(),
  max_capacity: z.number().nullish(),
  meeting_point: z.string().nullish(),
  meeting_latitude: z.number().nullish(),
  meeting_longitude: z.number().nullish(),
  is_active: z.boolean(),
  is_published: z.boolean(),
  created_at: z.string().or(z.date()),
  updated_at: z.string().or(z.date()),
  city: z.object({
    id: z.string().uuid(),
    name: z.string(),
    country: z.string(),
  }).optional(),
  guide: z.object({
    id: z.string().uuid(),
    user: z.object({
      id: z.string().uuid(),
      first_name: z.string(),
      last_name: z.string(),
    }),
  }).optional(),
});

export const experiencesSchema = z.array(experienceSchema);

export type Experience = z.infer<typeof experienceSchema>;
export type Experiences = z.infer<typeof experiencesSchema>;
