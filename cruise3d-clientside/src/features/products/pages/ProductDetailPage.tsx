import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

import { getProductById, getProducts } from '../api';
import { ProductGallery } from '../components/ProductGallery';
import { ProductGrid } from '../components/ProductGrid';
import { Button } from '../../../components/ui/Button';
import { useCartStore } from '../../cart/useCartStore';
import { useProductReviews } from '../../reviews/hooks/useProductReviews';
import type { Review } from '../../reviews/types';
import { theme } from '../../../styles/theme';
import type { Product } from '../types';


const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80';

function formatReviewDate(value: string): string {
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function reviewerName(review: Review): string {
  const first = review.customer?.firstName?.trim();
  const last = review.customer?.lastName?.trim();
  if (first || last) return [first, last].filter(Boolean).join(' ');
  return 'Anonymous customer';
}

function reviewerInitials(review: Review): string {
  const first = review.customer?.firstName?.[0] ?? '';
  const last = review.customer?.lastName?.[0] ?? '';
  const combined = `${first}${last}`.toUpperCase();
  return combined || '?';
}

export default function ProductDetailPage() {
  const { productId } = useParams<{ productId: string }>();
  const addItem = useCartStore((state) => state.addItem);
  const { colors, shadows } = theme;

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Interactive states
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'overview' | 'specs' | 'reviews'>('overview');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  // Reviews
  const reviewsApi = useProductReviews(productId);
  const { reviews: fetchedReviews, isLoading: reviewsLoading, refetch: reviewsRefetch } = reviewsApi;

  useEffect(() => {
    if (!productId) {
      setError('Product not found.');
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    Promise.all([getProductById(productId), getProducts()])
      .then(([fetchedProduct, list]) => {
        if (cancelled) return;
        setProduct(fetchedProduct);
        setRelatedProducts(list.filter((p) => p.id !== fetchedProduct.id).slice(0, 4));
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load product.');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [productId]);

  // Lazy-fetch reviews when the Reviews tab is opened.
  // Use a "loaded once" guard so we don't retrigger fetches repeatedly and
  // cause visual blinking. We also avoid refetching if reviews are already present.
  const [reviewsLoadedOnce, setReviewsLoadedOnce] = useState(false);

  // Reset the "loaded once" flag when the product changes so we attempt to
  // fetch reviews for the new product when its Reviews tab is opened.
  useEffect(() => {
    setReviewsLoadedOnce(false);
  }, [productId]);

  useEffect(() => {
    if (activeTab !== 'reviews') return;
    if (reviewsLoadedOnce) return; // already loaded successfully
    if (fetchedReviews.length > 0) {
      setReviewsLoadedOnce(true);
      return;
    }
    if (reviewsLoading) return; // already fetching

    let mounted = true;
    (async () => {
      try {
        await reviewsRefetch();
        if (mounted) setReviewsLoadedOnce(true);
      } catch (err) {
        // keep reviewsLoadedOnce=false so user can retry manually
      }
    })();

    return () => {
      mounted = false;
    };
  }, [activeTab, fetchedReviews.length, reviewsLoading, reviewsRefetch, reviewsLoadedOnce]);

  if (isLoading) {
    return (
      <div
        className="min-h-screen px-6 py-24 flex items-center justify-center"
        style={{ backgroundColor: colors.background.page }}
      >
        <div className="flex items-center gap-3 text-base font-medium" style={{ color: colors.text.secondary }}>
          <span
            className="inline-block h-2 w-2 rounded-full animate-pulse"
            style={{ backgroundColor: colors.primary.DEFAULT }}
          />
          Loading product…
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div
        className="min-h-screen px-6 py-24 flex flex-col items-center justify-center text-center"
        style={{ backgroundColor: colors.background.page }}
      >
        <h1 className="text-2xl font-bold" style={{ color: colors.text.primary }}>
          Product not found
        </h1>
        <p className="mt-2 text-sm" style={{ color: colors.text.secondary }}>
          {error ?? 'The product you are looking for is no longer available.'}
        </p>
        <Link
          to="/products"
          className="mt-6 inline-flex items-center gap-2 text-sm font-semibold transition-colors"
          style={{ color: colors.primary.DEFAULT }}
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Back to all products
        </Link>
      </div>
    );
  }

  const handleAddToCart = async () => {
    const finishLabel = product.material ?? undefined;
    try {
      await addItem(product, quantity, finishLabel);
      setToastMessage({ kind: 'success', text: `Added ${quantity} × "${product.title}" to cart.` });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add item to cart.';
      setToastMessage({ kind: 'error', text: message });
    }
    setTimeout(() => setToastMessage(null), 3000);
  };

  const tabItems: { key: typeof activeTab; label: string; count?: number }[] = [
    { key: 'overview', label: 'Overview & Process' },
    { key: 'specs', label: 'Specifications' },
    { key: 'reviews', label: 'Reviews', count: product.reviewCount },
  ];

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: colors.background.page }}>
      {/* Toast */}
      {toastMessage && (
        <div
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-2xl animate-fade-in text-sm font-medium"
          style={{
            backgroundColor: colors.surface.DEFAULT,
            color: colors.text.primary,
            border: `1px solid ${colors.border.DEFAULT}`,
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{ color: toastMessage.kind === 'success' ? colors.status.success.DEFAULT : colors.status.error.DEFAULT }}
          >
            {toastMessage.kind === 'success' ? 'check_circle' : 'error'}
          </span>
          <span>{toastMessage.text}</span>
        </div>
      )}

      <div className="mx-auto max-w-[1280px] px-6 py-10 space-y-14">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-medium" style={{ color: colors.text.tertiary }}>
          <Link to="/" className="transition-colors hover:text-[color:var(--crumb-hover)]" style={{ color: colors.text.secondary }}>
            Home
          </Link>
          <span>/</span>
          <Link to="/products" className="transition-colors" style={{ color: colors.text.secondary }}>
            Products
          </Link>
          <span>/</span>
          <span style={{ color: colors.text.tertiary }}>{product.category}</span>
          <span>/</span>
          <span className="font-semibold truncate max-w-xs" style={{ color: colors.text.primary }}>
            {product.title}
          </span>
        </nav>

        {/* Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Gallery */}
          <div className="lg:col-span-7">
            <ProductGallery
              images={product.images.length > 0 ? product.images : [FALLBACK_IMAGE]}
              title={product.title}
              badge={product.technology ?? undefined}
            />
          </div>

          {/* Buy panel */}
          <div
            className="lg:col-span-5 p-8 rounded-3xl space-y-7 self-start lg:sticky lg:top-28"
            style={{
              backgroundColor: colors.surface.DEFAULT,
              border: `1px solid ${colors.border.DEFAULT}`,
              boxShadow: shadows.DEFAULT,
            }}
          >
            {/* Top row: category + rating */}
            <div className="flex items-center justify-between">
              {product.category ? (
                <span
                  className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-[0.18em]"
                  style={{
                    backgroundColor: colors.surface.tint,
                    color: colors.text.primary,
                  }}
                >
                  {product.category}
                </span>
              ) : (
                <div />
              )}

              {typeof product.reviewCount === 'number' && product.reviewCount > 0 ? (
                <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: colors.text.secondary }}>
                  <div className="flex items-center" style={{ color: colors.status.warning.DEFAULT }}>
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        {i < Math.floor(product.rating) ? 'star' : 'star_half'}
                      </span>
                    ))}
                  </div>
                  <span style={{ color: colors.text.primary }}>{product.rating.toFixed(1)}</span>
                  <span style={{ color: colors.text.tertiary }}>({product.reviewCount})</span>
                </div>
              ) : null}
            </div>

            {/* Title block */}
            <div className="space-y-2">
              <h1
                className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight"
                style={{ color: colors.text.primary }}
              >
                {product.title}
              </h1>
              {product.subtitle && (
                <p className="text-sm font-medium" style={{ color: colors.text.secondary }}>
                  {product.subtitle}
                </p>
              )}
            </div>

            {/* Price + stock */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold tracking-tight" style={{ color: colors.text.primary }}>
                ₹{product.price.toFixed(2)}
              </span>
              {product.originalPrice && (
                <span className="text-base line-through" style={{ color: colors.text.tertiary }}>
                  ₹{product.originalPrice.toFixed(2)}
                </span>
              )}
              <span
                className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
                style={
                  product.inStock
                    ? {
                        backgroundColor: colors.status.success.light,
                        color: colors.status.success.text,
                      }
                    : {
                        backgroundColor: colors.status.error.light,
                        color: colors.status.error.text,
                      }
                }
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    backgroundColor: product.inStock ? colors.status.success.DEFAULT : colors.status.error.DEFAULT,
                  }}
                />
                {product.inStock ? 'In stock' : 'Out of stock'}
              </span>
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-sm leading-relaxed" style={{ color: colors.text.secondary }}>
                {product.description}
              </p>
            )}

            {/* Finish (show only when product material exists) */}
            {product.material && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: colors.text.tertiary }}>
                    Finish
                  </span>
                  <span className="text-xs" style={{ color: colors.text.secondary }}>
                    {product.material}
                  </span>
                </div>
              </div>
            )}

            {/* Quantity + actions */}
            <div className="flex items-center gap-3">
              <div
                className="flex items-center rounded-xl p-1"
                style={{ border: `1px solid ${colors.border.DEFAULT}`, backgroundColor: colors.surface.low }}
              >
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors cursor-pointer"
                  style={{ color: colors.text.secondary }}
                  aria-label="Decrease quantity"
                >
                  <span className="material-symbols-outlined text-base">remove</span>
                </button>
                <span
                  className="w-10 text-center font-bold text-sm tabular-nums"
                  style={{ color: colors.text.primary }}
                >
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors cursor-pointer"
                  style={{ color: colors.text.secondary }}
                  aria-label="Increase quantity"
                >
                  <span className="material-symbols-outlined text-base">add</span>
                </button>
              </div>

              <Button
                variant="primary"
                size="lg"
                icon="add_shopping_cart"
                disabled={!product.inStock}
                onClick={handleAddToCart}
                className="flex-1"
              >
                {product.inStock ? 'Add to cart' : 'Unavailable'}
              </Button>

              <button
                type="button"
                onClick={() => setIsWishlisted((v) => !v)}
                className="w-12 h-12 rounded-xl flex items-center justify-center transition-all cursor-pointer"
                style={{
                  border: `1px solid ${isWishlisted ? colors.status.error.DEFAULT : colors.border.DEFAULT}`,
                  backgroundColor: isWishlisted ? colors.status.error.light : colors.surface.DEFAULT,
                  color: isWishlisted ? colors.status.error.DEFAULT : colors.text.secondary,
                }}
                aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <span className="material-symbols-outlined text-[1.25rem]" style={{ fontVariationSettings: isWishlisted ? "'FILL' 1" : "'FILL' 0" }}>
                  favorite
                </span>
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              {[
                { icon: 'local_shipping', label: 'Free express', sub: 'On orders over ₹500' },
                { icon: 'verified', label: 'Micron precision', sub: '±0.05 mm tolerance' },
                { icon: 'lock', label: 'Encrypted', sub: '256-bit SSL checkout' },
              ].map((badge) => (
                <div
                  key={badge.label}
                  className="rounded-2xl p-3 text-center space-y-1"
                  style={{
                    backgroundColor: colors.surface.low,
                    border: `1px solid ${colors.border.light}`,
                  }}
                >
                  <span className="material-symbols-outlined text-[1.3rem]" style={{ color: colors.primary.DEFAULT }}>
                    {badge.icon}
                  </span>
                  <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: colors.text.primary }}>
                    {badge.label}
                  </p>
                  <p className="text-[10px] leading-tight" style={{ color: colors.text.secondary }}>
                    {badge.sub}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <section
          className="rounded-3xl overflow-hidden"
          style={{
            backgroundColor: colors.surface.DEFAULT,
            border: `1px solid ${colors.border.DEFAULT}`,
            boxShadow: shadows.sm,
          }}
        >
          <div
            className="flex overflow-x-auto"
            role="tablist"
            style={{ borderBottom: `1px solid ${colors.border.light}` }}
          >
            {tabItems.map((tab) => {
              const active = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveTab(tab.key)}
                  className="px-7 py-4 text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
                  style={{
                    color: active ? colors.text.primary : colors.text.secondary,
                    borderBottom: `2px solid ${active ? colors.primary.DEFAULT : 'transparent'}`,
                    backgroundColor: active ? colors.surface.DEFAULT : 'transparent',
                  }}
                >
                  {tab.label}
                  {typeof tab.count === 'number' && tab.count > 0 && (
                    <span
                      className="ml-2 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-bold"
                      style={{
                        backgroundColor: active ? colors.primary.DEFAULT : colors.surface.high,
                        color: active ? colors.text.inverted : colors.text.secondary,
                      }}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="p-8">
            {activeTab === 'overview' && <OverviewTab product={product} />}
            {activeTab === 'specs' && <SpecsTab product={product} />}
            {activeTab === 'reviews' && (
              <ReviewsTab
                reviewsApi={reviewsApi}
                averageRating={product.rating}
                reviewCount={product.reviewCount}
              />
            )}
          </div>
        </section>

        {/* Related */}
        {relatedProducts.length > 0 && (
          <section className="space-y-6 pt-2">
            <div className="flex items-end justify-between">
              <div>
                <p
                  className="text-[11px] font-semibold uppercase tracking-[0.24em]"
                  style={{ color: colors.primary.DEFAULT }}
                >
                  More from the catalog
                </p>
                <h2
                  className="mt-2 text-2xl font-bold tracking-tight"
                  style={{ color: colors.text.primary }}
                >
                  You might also like
                </h2>
              </div>
              <Link
                to="/products"
                className="inline-flex items-center gap-1 text-sm font-semibold transition-colors"
                style={{ color: colors.text.secondary }}
              >
                View all
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </Link>
            </div>

            <ProductGrid products={relatedProducts} />
          </section>
        )}
      </div>
    </div>
  );
}

function OverviewTab({ product }: { product: Product }) {
  const { colors } = theme;
  return (
    <div className="space-y-8 max-w-3xl">
      <div className="space-y-3">
        <h3 className="text-lg font-bold" style={{ color: colors.text.primary }}>
          Engineering philosophy
        </h3>
        <p className="text-sm leading-relaxed" style={{ color: colors.text.secondary }}>
          Each piece in our {product.category} collection is designed using generative algorithms that
          optimize internal structural density while removing unneeded mass. Using high-powered lasers
          during the {product.technology || 'additive'} process, atomic particles of {product.material} are
          bonded layer-by-layer.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          {
            title: 'Additive layering',
            body: 'Built in 30-micron vertical increments to eliminate visible stair-stepping.',
          },
          {
            title: 'Post-processing',
            body: 'Hand-finished with glass bead blasting and anti-UV protective sealants.',
          },
        ].map((card) => (
          <div
            key={card.title}
            className="rounded-2xl p-5 space-y-2"
            style={{
              backgroundColor: colors.surface.low,
              border: `1px solid ${colors.border.light}`,
            }}
          >
            <h4
              className="text-xs font-bold uppercase tracking-[0.18em]"
              style={{ color: colors.text.primary }}
            >
              {card.title}
            </h4>
            <p className="text-sm leading-relaxed" style={{ color: colors.text.secondary }}>
              {card.body}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SpecsTab({ product }: { product: Product }) {
  const { colors } = theme;
  const rows: Array<{ label: string; value: string }> = [];
  if (product.technology) rows.push({ label: 'Manufacturing technology', value: product.technology });
  if (product.material) rows.push({ label: 'Primary material', value: product.material });
  if (product.specs) {
    for (const [key, value] of Object.entries(product.specs)) {
      rows.push({ label: key, value });
    }
  }

  if (rows.length === 0) {
    return (
      <p className="text-sm" style={{ color: colors.text.secondary }}>
        Specifications for this product have not been published yet.
      </p>
    );
  }

  return (
    <div className="max-w-2xl">
      <h3 className="text-lg font-bold mb-4" style={{ color: colors.text.primary }}>
        Product metrics
      </h3>
      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: `1px solid ${colors.border.light}` }}
      >
        <div
          className="grid grid-cols-2 px-5 py-3 text-xs font-semibold uppercase tracking-wider"
          style={{ backgroundColor: colors.surface.low, color: colors.text.tertiary }}
        >
          <span>Attribute</span>
          <span>Specification</span>
        </div>
        <div className="divide-y" style={{ borderColor: colors.border.light }}>
          {rows.map((row) => (
            <div
              key={row.label}
              className="grid grid-cols-2 px-5 py-3 text-sm"
              style={{ borderTop: `1px solid ${colors.border.light}` }}
            >
              <span style={{ color: colors.text.secondary }}>{row.label}</span>
              <span className="font-medium" style={{ color: colors.text.primary }}>
                {row.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface ReviewsTabProps {
  reviewsApi: ReturnType<typeof useProductReviews>;
  averageRating: number;
  reviewCount: number;
}

function ReviewsTab({ reviewsApi, averageRating, reviewCount }: ReviewsTabProps) {
  const { colors } = theme;
  const { reviews, isLoading, error, refetch } = reviewsApi;

  return (
    <div className="space-y-8 max-w-3xl">
      <div
        className="flex items-center gap-6 p-6 rounded-2xl"
        style={{ backgroundColor: colors.surface.low, border: `1px solid ${colors.border.light}` }}
      >
        <div className="text-center">
          <div className="text-4xl font-extrabold tabular-nums" style={{ color: colors.text.primary }}>
            {averageRating.toFixed(1)}
          </div>
          <div className="text-xs mt-1" style={{ color: colors.text.tertiary }}>
            out of 5.0
          </div>
        </div>
        <div
          className="flex items-center gap-0.5"
          style={{ color: colors.status.warning.DEFAULT }}
          aria-hidden="true"
        >
          {[...Array(5)].map((_, i) => (
            <span
              key={i}
              className="material-symbols-outlined text-[1.3rem]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {i < Math.floor(averageRating) ? 'star' : 'star_half'}
            </span>
          ))}
        </div>
        <div
          className="flex-1 space-y-1 text-xs pl-6"
          style={{ borderLeft: `1px solid ${colors.border.light}`, color: colors.text.secondary }}
        >
          <p className="font-semibold" style={{ color: colors.text.primary }}>
            {reviewCount} verified review{reviewCount === 1 ? '' : 's'}
          </p>
          <p>Average across all purchases of this product.</p>
        </div>
      </div>

      <div className="min-h-[160px]">
        {/* ✅ Fix: Check loading first */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-2xl p-6 space-y-3 animate-pulse"
                style={{
                  backgroundColor: colors.surface.low,
                  border: `1px solid ${colors.border.light}`,
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gray-200" />
                    <div>
                      <div className="h-4 w-32 bg-gray-200 rounded" />
                      <div className="h-3 w-20 bg-gray-200 rounded mt-1" />
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <div key={star} className="h-4 w-4 bg-gray-200 rounded" />
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-full bg-gray-200 rounded" />
                  <div className="h-3 w-3/4 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && !isLoading && (
          <div
            className="rounded-xl px-4 py-3 text-sm flex items-center justify-between gap-3"
            style={{
              backgroundColor: colors.status.error.light,
              color: colors.status.error.text,
              border: `1px solid ${colors.status.error.DEFAULT}`,
            }}
          >
            <span>Could not load reviews: {error}</span>
            <button
              type="button"
              onClick={() => void refetch()}
              className="text-xs font-semibold underline cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* ✅ Fix: Check if there are reviews before showing empty state */}
        {!isLoading && !error && reviews.length > 0 && (
          <ul className="space-y-5">
            {reviews.map((review) => (
              <li
                key={review.id}
                className="rounded-2xl p-6 space-y-3"
                style={{
                  backgroundColor: colors.surface.DEFAULT,
                  border: `1px solid ${colors.border.light}`,
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-10 w-10 rounded-full flex items-center justify-center font-semibold text-sm"
                      style={{
                        backgroundColor: colors.surface.high,
                        color: colors.text.primary,
                      }}
                    >
                      {reviewerInitials(review)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: colors.text.primary }}>
                        {reviewerName(review)}
                      </p>
                      <p className="text-xs" style={{ color: colors.text.tertiary }}>
                        {formatReviewDate(review.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5" style={{ color: colors.status.warning.DEFAULT }}>
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className="material-symbols-outlined text-[1rem]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        {i < review.rating ? 'star' : 'star_outline'}
                      </span>
                    ))}
                  </div>
                </div>
                {review.comment && (
                  <p className="text-sm leading-relaxed" style={{ color: colors.text.secondary }}>
                    {review.comment}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}

        {/* ✅ Fix: Empty state shown last */}
        {!isLoading && !error && reviews.length === 0 && (
          <div
            className="rounded-2xl p-10 text-center space-y-2"
            style={{
              backgroundColor: colors.surface.low,
              border: `1px dashed ${colors.border.light}`,
            }}
          >
            <span
              className="material-symbols-outlined text-5xl"
              style={{ color: colors.text.tertiary }}
            >
              rate_review
            </span>
            <h3 className="text-base font-semibold" style={{ color: colors.text.primary }}>
              No reviews yet
            </h3>
            <p className="text-sm" style={{ color: colors.text.secondary }}>
              Reviews are available after a customer receives their order.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}