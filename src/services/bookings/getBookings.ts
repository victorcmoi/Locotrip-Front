import { useQuery } from '@tanstack/react-query';
import { ApiRequest } from '@/services/instance';
import { bookingsSchema, type Bookings } from '@/schemas/booking';
import { z } from 'zod';

const bookingCountSchema = z.object({
  count: z.number().int().nonnegative(),
});

export type BookingCountResponse = z.infer<typeof bookingCountSchema>;

// --- Guide bookings ---

export const getGuideBookings = async (guideId: string): Promise<Bookings> => {
  return new ApiRequest<Bookings>(bookingsSchema).get(
    `bookings/guide/${guideId}`
  );
};

export const useGuideBookings = (guideId: string | undefined) => {
  return useQuery({
    queryKey: ['guide-bookings', guideId],
    queryFn: () => getGuideBookings(guideId!),
    enabled: !!guideId,
  });
};

// --- User bookings (kept for backward compatibility) ---

export const getMyBookings = async (userId: string): Promise<Bookings> => {
  return new ApiRequest<Bookings>(bookingsSchema).get(
    `bookings/user/${userId}`
  );
};

export const useMyBookings = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['my-bookings', userId],
    queryFn: () => getMyBookings(userId!),
    enabled: !!userId,
  });
};

export const getExperienceBookingsCount = async (experienceId: string): Promise<BookingCountResponse> => {
  return new ApiRequest<BookingCountResponse>(bookingCountSchema).get(
    `bookings/experience/${experienceId}/count`
  );
};

export const useExperienceBookingsCount = (experienceId: string | undefined) => {
  return useQuery({
    queryKey: ['experience-bookings-count', experienceId],
    queryFn: () => getExperienceBookingsCount(experienceId!),
    enabled: !!experienceId,
  });
};
