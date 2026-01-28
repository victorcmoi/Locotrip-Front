import { z } from 'zod';
import { BookingStatusEnum } from './enums';

export const bookingSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  experience_id: z.string().uuid(),
  booking_date: z.string().or(z.date()),
  status: BookingStatusEnum,
  number_of_participants: z.number().int().positive(),
  total_price: z.number(),
  user: z.object({
    id: z.string().uuid(),
    first_name: z.string(),
    last_name: z.string(),
    email: z.string().email(),
  }).optional(),
  experience: z.object({
    id: z.string().uuid(),
    title: z.string(),
    price: z.number(),
    duration: z.number(),
  }).optional(),
});

export const bookingsSchema = z.array(bookingSchema);

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

export type Booking = z.infer<typeof bookingSchema>;
export type Bookings = z.infer<typeof bookingsSchema>;
export type CreateBooking = z.infer<typeof createBookingSchema>;
export type UpdateBooking = z.infer<typeof updateBookingSchema>;
