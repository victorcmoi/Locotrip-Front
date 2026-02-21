import { ApiRequest } from '@/services/instance';
import { z } from 'zod';

const availabilityResponseSchema = z.object({
  id: z.string().uuid(),
  experience_id: z.string().uuid(),
  start_date: z.string().or(z.date()),
  end_date: z.string().or(z.date()),
  status: z.string(),
});

type AvailabilityResponse = z.infer<typeof availabilityResponseSchema>;

export type CreateAvailabilityData = {
  experience_id: string;
  start_date: string;
  end_date: string;
  status: 'available' | 'unavailable' | 'blocked';
};

export const createExperienceAvailability = async (data: CreateAvailabilityData) => {
  return new ApiRequest<AvailabilityResponse>(availabilityResponseSchema).post(
    `experiences/${data.experience_id}/availability`,
    data,
  );
};
