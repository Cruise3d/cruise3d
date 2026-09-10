import type { Review } from '../types';

interface ReviewListProps {
  reviews: Review[];
}

function reviewerName(review: Review): string {
  return review.customerName?.trim() || 'Anonymous customer';
}

export function ReviewList({ reviews }: ReviewListProps) {
  if (reviews.length === 0) {
    return <p className="rounded-2xl border border-dashed border-surface-container-highest p-8 text-center text-sm text-on-surface-variant">No reviews yet.</p>;
  }

  return (
    <ul className="space-y-5">
      {reviews.map((review) => (
        <li key={review.id} className="rounded-2xl border border-surface-container-highest bg-surface p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-on-surface">{reviewerName(review)}</p>
              <p className="text-xs text-on-surface-variant">
                {new Date(review.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            </div>
            <span className="text-amber-500" aria-label={`${review.rating} out of 5 stars`}>
              {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
            </span>
          </div>
          {review.comment && <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">{review.comment}</p>}
        </li>
      ))}
    </ul>
  );
}