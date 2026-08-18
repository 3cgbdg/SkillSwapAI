import { Review as PrismaReview } from '../src/prisma/prisma-exports.js';

export interface IReviewerSummary {
  id: string;
  name: string | null;
  imageUrl?: string | null;
}

export interface IReviewWithReviewer extends PrismaReview {
  reviewer: IReviewerSummary;
}

export interface IUserReviewsResult {
  averageRating: number | null;
  reviewCount: number;
  reviews: IReviewWithReviewer[];
}

export interface IRatingSummary {
  averageRating: number | null;
  reviewCount: number;
}
