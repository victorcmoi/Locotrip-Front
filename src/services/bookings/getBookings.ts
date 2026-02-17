import { useQuery } from '@tanstack/react-query';
import { ApiRequest } from '@/services/instance';
import { bookingsSchema, type Bookings } from '@/schemas/booking';
import { guideSchema, type Guide } from '@/schemas/guide';

// --- Guide profile (to get guide_id from user_id) ---

export const getGuideProfile = async (userId: string): Promise<Guide> => {
  return new ApiRequest<Guide>(guideSchema).get(`guides/user/${userId}`);
};

export const useGuideProfile = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['guide-profile', userId],
    queryFn: () => getGuideProfile(userId!),
    enabled: !!userId,
  });
};

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
