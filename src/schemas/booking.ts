import { z } from 'zod';
import { BookingStatusEnum, PaymentStatusEnum } from './enums';

// --- Nested schemas for booking relations ---

export const bookingUserSchema = z.object({
  id: z.string().uuid(),
  first_name: z.string(),
  last_name: z.string(),
  email: z.string().email(),
  phone: z.string().nullish(),
});

export const bookingCitySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  country: z.string().optional(),
  slug: z.string().optional(),
});

export const bookingGuideUserSchema = z.object({
  id: z.string().uuid(),
  first_name: z.string(),
  last_name: z.string(),
  email: z.string().email().optional(),
});

export const bookingGuideSchema = z.object({
  id: z.string().uuid(),
  user: bookingGuideUserSchema,
});

export const bookingMediaSchema = z.object({
  id: z.string().uuid(),
  url: z.string(),
  media_type: z.string(),
  description: z.string().nullish(),
});

export const bookingExperienceSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  price: z.coerce.number(),
  duration: z.number(),
  city_id: z.string().uuid().optional(),
  guide_id: z.string().uuid().optional(),
  city: bookingCitySchema.optional().nullable(),
  guide: bookingGuideSchema.optional().nullable(),
  medias: z.array(bookingMediaSchema).optional(),
});

export const bookingPaymentSchema = z.object({
  id: z.string().uuid(),
  booking_id: z.string().uuid(),
  amount: z.coerce.number(),
  currency: z.string().optional(),
  payment_date: z.string().or(z.date()).optional(),
  method: z.string().optional(),
  status: PaymentStatusEnum.optional(),
});

// --- Main booking schema ---

export const bookingSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  experience_id: z.string().uuid(),
  booking_date: z.string().or(z.date()),
  status: BookingStatusEnum,
  number_of_participants: z.number().int(),
  total_price: z.coerce.number(),
  created_at: z.string().or(z.date()).optional(),
  updated_at: z.string().or(z.date()).optional(),
  user: bookingUserSchema.optional().nullable(),
  experience: bookingExperienceSchema.optional().nullable(),
  payments: z.array(bookingPaymentSchema).optional(),
}).passthrough();

export const bookingsSchema = z.array(bookingSchema);

// --- Create / Update DTOs ---

export const createBookingSchema = z.object({
  experience_id: z.string().uuid(),
  booking_date: z.string().or(z.date()),
  number_of_participants: z.number().int().positive().min(1, 'Au moins 1 participant requis'),
});

export const updateBookingSchema = z.object({
  booking_date: z.string().or(z.date()).optional(),
  number_of_participants: z.number().int().positive().optional(),
  status: BookingStatusEnum.optional(),
});

// --- Types ---

export type Booking = z.infer<typeof bookingSchema>;
export type Bookings = z.infer<typeof bookingsSchema>;
export type BookingUser = z.infer<typeof bookingUserSchema>;
export type BookingExperience = z.infer<typeof bookingExperienceSchema>;
export type BookingPayment = z.infer<typeof bookingPaymentSchema>;
export type CreateBooking = z.infer<typeof createBookingSchema>;
export type UpdateBooking = z.infer<typeof updateBookingSchema>;
