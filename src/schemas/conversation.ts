import { z } from 'zod';
import { userSchema } from './user';
import { messageSchema, conversationDetailMessageSchema } from './message';

export const conversationSchema = z.object({
  id: z.string().uuid(),
  booking_id: z.string().uuid(),
  created_at: z.string().or(z.date()),
});

export const conversationsSchema = z.array(conversationSchema);

// Lightweight conversation list schema (conversations/all)
export const conversationListItemSchema = z.object({
  id: z.string().uuid(),
  booking_id: z.string().uuid(),
  created_at: z.string().or(z.date()),
  booking: z
    .object({
      id: z.string().uuid(),
      number_of_participants: z.number().int().optional(),
      total_price: z.coerce.number().optional(),
      booking_date: z.string().or(z.date()).optional(),
      status: z.string().optional(),
      user: z
        .object({
          id: z.string().uuid(),
          first_name: z.string(),
          last_name: z.string(),
        })
        .optional()
        .nullable(),
      experience: z
        .object({
          id: z.string().uuid(),
          title: z.string(),
          guide: z
            .object({
              id: z.string().uuid(),
              user: z
                .object({
                  id: z.string().uuid(),
                  first_name: z.string(),
                  last_name: z.string(),
                })
                .passthrough()
                .optional()
                .nullable(),
              medias: z.array(z.any()).optional(),
            })
            .passthrough()
            .optional()
            .nullable(),
        })
        .passthrough()
        .optional()
        .nullable(),
    })
    .passthrough()
    .optional()
    .nullable(),
  messages: z.array(messageSchema.pick({
    id: true,
    content: true,
    sent_at: true,
    author_id: true,
    is_read: true,
  })).optional(),
});

export const conversationListSchema = z.array(conversationListItemSchema);
export type ConversationListItem = z.infer<typeof conversationListItemSchema>;
export type ConversationList = z.infer<typeof conversationListSchema>;


// Full conversation schema including messages and booking details
export const conversationDetailSchema = z.object({
  id: z.string().uuid(),
  booking_id: z.string().uuid(),
  created_at: z.string().or(z.date()),
  booking: z
    .object({
      id: z.string().uuid(),
      number_of_participants: z.number().int().optional(),
      total_price: z.coerce.number().optional(),
      booking_date: z.string().or(z.date()).optional(),
      status: z.string().optional(),
      user: z
        .object({
          id: z.string().uuid(),
          first_name: z.string(),
          last_name: z.string(),
        })
        .optional()
        .nullable(),
      experience: z
        .object({
          id: z.string().uuid(),
          title: z.string(),
          guide: z
            .object({
              id: z.string().uuid(),
              user: z
                .object({
                  id: z.string().uuid(),
                  first_name: z.string(),
                  last_name: z.string(),
                })
                .optional()
                .nullable(),
            })
            .optional()
            .nullable(),
        })
        .optional()
        .nullable(),
    })
    .optional()
    .nullable(),
  messages: z.array(conversationDetailMessageSchema),
});

export type Conversation = z.infer<typeof conversationSchema>;
export type Conversations = z.infer<typeof conversationsSchema>;
export type ConversationDetail = z.infer<typeof conversationDetailSchema>;
