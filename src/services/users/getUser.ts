import { useQuery } from '@tanstack/react-query';
import { ApiRequest } from '@/services/instance';
import { userApiResponseSchema, type UserApiResponse } from '@/schemas/user';

export const getUser = async (id: string): Promise<UserApiResponse> => {
  return new ApiRequest<UserApiResponse>(userApiResponseSchema).get(`users/${id}`);
};

export const useUser = (id: string | undefined) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => getUser(id!),
    enabled: !!id,
  });
};
