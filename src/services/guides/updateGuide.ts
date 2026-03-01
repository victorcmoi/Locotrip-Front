import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiRequest } from '@/services/instance';
import { guideSchema, type Guide, type UpdateGuide } from '@/schemas/guide';

export const updateGuide = async (id: string, data: UpdateGuide): Promise<Guide> => {
  return new ApiRequest<Guide>(guideSchema).put(`guides/${id}`, data);
};

export const useUpdateGuide = (guideId: string | undefined, userId: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateGuide) => updateGuide(guideId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guide-by-user', userId] });
    },
  });
};
