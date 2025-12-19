import { z } from 'zod';

export const UserRoleEnum = z.enum(['admin', 'guide', 'client']);
export type UserRole = z.infer<typeof UserRoleEnum>;

export const GuideStatusEnum = z.enum(['local', 'pro']);
export type GuideStatus = z.infer<typeof GuideStatusEnum>;

export const VerificationStatusEnum = z.enum(['pending', 'verified', 'rejected']);
export type VerificationStatus = z.infer<typeof VerificationStatusEnum>;

export const BoostStatusEnum = z.enum(['active', 'expired']);
export type BoostStatus = z.infer<typeof BoostStatusEnum>;

export const AvailabilityStatusEnum = z.enum(['available', 'unavailable', 'blocked']);
export type AvailabilityStatus = z.infer<typeof AvailabilityStatusEnum>;

export const DocumentTypeEnum = z.enum(['CV', 'diploma', 'proof_of_residence']);
export type DocumentType = z.infer<typeof DocumentTypeEnum>;

export const MediaTypeEnum = z.enum(['photo', 'video', 'document', 'audio']);
export type MediaType = z.infer<typeof MediaTypeEnum>;

export const PaymentStatusEnum = z.enum(['pending', 'completed', 'refunded']);
export type PaymentStatus = z.infer<typeof PaymentStatusEnum>;

export const DisputeStatusEnum = z.enum(['open', 'pending', 'resolved', 'rejected']);
export type DisputeStatus = z.infer<typeof DisputeStatusEnum>;

export const SubscriptionTypeEnum = z.enum(['loco_plus', 'standard']);
export type SubscriptionType = z.infer<typeof SubscriptionTypeEnum>;

export const SupportTicketStatusEnum = z.enum(['open', 'in_progress', 'closed']);
export type SupportTicketStatus = z.infer<typeof SupportTicketStatusEnum>;

export const NotificationTypeEnum = z.enum(['booking_reminder', 'new_message']);
export type NotificationType = z.infer<typeof NotificationTypeEnum>;
