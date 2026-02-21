import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiRequest } from '@/services/instance';
import { experienceSchema, type Experience, type UpdateExperience } from '@/schemas/experience';


export const updateExperience = async (id: string, data: UpdateExperience) => {
  const payload = {
    ...data,
    ...(data.price !== undefined && { price: String(data.price) }),
  };
  return new ApiRequest<Experience>(experienceSchema).put(`experiences/${id}`, payload);
};

export const useUpdateExperience = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateExperience }) => updateExperience(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiences'] });
      queryClient.invalidateQueries({ queryKey: ['experience'] });
    },
  });
};
