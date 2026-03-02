import { useQuery } from '@tanstack/react-query';
import { ApiRequest } from '@/services/instance';
import {
  conversationListSchema,
  type ConversationList,
  type ConversationListItem,
} from '@/schemas/conversation';

export const getConversations = async (): Promise<ConversationList> => {
  return new ApiRequest<ConversationList>(conversationListSchema).get(
    'conversations',
  );
};

export const useConversations = () => {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: getConversations,
    refetchInterval: 5000, 
  });
};

export type { ConversationListItem };
