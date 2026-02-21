import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiRequest } from '@/services/instance';
import { experienceSchema, type Experience, type CreateExperience } from '@/schemas/experience';


export const createExperience = async (data: CreateExperience) => {
  const payload = { ...data, price: String(data.price) };
  return new ApiRequest<Experience>(experienceSchema).post('experiences', payload);
};

export const useCreateExperience = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateExperience) => createExperience(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiences'] });
    },
  });
};
