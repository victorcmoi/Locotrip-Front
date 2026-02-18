
import { useQuery } from '@tanstack/react-query';
import { ApiRequest } from '@/services/instance';
import { guideSchema, guidesSchema, guidesResponseSchema, type Guides, type Guide } from '@/schemas/guide';

export const getGuides = async () => {
  return new ApiRequest<Guides>(guidesSchema).get('guides');
};

export const getGuidesById = async (id: string) => {
  return new ApiRequest<Guide>(guideSchema).get(`guides/${id}`);
}

export const getTopRatedGuides = async () => {
  return new ApiRequest<Guides>(guidesSchema).get('guides/top-rated?limit=5&minReviews=1');
};

export const searchGuides = async (location?: string, startDate?: string, endDate?: string) => {
  const params = new URLSearchParams();
  if (location) {
    params.append('location', location);
  }
  if (startDate) {
    params.append('startDate', startDate);
  }
  if (endDate) {
    params.append('endDate', endDate);
  }
  const queryString = params.toString();
  return new ApiRequest<Guides>(guidesResponseSchema).get(`guides${queryString ? `?${queryString}` : ''}`);
};

export const useGuides = () => {
  return useQuery({
    queryKey: ['guides'],
    queryFn: () => getGuides(),
  });
};

export const useTopRatedGuides = () => {
  return useQuery({
    queryKey: ['topRatedGuides'],
    queryFn: () => getTopRatedGuides(),
  });
};

export const useSearchGuides = (location?: string, startDate?: string, endDate?: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['searchGuides', location, startDate, endDate],
    queryFn: () => searchGuides(location, startDate, endDate),
    enabled,
  });
};

export const useGuideById = (id: string) => {
  return useQuery({
    queryKey: ['guide', id],
    queryFn: () => getGuidesById(id),
  });
};
