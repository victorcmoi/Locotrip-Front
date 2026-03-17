import { z } from "zod";

export const NotificationTypeEnum = z.enum(["new_message", "booking_reminder", "new_review"]);

export const notificationSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  type: NotificationTypeEnum,
  content: z.string(),
  read: z.boolean(),
  sent_at: z.string(),
});

export type NotificationType = z.infer<typeof NotificationTypeEnum>;
export type Notification = z.infer<typeof notificationSchema>;
