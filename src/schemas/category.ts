import { z } from 'zod';

export const categorySchema = z.object({
    id: z.string().uuid(),
    name: z.string(),
});

export const categoriesSchema = z.array(categorySchema);

export const experienceCategorySchema = z.object({
    experience_id: z.string().uuid(),
    category_id: z.string().uuid(),
    category: categorySchema.optional(),
});

export const guideHobbySchema = z.object({
    guide_id: z.string().uuid(),
    category_id: z.string().uuid(),
    category: categorySchema.optional(),
});

export type Category = z.infer<typeof categorySchema>;
export type Categories = z.infer<typeof categoriesSchema>;
export type ExperienceCategory = z.infer<typeof experienceCategorySchema>;
export type GuideHobby = z.infer<typeof guideHobbySchema>;
