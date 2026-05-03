/**
 * Review Service - API calls for product reviews
 */
import { useAuthStore } from '@store/authStore';
import { apiGet, apiPost, apiDelete } from './api';

const deps = {
  getCartId: () => null,
  logout: () => useAuthStore.getState().logout(),
};

export interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  comment: string | null;
  isVerifiedPurchase: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
  };
}

export interface PaginatedReviews {
  data: Review[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  averageRating: number;
  reviewCount: number;
}

export interface CreateReviewInput {
  rating: number;
  comment?: string;
}

export const reviewService = {
  /**
   * Get reviews for a product (paginated)
   */
  async getProductReviews(
    slug: string,
    params?: { page?: number; limit?: number }
  ): Promise<PaginatedReviews> {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    const qs = query.toString();
    return apiGet<PaginatedReviews>(
      `/api/products/${slug}/reviews${qs ? `?${qs}` : ''}`,
      {},
      deps
    );
  },

  /**
   * Create a review for a product
   */
  async createReview(slug: string, data: CreateReviewInput): Promise<Review> {
    return apiPost<Review>(`/api/products/${slug}/reviews`, data, {}, deps);
  },

  /**
   * Delete a review (own review or admin)
   */
  async deleteReview(reviewId: string): Promise<{ message: string }> {
    return apiDelete<{ message: string }>(`/api/reviews/${reviewId}`, {}, deps);
  },
};
