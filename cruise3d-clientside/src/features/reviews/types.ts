/**
 * Shape of a review as returned by the backend's GET /api/reviews/product/{id}.
 * Mirrors the backend `Review` entity plus the joined customer name.
 */
export interface Review {
  id: string;
  productId: string;
  customerId: string;
  orderId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  customerName?: string | null;
}

export interface CreateReviewPayload {
  productId: string;
  orderId: string;
  rating: number;
  comment?: string;
}