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
      className="group relative flex flex-col justify-between bg-white rounded-2xl p-4 transition-all duration-300 border border-gray-100/80 overflow-hidden hover:scale-[1.02]"
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
        <div className="relative aspect-4/3 w-full rounded-xl bg-slate-50 overflow-hidden mb-4 flex items-center justify-center">
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
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <span
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: colors.primary.DEFAULT }}
            >
              {product.category}
            </span>
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
          </div>

          <h3
            className="text-base font-semibold line-clamp-1 transition-colors"
            style={{ color: colors.text.primary }}
          >
            {product.title}
          </h3>

          {product.subtitle && (
            <p
              className="text-xs line-clamp-1 font-normal"
              style={{ color: colors.text.secondary }}
            >
              {product.subtitle}
              {product.material ? ` • ${product.material}` : ''}
            </p>
          )}
        </div>
      </div>

      {/* Footer / Price & Action */}
      <div
        className="mt-4 pt-3 flex items-center justify-between"
        style={{ borderTop: `1px solid ${colors.border.light}` }}
      >
        <div className="flex items-baseline gap-1.5">
          <span className="text-lg font-bold" style={{ color: colors.text.primary }}>
            ₹{product.price.toFixed(2)}
          </span>
          {product.originalPrice && (
            <span className="text-xs line-through" style={{ color: colors.text.tertiary }}>
              ₹{product.originalPrice.toFixed(2)}
            </span>
          )}
        </div>

        <Button
          variant="primary"
          size="sm"
          icon="add_shopping_cart"
          disabled={!product.inStock}
          onClick={(event) => {
            stopCardNav(event);
            if (onAddToCart) onAddToCart(product);
          }}
          className="rounded-lg shadow-none"
        >
          {product.inStock ? 'Add' : 'Out'}
        </Button>
      </div>
    </Link>
  );
};