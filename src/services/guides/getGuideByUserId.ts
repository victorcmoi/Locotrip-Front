import { useQuery } from '@tanstack/react-query';
import { ApiRequest } from '@/services/instance';
import { guideSchema, type Guide } from '@/schemas/guide';

export const getGuideByUserId = async (userId: string): Promise<Guide> => {
  return new ApiRequest<Guide>(guideSchema).get(`guides/user/${userId}`);
};

export const useGuideByUserId = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['guide-by-user', userId],
    queryFn: () => getGuideByUserId(userId!),
    enabled: !!userId,
  });
};
