import { z } from 'zod';

// Schéma pour une review individuelle
export const reviewSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  experience_id: z.string(),
  rating: z.number().int().min(1).max(5),
  title: z.string().nullable().optional(),
  comment: z.string().nullable().optional(),
  review_date: z.string().or(z.date()),
  // Relations optionnelles
  user: z
    .object({
      id: z.string().uuid(),
      first_name: z.string(),
      last_name: z.string(),
      email: z.string().email().optional(),
    })
    .nullable()
    .optional(),
  experience: z
    .object({
      id: z.string().uuid(),
      title: z.string(),
      description: z.string().nullish(),
      price: z.number(),
      duration: z.number(),
    })
    .optional(),
});

// Schéma pour un tableau de reviews
export const reviewsSchema = z.array(reviewSchema);

// Schéma pour créer une review
export const createReviewSchema = z.object({
  experience_id: z.string().uuid(),
  rating: z.number().int().min(1, 'La note doit être au minimum de 1').max(5, 'La note doit être au maximum de 5'),
  comment: z.string().min(10, 'Le commentaire doit contenir au moins 10 caractères').max(1000, 'Le commentaire ne peut pas dépasser 1000 caractères').optional(),
});

// Schéma pour mettre à jour une review
export const updateReviewSchema = z.object({
  rating: z.number().int().min(1, 'La note doit être au minimum de 1').max(5, 'La note doit être au maximum de 5').optional(),
  comment: z.string().min(10, 'Le commentaire doit contenir au moins 10 caractères').max(1000, 'Le commentaire ne peut pas dépasser 1000 caractères').optional(),
});

// Schéma pour la réponse API d'une review
export const reviewApiResponseSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  experience_id: z.string(),
  rating: z.number().int().min(1).max(5),
  title: z.string().nullable().optional(),
  comment: z.string().nullable().optional(),
  review_date: z.string().or(z.date()),
  user: z.object({
    id: z.string(),
    first_name: z.string(),
    last_name: z.string(),
  }).nullable().optional(),
  experience: z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().nullish(),
    price: z.coerce.number().optional(), 
    duration: z.number().optional(),
    created_at: z.string().or(z.date()).optional(),
    city: z.object({
      id: z.string().uuid(),
      name: z.string(),
      country: z.string(),
    }).optional(),
    guide: z.object({
      id: z.string().uuid(),
      guide_status: z.string().optional(),
      user: z.object({
        id: z.string().uuid(),
        first_name: z.string(),
        last_name: z.string(),
      }),
    }).optional(),
  }).nullable().optional(),
});

// Schéma pour un tableau de réponses API de reviews
export const reviewsApiResponseSchema = z.array(reviewApiResponseSchema);

// Types inférés
export type Review = z.infer<typeof reviewSchema>;
export type Reviews = z.infer<typeof reviewsSchema>;
export type CreateReview = z.infer<typeof createReviewSchema>;
export type UpdateReview = z.infer<typeof updateReviewSchema>;
export type ReviewApiResponse = z.infer<typeof reviewApiResponseSchema>;
export type ReviewsApiResponse = z.infer<typeof reviewsApiResponseSchema>;
