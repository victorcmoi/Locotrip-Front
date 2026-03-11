import { useQuery } from '@tanstack/react-query';
import { ApiRequest } from '@/services/instance';
import { notificationSchema, type Notification } from '@/schemas/notification';
import { z } from 'zod';

const notificationListSchema = z.array(notificationSchema);

export const getNotifications = async (userId: string, isNonRead: boolean = false): Promise<Notification[]> => {
  const endpoint = isNonRead ? `notifications/user/${userId}/non-lues` : `notifications/user/${userId}`;
  return new ApiRequest<Notification[]>(notificationListSchema).get(endpoint);
};

export const useNotifications = (userId: string | undefined, isNonRead: boolean = false) => {
  return useQuery({
    queryKey: ['notifications', userId, isNonRead],
    queryFn: () => getNotifications(userId as string, isNonRead),
    enabled: !!userId,
    refetchInterval: 10000, 
  });
};
