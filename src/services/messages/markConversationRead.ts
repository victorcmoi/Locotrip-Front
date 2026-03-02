import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiRequest } from '@/services/instance';
import { z } from 'zod';

export const markConversationRead = async (conversationId: string): Promise<void> => {
  await new ApiRequest(z.any()).patch(`conversations/${conversationId}/read`, {});
};

export const useMarkConversationRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markConversationRead,
    onSuccess: (_, conversationId) => {
      queryClient.invalidateQueries({
        queryKey: ['conversation', conversationId],
      });
      queryClient.invalidateQueries({
        queryKey: ['conversations'],
      });
    },
  });
};
