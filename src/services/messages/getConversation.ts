import { useQuery } from '@tanstack/react-query';
import { ApiRequest } from '@/services/instance';
import {
  conversationDetailSchema,
  type ConversationDetail,
} from '@/schemas/conversation';

export const getConversation = async (
  id: string,
): Promise<ConversationDetail> => {
  return new ApiRequest<ConversationDetail>(conversationDetailSchema).get(
    `conversations/${id}`,
  );
};

export const useConversation = (id: string | undefined) => {
  return useQuery({
    queryKey: ['conversation', id],
    queryFn: () => getConversation(id!),
    enabled: !!id,
    refetchInterval: 5000, 
  });
};
