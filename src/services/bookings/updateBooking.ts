import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiRequest } from '@/services/instance';
import { bookingSchema, type Booking } from '@/schemas/booking';

interface UpdateBookingPayload {
  id: string;
  data: {
    status: string;
  };
}

export const updateBooking = async ({ id, data }: UpdateBookingPayload): Promise<Booking> => {
  return new ApiRequest<Booking>(bookingSchema).put(
    `bookings/${id}`,
    data
  );
};

export const useUpdateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guide-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
    },
  });
};
