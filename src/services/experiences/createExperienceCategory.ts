import { ApiRequest } from '@/services/instance';
import { z } from 'zod';

const experienceCategoryResponseSchema = z.object({
  experience_id: z.string().uuid(),
  category_id: z.string().uuid(),
});

type ExperienceCategoryResponse = z.infer<typeof experienceCategoryResponseSchema>;

export const addCategoryToExperience = async (experienceId: string, categoryId: string) => {
  return new ApiRequest<ExperienceCategoryResponse>(experienceCategoryResponseSchema).post(
    `experiences/${experienceId}/categories`,
    { category_id: categoryId }
  );
};
