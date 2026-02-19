import { z } from 'zod';
import { guideSchema } from './guide';
import { experienceSchema } from './experience';

export enum SearchMode {
    GUIDE = 'guide',
    EXPERIENCE = 'experience',
}

export const searchParamsSchema = z.object({
    mode: z.nativeEnum(SearchMode),
    page: z.number().min(1).optional(),
    limit: z.number().min(1).max(100).optional(),
    sort: z.string().optional(),
    order: z.enum(['asc', 'desc']).optional(),
    location: z.string().optional(),
    startDate: z.string().or(z.date()).optional(),
    endDate: z.string().or(z.date()).optional(),
    minRating: z.number().min(0).max(5).optional(),
    minReviews: z.number().min(0).optional(),
    search: z.string().optional(),
    // Paramètres spécifiques aux expériences
    minPrice: z.number().min(0).optional(),
    maxPrice: z.number().min(0).optional(),
    categories: z.string().optional(),
    minDuration: z.number().min(0).optional(),
    maxDuration: z.number().min(0).optional(),
    maxParticipants: z.number().min(1).optional(),
    // Paramètres spécifiques aux guides
    languages: z.string().optional(),
    minExperience: z.number().min(0).optional(),
});

export const guidesSearchResultSchema = guideSchema.extend({
    reviewCount: z.number(),
    minExperiencePrice: z.number().nullable(),
    maxExperiencePrice: z.number().nullable(),
});

export const experiencesSearchResultSchema = experienceSchema;

export const searchMetaSchema = z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
});

export const guidesSearchResponseSchema = z.object({
    data: z.array(guidesSearchResultSchema),
    meta: searchMetaSchema,
});

export const experiencesSearchResponseSchema = z.object({
    data: z.array(experiencesSearchResultSchema),
    meta: searchMetaSchema,
});

export type SearchParams = z.infer<typeof searchParamsSchema>;
export type GuideSearchResult = z.infer<typeof guidesSearchResultSchema>;
export type ExperienceSearchResult = z.infer<typeof experiencesSearchResultSchema>;
export type SearchMeta = z.infer<typeof searchMetaSchema>;
export type GuidesSearchResponse = z.infer<typeof guidesSearchResponseSchema>;
export type ExperiencesSearchResponse = z.infer<typeof experiencesSearchResponseSchema>;
