import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ReviewsService from "@/services/ReviewsService";
import { IUserReviewsResult } from "@/types/review";
import { ISession } from "@/types/session";
import { showErrorToast, showSuccessToast } from "@/utils/toast";

export const useUserReviews = (
  userId: string | undefined,
  params?: { take?: number; skip?: number }
) => {
  return useQuery<IUserReviewsResult>({
    queryKey: ["reviews", "user", userId, params],
    queryFn: () => ReviewsService.getUserReviews(userId as string, params),
    enabled: Boolean(userId),
  });
};

export const useReviewableSessions = () => {
  return useQuery<ISession[]>({
    queryKey: ["reviews", "reviewable"],
    queryFn: ReviewsService.getReviewableSessions,
  });
};

export const useSubmitReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ReviewsService.submitReview,
    onSuccess: (data) => {
      showSuccessToast(data.message);
      void queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
    onError: (err: Error) => {
      showErrorToast(err.message);
    },
  });
};
