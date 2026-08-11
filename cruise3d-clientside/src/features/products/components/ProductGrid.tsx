import React from 'react';
import type { Product } from '../types';
import { ProductCard } from './ProductCard';
import { Spinner } from '../../../components/ui/Spinner';
import { Button } from '../../../components/ui/Button';

export interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  onAddToCart?: (product: Product) => void;
  onClearFilters?: () => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  isLoading = false,
  onAddToCart,
  onClearFilters,
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 w-full">
        <Spinner size="xl" variant="primary" />
        <p className="mt-4 text-sm font-medium text-gray-500">Loading precision engineered products...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 bg-white rounded-2xl border border-gray-100 shadow-xs text-center">
        <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-4">
          <span className="material-symbols-outlined text-[2rem]">search_off</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900">No products match your criteria</h3>
        <p className="mt-1 text-sm text-gray-500 max-w-md">
          Try adjusting your material filters, search terms, or price range to explore our additive collection.
        </p>
        {onClearFilters && (
          <Button variant="outline" size="sm" onClick={onClearFilters} className="mt-6">
            Reset Filters
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
};
