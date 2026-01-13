import { z } from 'zod';

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

export const bookingSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  experience_id: z.string().uuid(),
  booking_date: z.string().or(z.date()),
  status: z.nativeEnum(BookingStatus),
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
  number_of_participants: z.number().int().positive(),
});

export type Booking = z.infer<typeof bookingSchema>;
export type Bookings = z.infer<typeof bookingsSchema>;
export type CreateBooking = z.infer<typeof createBookingSchema>;
