export interface IReviewer {
  id: string;
  name: string | null;
  imageUrl?: string | null;
}

export interface IReview {
  id: string;
  sessionId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  reviewer: IReviewer;
}

export interface IUserReviewsResult {
  averageRating: number | null;
  reviewCount: number;
  reviews: IReview[];
}
