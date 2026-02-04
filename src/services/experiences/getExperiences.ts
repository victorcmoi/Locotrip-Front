import { useQuery } from '@tanstack/react-query';
import { ApiRequest } from '@/services/instance';
import { experienceSchema, experiencesSchema, type Experience, type Experiences } from '@/schemas/experience';

export interface SearchExperiencesParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  minRating?: number;
  minPrice?: number;
  maxPrice?: number;
  cityId?: string;
  guideId?: string;
  categories?: string;
  search?: string;
  minDuration?: number;
  maxDuration?: number;
  maxParticipants?: number;
  available?: boolean;
}

export const getExperiences = async (params?: SearchExperiencesParams) => {
  const queryParams = new URLSearchParams();
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });
  }
  
  const queryString = queryParams.toString();
  return new ApiRequest<Experiences>(experiencesSchema).get(
    `experiences${queryString ? `?${queryString}` : ''}`
  );
};

export const getExperienceById = async (id: string) => {
  return new ApiRequest<Experience>(experienceSchema).get(`experiences/${id}`);
};

export const getExperiencesByCity = async (cityId: string) => {
  return new ApiRequest<Experiences>(experiencesSchema).get(`experiences/city/${cityId}`);
};

export const getExperiencesByGuide = async (guideId: string) => {
  return new ApiRequest<Experiences>(experiencesSchema).get(`experiences/guide/${guideId}`);
};

export const useExperiences = (params?: SearchExperiencesParams) => {
  return useQuery({
    queryKey: ['experiences', params],
    queryFn: () => getExperiences(params),
  });
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
