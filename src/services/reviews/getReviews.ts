
import { useQuery } from '@tanstack/react-query';
import { ApiRequest } from '@/services/instance';
import { ReviewsApiResponse, reviewsApiResponseSchema,  } from '@/schemas/reviews';

export const getReviews = async () => {
  return new ApiRequest<ReviewsApiResponse>(reviewsApiResponseSchema).get('reviews');
};

export const getTopRatedReviews = async () => {
  return new ApiRequest<ReviewsApiResponse>(reviewsApiResponseSchema).get('reviews/top-reviews?limit=3&minDescriptionLength=40');
};

export const getReviewsByExperience = async (experienceId: string) => {
  return new ApiRequest<ReviewsApiResponse>(reviewsApiResponseSchema).get(`reviews/experience/${experienceId}`);
};

export const useReviews = () => {
  return useQuery({
    queryKey: ['reviews'],
    queryFn: () => getReviews(),
  });
};

export const useTopRatedReviews = () => {
  return useQuery({
    queryKey: ['topRatedReviews'],
    queryFn: () => getTopRatedReviews(),
  });
};

export const useReviewsByExperience = (experienceId: string) => {
  return useQuery({
    queryKey: ['reviews', 'experience', experienceId],
    queryFn: () => getReviewsByExperience(experienceId),
    enabled: !!experienceId,
  });
};
