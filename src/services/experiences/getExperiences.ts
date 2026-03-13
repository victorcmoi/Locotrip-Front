import { useQuery } from '@tanstack/react-query';
import { ApiRequest } from '@/services/instance';
import { experienceSchema, experiencesSchema, type Experience, type Experiences } from '@/schemas/experience';
import { z } from 'zod';
import { AvailabilityStatusEnum } from '@/schemas/enums';

const experienceAvailabilitiesSchema = z.array(
  z.object({
    id: z.string().uuid(),
    experience_id: z.string().uuid(),
    start_date: z.string().or(z.date()),
    end_date: z.string().or(z.date()),
    status: AvailabilityStatusEnum,
  })
);

export type ExperienceAvailabilities = z.infer<typeof experienceAvailabilitiesSchema>;

export const getExperienceById = async (id: string) => {
  return new ApiRequest<Experience>(experienceSchema).get(`experiences/${id}`);
};

export const getExperiencesByCity = async (cityId: string) => {
  return new ApiRequest<Experiences>(experiencesSchema).get(`experiences/city/${cityId}`);
};

export const getExperiencesByGuide = async (guideId: string) => {
  return new ApiRequest<Experiences>(experiencesSchema).get(`experiences/guide/${guideId}`);
};

export const getExperienceForGuide = async (id: string, guideId: string) => {
  return new ApiRequest<Experience>(experienceSchema).get(`experiences/${id}/guide/${guideId}`);
};

export const getExperienceAvailabilities = async (id: string) => {
  return new ApiRequest<ExperienceAvailabilities>(experienceAvailabilitiesSchema).get(`experiences/${id}/availability`);
};

export const useExperienceById = (id: string) => {
  return useQuery({
    queryKey: ['experience', id],
    queryFn: () => getExperienceById(id),
    enabled: !!id,
  });
};

export const useExperienceForGuide = (id: string, guideId: string) => {
  return useQuery({
    queryKey: ['experience', id, 'guide', guideId],
    queryFn: () => getExperienceForGuide(id, guideId),
    enabled: !!id && !!guideId,
  });
};

export const useExperienceAvailabilities = (id: string) => {
  return useQuery({
    queryKey: ['experience', id, 'availabilities'],
    queryFn: () => getExperienceAvailabilities(id),
    enabled: !!id,
  });
};

export const useExperiencesByCity = (cityId: string) => {
  return useQuery({
    queryKey: ['experiences', 'city', cityId],
    queryFn: () => getExperiencesByCity(cityId),
    enabled: !!cityId,
  });
};

export const useExperiencesByGuide = (guideId: string) => {
  return useQuery({
    queryKey: ['experiences', 'guide', guideId],
    queryFn: () => getExperiencesByGuide(guideId),
    enabled: !!guideId,
  });
};
