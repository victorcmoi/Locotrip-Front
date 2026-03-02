import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiRequest } from "@/services/instance";
import { z } from "zod";

interface CreateDisputeParams {
  bookingId: string;
  data: {
    booking_id: string;
    user_id: string;
    reason: string;
    status: string;
  };
}

const createDispute = async ({ bookingId, data }: CreateDisputeParams) => {
  return new ApiRequest(z.any()).post(`bookings/${bookingId}/disputes`, data);
};

export const useCreateDispute = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createDispute,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["guide-bookings"] });
    },
  });
};
