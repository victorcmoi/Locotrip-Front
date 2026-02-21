import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiRequest } from '@/services/instance';
import { experienceSchema, type Experience } from '@/schemas/experience';

export const publishExperience = async (id: string) => {
  return new ApiRequest<Experience>(experienceSchema).patch(`experiences/${id}/publish`, {});
};

export const unpublishExperience = async (id: string) => {
  return new ApiRequest<Experience>(experienceSchema).patch(`experiences/${id}/unpublish`, {});
};

export const usePublishExperience = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => publishExperience(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiences'] });
      queryClient.invalidateQueries({ queryKey: ['experience'] });
    },
  });
};

export const useUnpublishExperience = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => unpublishExperience(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiences'] });
      queryClient.invalidateQueries({ queryKey: ['experience'] });
    },
  });
};
