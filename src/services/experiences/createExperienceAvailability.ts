import { ApiRequest } from '@/services/instance';
import { z } from 'zod';
import { AvailabilityStatusEnum } from '@/schemas/enums';

const availabilityResponseSchema = z.object({
  id: z.string().uuid(),
  experience_id: z.string().uuid(),
  start_date: z.string().or(z.date()),
  end_date: z.string().or(z.date()),
  status: AvailabilityStatusEnum,
});

const createExperienceAvailabilitySchema = z.object({
  experience_id: z.string().uuid(),
  start_date: z.string().datetime(),
  end_date: z.string().datetime(),
  status: AvailabilityStatusEnum,
});

type AvailabilityResponse = z.infer<typeof availabilityResponseSchema>;
export type CreateAvailabilityData = z.infer<typeof createExperienceAvailabilitySchema>;

export const createExperienceAvailability = async (data: CreateAvailabilityData) => {
  return new ApiRequest<AvailabilityResponse>(availabilityResponseSchema).post(
    `experiences/${data.experience_id}/availability`,
    data,
  );
};
