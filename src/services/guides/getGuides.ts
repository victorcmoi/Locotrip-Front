
import { useQuery } from '@tanstack/react-query';
import { ApiRequest } from '@/services/instance';
import { guideSchema, guidesSchema, type Guides, type Guide } from '@/schemas/guide';

export const getGuides = async () => {
  return new ApiRequest<Guides>(guidesSchema).get('guides');
};

export const getGuidesById = async (id: string) => {
  return new ApiRequest<Guide>(guideSchema).get(`guides/${id}`);
}

export const getTopRatedGuides = async () => {
  return new ApiRequest<Guides>(guidesSchema).get('guides/top-rated?limit=5&minReviews=1');
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

export const useGuideById = (id: string) => {
  return useQuery({
    queryKey: ['guide', id],
    queryFn: () => getGuidesById(id),
  });
};
