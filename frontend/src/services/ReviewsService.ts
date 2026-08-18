import { IReview, IUserReviewsResult } from "@/types/review";
import { ISession } from "@/types/session";
import { api } from "./axiosInstance";

class ReviewsService {
  async getUserReviews(
    userId: string,
    params?: { take?: number; skip?: number }
  ): Promise<IUserReviewsResult> {
    const res = await api.get(`reviews/user/${userId}`, { params });
    return res.data;
  }

  async getReviewableSessions(): Promise<ISession[]> {
    const res = await api.get("reviews/reviewable-sessions");
    return res.data;
  }

  async submitReview(payload: {
    sessionId: string;
    rating: number;
    comment?: string;
  }): Promise<{ message: string; data: IReview }> {
    const res: { data: IReview; message: string } = await api.post(
      "reviews",
      payload
    );
    return { message: res.message, data: res.data };
  }
}

const reviewsService = new ReviewsService();
export default reviewsService;
