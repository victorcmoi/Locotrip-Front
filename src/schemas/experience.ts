import { z } from 'zod';
import { citySchema } from './city';
import { mediaSchema } from './media';
import { reviewSchema } from './reviews';
import { bookingSchema } from './booking';

export const experienceStepSchema = z.object({
  id: z.string().uuid(),
  experience_id: z.string().uuid(),
  step_number: z.number(),
  title: z.string(),
  description: z.string().nullish(),
});

export const currencyPriceSchema = z.object({
  id: z.string().uuid().optional(),
  experience_id: z.string().uuid(),
  currency_code: z.string().length(3),
  price: z.coerce.number(),
  currency: z.object({
    code: z.string().length(3),
    name: z.string(),
    exchange_rate: z.coerce.number(),
  }).optional(),
});

export const experienceSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullish(),
  additional_info: z.string().nullish(),
  price: z.coerce.number(),
  duration: z.number().int(),
  city_id: z.string().uuid(),
  guide_id: z.string().uuid(),
  max_capacity: z.number().int().nullish(),
  meeting_point: z.string().nullish(),
  meeting_latitude: z.number().nullish(),
  meeting_longitude: z.number().nullish(),
  is_accessible: z.boolean().optional().default(false),
  is_active: z.boolean().default(true),
  is_published: z.boolean().default(false),
  deleted_at: z.string().or(z.date()).nullish(),
  created_at: z.string().or(z.date()),
  updated_at: z.string().or(z.date()),
  city: citySchema.pick({
    id: true,
    name: true,
    country: true,
    slug: true,
  }).optional(),
  guide: z.object({
    id: z.string().uuid(),
    user: z.object({
      id: z.string().uuid(),
      first_name: z.string(),
      last_name: z.string(),
    }),
    bio: z.string().nullish(),
    languages: z.string().nullish(),
    country: z.string().nullish(),
    pro_card: z.boolean().optional(),
    reviewCount: z.number().optional(),
    medias: z.array(mediaSchema).optional(),
  }).optional(),
  medias: z.array(mediaSchema).optional(),
  categories: z.array(z.object({
    category_id: z.string().uuid(),
    category: z.object({
      id: z.string().uuid(),
      name: z.string(),
    }).optional(),
  })).optional(),
  reviews: z.array(reviewSchema).optional(),
  bookings: z.array(bookingSchema).optional(),
  currency_prices: z.array(currencyPriceSchema).optional(),
  availabilities: z.array(z.object({
    id: z.string().uuid(),
    experience_id: z.string().uuid(),
    start_date: z.string().or(z.date()),
    end_date: z.string().or(z.date()),
    status: z.string(),
  })).optional(),
  steps: z.array(experienceStepSchema).optional(),
  avgRating: z.number().optional(),
  reviewCount: z.number().optional(),
});

export const experiencesSchema = z.array(experienceSchema);

export const createExperienceSchema = z.object({
  title: z.string().min(10, 'Le titre doit contenir au moins 10 caractères').max(150),
  description: z.string().min(50, 'La description doit contenir au moins 50 caractères'),
  price: z.coerce.number().positive(),
  duration: z.number().int().positive(),
  city_id: z.string().uuid(),
  guide_id: z.string().uuid(),
  max_capacity: z.number().int().positive().optional(),
  meeting_point: z.string().max(255).optional(),
  meeting_latitude: z.coerce.number().min(-90).max(90).optional(),
  meeting_longitude: z.coerce.number().min(-180).max(180).optional(),
  additional_info: z.string().optional(),
  is_accessible: z.boolean().optional(),
});

export const updateExperienceSchema = createExperienceSchema.partial();

export type Experience = z.infer<typeof experienceSchema>;
export type Experiences = z.infer<typeof experiencesSchema>;
export type CreateExperience = z.infer<typeof createExperienceSchema>;
export type UpdateExperience = z.infer<typeof updateExperienceSchema>;
