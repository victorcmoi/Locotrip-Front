import { z } from 'zod';
import { MediaTypeEnum } from './enums';

export const mediaSchema = z.object({
    id: z.string().uuid(),
    entity_type: z.string(),
    entity_id: z.string().uuid(),
    url: z.string(),
    media_type: MediaTypeEnum,
    description: z.string().nullish(),
    upload_date: z.string().or(z.date()),
    guide_id: z.string().uuid().nullish(),
    experience_id: z.string().uuid().nullish(),
    review_id: z.string().uuid().nullish(),
    city_id: z.string().uuid().nullish(),
});

export const mediasSchema = z.array(mediaSchema);

export const createMediaSchema = z.object({
    entity_type: z.string(),
    entity_id: z.string().uuid(),
    url: z.string().url(),
    media_type: MediaTypeEnum,
    description: z.string().optional(),
});

export type Media = z.infer<typeof mediaSchema>;
export type Medias = z.infer<typeof mediasSchema>;
export type CreateMedia = z.infer<typeof createMediaSchema>;
