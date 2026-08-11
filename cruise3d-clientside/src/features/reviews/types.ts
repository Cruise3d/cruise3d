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
  customer?: {
    id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  } | null;
}