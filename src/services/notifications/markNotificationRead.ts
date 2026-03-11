import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiRequest } from "@/services/instance";
import { notificationSchema, type Notification } from "@/schemas/notification";

export const markNotificationRead = async (id: string): Promise<Notification> => {
  return new ApiRequest<Notification>(notificationSchema).patch(
    `notifications/${id}/marquer-lue`,
    {}
  );
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};
