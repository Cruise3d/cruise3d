import { useState, useMemo, useEffect } from 'react';
import type { Product, ProductFilterState } from '../types';
import { getProducts } from '../api';
import { ProductGrid } from '../components/ProductGrid';
import { ProductFilters } from '../components/ProductFilters';
import { Input } from '../../../components/ui/Input';
import { Pagination } from '../../../components/ui/Pagination';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { theme } from '../../../styles/theme';
import { useCartStore } from '../../cart/useCartStore';

function uniqueSorted(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) =>
    a.localeCompare(b)
  );
}

export default function ProductListPage() {
  const { colors, shadows } = theme;
  const addItem = useCartStore((state) => state.addItem);

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    getProducts()
      .then((list) => {
        if (cancelled) return;
        setProducts(list);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(
          err instanceof Error ? err.message : 'Failed to load products.'
        );
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const categories = useMemo(() => ['All', ...uniqueSorted(products.map((p) => p.category))], [products]);
  const materials = useMemo(() => uniqueSorted(products.map((p) => p.material)), [products]);
  const technologies = useMemo(() => uniqueSorted(products.map((p) => p.technology)), [products]);

  // Filter state
  const [filters, setFilters] = useState<ProductFilterState>({
    search: '',
    category: 'All',
    materials: [],
    technologies: [],
    minPrice: 0,
    maxPrice: 10000,
    sortBy: 'featured',
    inStockOnly: false,
  });

  // UI state
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [cartSuccessMessage, setCartSuccessMessage] = useState<string | null>(null);

  const ITEMS_PER_PAGE = 6;

  const handleResetFilters = () => {
    setFilters({
      search: '',
      category: 'All',
      materials: [],
      technologies: [],
      minPrice: 0,
      maxPrice: 10000,
      sortBy: 'featured',
      inStockOnly: false,
    });
    setCurrentPage(1);
  };

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      // Search
      if (
        filters.search &&
        !prod.title.toLowerCase().includes(filters.search.toLowerCase()) &&
        !prod.subtitle.toLowerCase().includes(filters.search.toLowerCase()) &&
        !prod.material.toLowerCase().includes(filters.search.toLowerCase())
      ) {
        return false;
      }

      // Category
      if (filters.category !== 'All' && prod.category !== filters.category) {
        return false;
      }

      // Materials
      if (
        filters.materials.length > 0 &&
        !filters.materials.includes(prod.material)
      ) {
        return false;
      }

      // Technologies
      if (
        filters.technologies.length > 0 &&
        !filters.technologies.includes(prod.technology)
      ) {
        return false;
      }

      // Price range
      if (prod.price < filters.minPrice || prod.price > filters.maxPrice) {
        return false;
      }

      // In stock
      if (filters.inStockOnly && !prod.inStock) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'price-low') return a.price - b.price;
      if (filters.sortBy === 'price-high') return b.price - a.price;
      if (filters.sortBy === 'rating') return b.rating - a.rating;
      if (filters.sortBy === 'newest') return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
      return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    });
  }, [products, filters]);

  // Paginated subset
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const displayedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const handleAddToCart = async (product: Product) => {
    try {
      await addItem(product, 1, product.material);
      setCartSuccessMessage(`Added "${product.title}" to your cart.`);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to add item to cart.';
      setCartSuccessMessage(message);
    }
    setTimeout(() => setCartSuccessMessage(null), 3000);
  };

  return (
    <div 
      className="min-h-screen"
      style={{ 
        backgroundColor: colors.background.page // Now using the theme's warm cream
      }}
    >
      {/* Toast Notification */}
      {cartSuccessMessage && (
        <div 
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-2xl animate-fade-in text-sm"
          style={{
            backgroundColor: colors.primary.DEFAULT,
            color: colors.text.inverted,
          }}
        >
          <span 
            className="material-symbols-outlined text-base"
            style={{ color: colors.status.success.DEFAULT }}
          >
            check_circle
          </span>
          <span>{cartSuccessMessage}</span>
        </div>
      )}

      {/* Kinetic Precision Hero Banner Section */}
      <section 
        className="relative overflow-hidden border-b py-20 px-6"
        style={{
          backgroundColor: colors.surface.DEFAULT,
          borderColor: colors.border.DEFAULT,
        }}
      >
        <div 
          className="hero-gradient absolute inset-0 opacity-80 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${colors.surface.tint} 0%, ${colors.background.DEFAULT} 70%)`,
          }}
        />
        <div className="relative mx-auto max-w-[1280px] text-center space-y-6">
          <div 
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em]"
            style={{
              backgroundColor: colors.surface.low,
              color: colors.text.primary,
            }}
          >
            <span className="material-symbols-outlined text-sm">precision_manufacturing</span>
            Additive Catalog
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight">
            <span style={{ color: colors.text.primary }}>Precision Products, </span>
            <span className="block sm:inline" style={{ color: colors.primary.DEFAULT }}>
              Micron Resolution
            </span>
          </h1>
          <p 
            className="max-w-2xl mx-auto text-base sm:text-lg font-normal leading-relaxed"
            style={{ color: colors.text.secondary }}
          >
            Explore our curated catalog of titanium components, carbon lattice structures, and optical resin artifacts engineered for surgical performance.
          </p>
        </div>
      </section>

      {/* Main Catalog Container */}
      <section className="mx-auto max-w-[1280px] px-6 py-12 space-y-8">
        {/* Top Control Bar */}
        <div 
          className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl border"
          style={{
            backgroundColor: colors.surface.DEFAULT,
            borderColor: colors.border.DEFAULT,
            boxShadow: shadows.DEFAULT,
          }}
        >
          {/* Search Input */}
          <div className="w-full md:max-w-xs">
            <Input
              placeholder="Search by title, material..."
              icon="search"
              value={filters.search}
              onChange={(e) => {
                setFilters({ ...filters, search: e.target.value });
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Controls Right */}
          <div className="flex flex-wrap items-center justify-between md:justify-end gap-3 w-full md:w-auto">
            {/* Mobile Filter Trigger */}
            <Button
              variant="outline"
              size="sm"
              icon="tune"
              onClick={() => setIsFilterModalOpen(true)}
              className="md:hidden"
            >
              Filter
            </Button>

            <span 
              className="text-xs font-medium"
              style={{ color: colors.text.secondary }}
            >
              Showing <span className="font-bold" style={{ color: colors.text.primary }}>{filteredProducts.length}</span> items
            </span>

            {/* Sort Selection */}
            <div className="flex items-center gap-2">
              <label 
                htmlFor="sortBySelect" 
                className="text-xs font-medium whitespace-nowrap"
                style={{ color: colors.text.secondary }}
              >
                Sort by:
              </label>
              <select
                id="sortBySelect"
                value={filters.sortBy}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as ProductFilterState['sortBy'] })}
                className="px-3 py-1.5 text-xs font-medium rounded-lg outline-none cursor-pointer border"
                style={{
                  backgroundColor: colors.surface.low,
                  borderColor: colors.border.DEFAULT,
                  color: colors.text.primary,
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = colors.border.focus;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = colors.border.DEFAULT;
                }}
              >
                <option value="featured">Featured First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest Arrivals</option>
              </select>
            </div>
          </div>
        </div>

        {/* Catalog Grid Layout (Sidebar + Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Desktop Filter Sidebar */}
          <div className="hidden md:block md:col-span-1">
            <ProductFilters
              filters={filters}
              categories={categories}
              materials={materials}
              technologies={technologies}
              onFilterChange={(newF) => {
                setFilters(newF);
                setCurrentPage(1);
              }}
              onResetFilters={handleResetFilters}
            />
          </div>

          {/* Product Grid & Pagination Column */}
          <div className="md:col-span-3 space-y-8 flex flex-col justify-between">
            {error ? (
              <div
                className="rounded-2xl border p-8 text-center"
                style={{
                  backgroundColor: colors.surface.DEFAULT,
                  borderColor: colors.border.DEFAULT,
                  color: colors.text.secondary,
                }}
              >
                <p className="text-base font-medium">{error}</p>
                <p className="text-sm mt-2">
                  Please try again in a moment.
                </p>
              </div>
            ) : isLoading ? (
              <div
                className="rounded-2xl border p-12 text-center"
                style={{
                  backgroundColor: colors.surface.DEFAULT,
                  borderColor: colors.border.DEFAULT,
                  color: colors.text.secondary,
                }}
              >
                <p className="text-base font-medium">Loading products…</p>
              </div>
            ) : (
              <ProductGrid
                products={displayedProducts}
                onAddToCart={handleAddToCart}
                onClearFilters={handleResetFilters}
              />
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div 
                className="pt-6 border-t flex justify-center"
                style={{
                  borderColor: colors.border.DEFAULT,
                }}
              >
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(p) => setCurrentPage(p)}
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Quick View Modal */}
      <Modal
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        size="lg"
        title={selectedProduct?.title}
        footer={
          <>
            <Button variant="ghost" onClick={() => setSelectedProduct(null)}>Close</Button>
            {selectedProduct && (
              <Button
                variant="primary"
                icon="shopping_cart"
                disabled={!selectedProduct.inStock}
                onClick={() => {
                  handleAddToCart(selectedProduct);
                  setSelectedProduct(null);
                }}
              >
                {selectedProduct.inStock ? `Add to Cart - $${selectedProduct.price.toFixed(2)}` : 'Out of Stock'}
              </Button>
            )}
          </>
        }
      >
        {selectedProduct && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
            <div
              className="aspect-square rounded-xl overflow-hidden"
              style={{ backgroundColor: colors.surface.container }}
            >
              <img
                src={selectedProduct.images?.[0] ?? 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80'}
                alt={selectedProduct.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-4">
              <div>
                <span 
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: colors.primary.DEFAULT }}
                >
                  {selectedProduct.category} &bull; {selectedProduct.technology}
                </span>
                <h3 
                  className="text-xl font-bold mt-1"
                  style={{ color: colors.text.primary }}
                >
                  {selectedProduct.title}
                </h3>
                <p 
                  className="text-xs mt-0.5"
                  style={{ color: colors.text.secondary }}
                >
                  {selectedProduct.subtitle}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span 
                  className="text-2xl font-extrabold"
                  style={{ color: colors.text.primary }}
                >
                  ${selectedProduct.price.toFixed(2)}
                </span>
                {selectedProduct.originalPrice && (
                  <span 
                    className="text-sm line-through"
                    style={{ color: colors.text.tertiary }}
                  >
                    ${selectedProduct.originalPrice.toFixed(2)}
                  </span>
                )}
              </div>

              <p 
                className="text-sm leading-relaxed"
                style={{ color: colors.text.secondary }}
              >
                {selectedProduct.description}
              </p>

              {/* Specs Table */}
              {selectedProduct.specs && (
                <div 
                  className="p-3 rounded-lg border space-y-1.5 text-xs"
                  style={{
                    backgroundColor: colors.surface.low,
                    borderColor: colors.border.DEFAULT,
                  }}
                >
                  <h4 
                    className="font-semibold uppercase tracking-wider text-[10px]"
                    style={{ color: colors.text.secondary }}
                  >
                    Specifications
                  </h4>
                  {Object.entries(selectedProduct.specs).map(([key, val]) => (
                    <div 
                      key={key} 
                      className="flex justify-between"
                      style={{ color: colors.text.secondary }}
                    >
                      <span style={{ color: colors.text.tertiary }}>{key}:</span>
                      <span className="font-medium" style={{ color: colors.text.primary }}>{val}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Mobile Filter Modal */}
      <Modal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        size="md"
        title="Filter Products"
      >
        <ProductFilters
          filters={filters}
          categories={categories}
          materials={materials}
          technologies={technologies}
          onFilterChange={(newF) => {
            setFilters(newF);
            setCurrentPage(1);
          }}
          onResetFilters={handleResetFilters}
        />
      </Modal>
    </div>
  );
}