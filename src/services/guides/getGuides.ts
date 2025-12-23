
import { useQuery } from '@tanstack/react-query';
import { ApiRequest } from '@/services/instance';
import { guidesSchema, GuidesSchema } from '@/schemas/guide';

export const getGuides = async () => {
  return new ApiRequest<GuidesSchema>(guidesSchema).get('guides');
};

export const getTopRatedGuides = async () => {
  return new ApiRequest<GuidesSchema>(guidesSchema).get('guides/top-rated?limit=5&minReviews=1');
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
