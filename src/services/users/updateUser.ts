import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiRequest } from '@/services/instance';
import { userApiResponseSchema, type UserApiResponse, type UpdateUser } from '@/schemas/user';

export const updateUser = async (id: string, data: UpdateUser): Promise<UserApiResponse> => {
  return new ApiRequest<UserApiResponse>(userApiResponseSchema).put(`users/${id}`, data);
};

export const useUpdateUser = (id: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateUser) => updateUser(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', id] });
    },
  });
};
