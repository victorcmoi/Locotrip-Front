import { useQuery } from '@tanstack/react-query';
import { ApiRequest } from '@/services/instance';
import { experienceSchema, experiencesSchema, type Experience, type Experiences } from '@/schemas/experience';

export const getExperienceById = async (id: string) => {
  return new ApiRequest<Experience>(experienceSchema).get(`experiences/${id}`);
};

export const getExperiencesByCity = async (cityId: string) => {
  return new ApiRequest<Experiences>(experiencesSchema).get(`experiences/city/${cityId}`);
};

export const getExperiencesByGuide = async (guideId: string) => {
  return new ApiRequest<Experiences>(experiencesSchema).get(`experiences/guide/${guideId}`);
};

export const useExperienceById = (id: string) => {
  return useQuery({
    queryKey: ['experience', id],
    queryFn: () => getExperienceById(id),
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
