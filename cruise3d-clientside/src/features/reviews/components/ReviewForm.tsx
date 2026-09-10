import { useState } from 'react';

import { Button } from '../../../components/ui/Button';
import type { Order } from '../../orders/types';
import { useSubmitReview } from '../hooks/useSubmitReview';

interface ReviewFormProps {
  productId: string;
  orders: Order[];
  isLoadingOrders: boolean;
  isAuthenticated: boolean;
  onSubmitted: () => Promise<void>;
}

export function ReviewForm({
  productId,
  orders,
  isLoadingOrders,
  isAuthenticated,
  onSubmitted,
}: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [orderId, setOrderId] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { submitReview, isSubmitting, error, statusCode, reset } = useSubmitReview();

  const eligibleOrders = orders.filter(
    (order) =>
      order.status.toLowerCase() === 'delivered' &&
      order.items.some((item) => item.productId === productId)
  );

  if (!isAuthenticated) {
    return (
      <div className="rounded-2xl border border-surface-container-highest bg-surface-container-low p-5 text-sm text-on-surface-variant">
        Sign in as a customer to review this product.
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-700">
        Your review was submitted successfully.
      </div>
    );
  }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting || !orderId || rating < 1) return;

    reset();
    const review = await submitReview({
      productId,
      orderId,
      rating,
      comment: comment.trim() || undefined,
    });

    if (review) {
      setSubmitted(true);
      setRating(0);
      setComment('');
      setOrderId('');
      await onSubmitted();
    }
  };

  return (
    <form onSubmit={submit} className="rounded-2xl border border-surface-container-highest bg-surface-container-low p-5 space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-on-surface">Write a review</h3>
        <p className="mt-1 text-sm text-on-surface-variant">
          Reviews are available after a delivered order.
        </p>
      </div>

      {isLoadingOrders ? (
        <p className="text-sm text-on-surface-variant">Checking your delivered orders…</p>
      ) : eligibleOrders.length === 0 ? (
        <p className="text-sm text-on-surface-variant">
          You need a delivered order containing this product to submit a review.
        </p>
      ) : (
        <>
          <label className="block text-sm font-medium text-on-surface">
            Order
            <select
              value={orderId}
              onChange={(event) => setOrderId(event.target.value)}
              required
              disabled={isSubmitting}
              className="mt-1 w-full rounded-lg border border-surface-container-highest bg-surface px-3 py-2 text-sm text-on-surface"
            >
              <option value="">Select a delivered order</option>
              {eligibleOrders.map((order) => (
                <option key={order.id} value={order.id}>
                  #{order.orderNumber || order.id}
                </option>
              ))}
            </select>
          </label>

          <fieldset>
            <legend className="text-sm font-medium text-on-surface">Rating</legend>
            <div className="mt-1 flex gap-1" aria-label="Rating">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  disabled={isSubmitting}
                  aria-label={`${value} star${value === 1 ? '' : 's'}`}
                  aria-pressed={rating === value}
                  className="cursor-pointer text-2xl text-amber-500 disabled:cursor-not-allowed"
                >
                  {value <= rating ? '★' : '☆'}
                </button>
              ))}
            </div>
          </fieldset>

          <label className="block text-sm font-medium text-on-surface">
            Comment
            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              disabled={isSubmitting}
              rows={4}
              maxLength={2000}
              className="mt-1 w-full rounded-lg border border-surface-container-highest bg-surface px-3 py-2 text-sm text-on-surface"
              placeholder="Share your experience (optional)"
            />
          </label>

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {statusCode === 401 || statusCode === 403
                ? 'You are not authorized to submit a review.'
                : error}
            </p>
          )}

          <Button type="submit" isLoading={isSubmitting} disabled={!orderId || rating < 1}>
            Submit review
          </Button>
        </>
      )}
    </form>
  );
}