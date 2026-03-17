import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiRequest } from "@/services/instance";
import { reviewApiResponseSchema, ReviewApiResponse } from "@/schemas/reviews";

// Initialize a generic api object to make requests with the proper return schema
const api = new ApiRequest<ReviewApiResponse>(reviewApiResponseSchema);

export interface CreateReviewParams {
  rating: number;
  title: string;
  comment: string;
  user_id: string;
  experience_id: string;
}

export const useCreateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateReviewParams) => {
      const response = await api.post("reviews", data);
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["reviews", variables.experience_id],
      });
      // Also invalidate user bookings to reflect any changes if we add review info there
      queryClient.invalidateQueries({
        queryKey: ["user-bookings"],
      });
    },
  });
};
