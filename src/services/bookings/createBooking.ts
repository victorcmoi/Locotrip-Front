import { useMutation } from '@tanstack/react-query';
import { ApiRequest } from '@/services/instance';
import { bookingSchema, type Booking } from '@/schemas/booking';

export interface CreateBookingPayload {
  user_id: string;
  experience_id: string;
  booking_date: string;
  number_of_participants: number;
  total_price: number;
}

export const createBooking = async (payload: CreateBookingPayload): Promise<Booking> => {
  return new ApiRequest<Booking>(bookingSchema).post('bookings', payload);
};

export const useCreateBooking = () => {
  return useMutation({
    mutationFn: createBooking,
  });
};
