import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiRequest } from '@/services/instance';
import { sentMessageSchema, type SentMessage } from '@/schemas/message';

export interface SendMessagePayload {
  conversation_id: string;
  author_id: string;
  content: string;
}

export const sendMessage = async (
  conversationId: string,
  payload: SendMessagePayload,
): Promise<SentMessage> => {
  return new ApiRequest<SentMessage>(sentMessageSchema).post(
    `conversations/${conversationId}/messages`,
    payload,
  );
};

export const useSendMessage = (conversationId: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SendMessagePayload) =>
      sendMessage(conversationId!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['conversation', conversationId],
      });
      queryClient.invalidateQueries({
        queryKey: ['conversations'],
      });
    },
  });
};
