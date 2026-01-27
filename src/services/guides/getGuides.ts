
import { useQuery } from '@tanstack/react-query';
import { ApiRequest } from '@/services/instance';
import { guideSchema, guidesSchema, guidesResponseSchema, GuideSchema, GuidesSchema } from '@/schemas/guide';

export const getGuides = async () => {
  return new ApiRequest<GuidesSchema>(guidesSchema).get('guides');
};

export const getGuidesById = async (id: string) => {
  return new ApiRequest<GuideSchema>(guideSchema).get(`guides/${id}`);
}

export const getTopRatedGuides = async () => {
  return new ApiRequest<GuidesSchema>(guidesSchema).get('guides/top-rated?limit=5&minReviews=1');
};

export const searchGuidesByDate = async (date?: string) => {
  const params = new URLSearchParams();
  if (date) {
    params.append('date', date);
  }
  const queryString = params.toString();
  return new ApiRequest<GuidesSchema>(guidesResponseSchema).get(`guides${queryString ? `?${queryString}` : ''}`);
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

export const useSearchGuides = (date?: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['searchGuides', date],
    queryFn: () => searchGuidesByDate(date),
    enabled,
  });
};

export const useGuideById = (id: string) => {
  return useQuery({
    queryKey: ['guide', id],
    queryFn: () => getGuidesById(id),
  });
};
