import { useState } from 'react';
import { Link } from 'react-router-dom';

import type { Product } from '../types';
import { theme } from '../../../styles/theme';
import { Button } from '../../../components/ui/Button';

export interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
}

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80';

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { colors, shadows } = theme;

  const primaryImage = product.images?.[0] ?? FALLBACK_IMAGE;
  const imageSrc = imageError ? FALLBACK_IMAGE : primaryImage;
  const detailPath = `/products/${product.id}`;

  // Stop the parent <Link> from navigating when the user clicks
  // an inline action (wishlist, add to cart).
  const stopCardNav = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <Link
      to={detailPath}
      className="group relative flex h-full flex-col bg-white rounded-2xl p-3.5 transition-all duration-300 border border-gray-100/80 overflow-hidden hover:-translate-y-0.5 sm:p-4"
      style={{
        boxShadow: shadows.DEFAULT,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = shadows.lg;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = shadows.DEFAULT;
      }}
    >
      <div>
        {/* Image Container */}
        <div className="relative aspect-[4/3] w-full rounded-xl bg-slate-50 overflow-hidden mb-3 flex items-center justify-center sm:mb-4">
          <img
            src={imageSrc}
            alt={product.title}
            onError={() => setImageError(true)}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
          />

          {/* Top Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
            {product.isNew && (
              <span
                className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wider backdrop-blur-xs"
                style={{
                  backgroundColor: colors.primary[100],
                  color: colors.primary.dark,
                }}
              >
                New
              </span>
            )}
            {product.technology && (
              <span
                className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wider backdrop-blur-xs"
                style={{
                  backgroundColor: 'rgba(10, 10, 10, 0.85)',
                  color: colors.text.inverted,
                }}
              >
                {product.technology}
              </span>
            )}
          </div>

          {/* Wishlist Button — nested inside the Link, so it must stop
              propagation to avoid navigating when clicked. */}
          <button
            type="button"
            onClick={(event) => {
              stopCardNav(event);
              setIsWishlisted((v) => !v);
            }}
            className="absolute top-3 right-3 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-white/90 shadow-sm cursor-pointer transition-all"
            style={{
              color: isWishlisted ? colors.status.error.DEFAULT : colors.text.secondary,
            }}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            aria-pressed={isWishlisted}
          >
            <span
              className="material-symbols-outlined text-[1.1rem]"
              style={{ fontVariationSettings: isWishlisted ? "'FILL' 1" : "'FILL' 0" }}
            >
              favorite
            </span>
          </button>
        </div>

        {/* Product Details */}
        <div className="space-y-2">
          <div
            className="flex items-center gap-1 text-xs font-medium"
            style={{ color: colors.status.warning.DEFAULT }}
          >
            <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              star
            </span>
            <span style={{ color: colors.text.primary }}>{product.rating.toFixed(1)}</span>
            <span style={{ color: colors.text.tertiary }}>({product.reviewCount})</span>
          </div>

          <div className="flex items-start justify-between gap-2">
            <h3
              className="min-w-0 text-sm font-semibold leading-5 line-clamp-2 transition-colors sm:text-base"
              style={{ color: colors.text.primary }}
            >
              {product.title}
            </h3>
            <span className="shrink-0 text-sm font-bold sm:text-base" style={{ color: colors.text.primary }}>
              ₹{product.price.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Keep the cart action at the bottom of every card. */}
      <div className="mt-4">
        <Button
          variant="primary"
          size="md"
          disabled={!product.inStock}
          onClick={(event) => {
            stopCardNav(event);
            if (onAddToCart) onAddToCart(product);
          }}
          className="w-full rounded-xl px-2 py-2.5 text-[11px] font-bold uppercase tracking-[0.08em] shadow-none sm:text-xs"
        >
          {product.inStock ? 'Add to cart' : 'Out of stock'}
        </Button>
      </div>
    </Link>
  );
};