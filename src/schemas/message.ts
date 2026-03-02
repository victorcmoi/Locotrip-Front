import { z } from 'zod';
import { userSchema } from './user';

export const conversationSchema = z.object({
    id: z.string().uuid(),
    booking_id: z.string().uuid(),
    created_at: z.string().or(z.date()),
});

export const messageSchema = z.object({
    id: z.string().uuid(),
    conversation_id: z.string().uuid(),
    author_id: z.string().uuid(),
    content: z.string(),
    is_read: z.boolean().default(false),
    sent_at: z.string().or(z.date()),
    author: userSchema.pick({
        id: true,
        first_name: true,
        last_name: true,
    }).optional(),
});

export const conversationDetailMessageSchema = z.object({
  id: z.string().uuid(),
  conversation_id: z.string().uuid(),
  author_id: z.string().uuid(),
  content: z.string(),
  is_read: z.boolean().default(false),
  sent_at: z.string().or(z.date()),
  author: z
    .object({
      id: z.string().uuid(),
      first_name: z.string(),
      last_name: z.string(),
    })
    .optional()
    .nullable(),
});

export const sentMessageSchema = z.object({
  id: z.string().uuid(),
  conversation_id: z.string().uuid(),
  author_id: z.string().uuid(),
  content: z.string(),
  is_read: z.boolean().default(false),
  sent_at: z.string().or(z.date()),
});

export const conversationsSchema = z.array(conversationSchema);
export const messagesSchema = z.array(messageSchema);

export const createMessageSchema = z.object({
    conversation_id: z.string().uuid(),
    content: z.string().min(1, 'Le message ne peut pas être vide').max(2000),
});

export type Conversation = z.infer<typeof conversationSchema>;
export type Conversations = z.infer<typeof conversationsSchema>;
export type Message = z.infer<typeof messageSchema>;
export type Messages = z.infer<typeof messagesSchema>;
export type CreateMessage = z.infer<typeof createMessageSchema>;
export type ConversationMessage = z.infer<typeof conversationDetailMessageSchema>;
export type SentMessage = z.infer<typeof sentMessageSchema>;
