import type { Product } from './types';

/**
 * Shape of the product as returned by the backend's `/products` endpoint.
 * Mirrors `AdminProduct` from the admin feature but narrowed to the fields
 * the public storefront needs. We keep this type local to the normalizer
 * so the rest of the storefront can continue to use the simpler `Product`
 * shape.
 */
interface BackendProduct {
  id: string;
  title: string;
  description?: string;
  price: number;
  stock?: number;
  isInStock?: boolean;
  categoryName?: string;
  categoryId?: string;
  material?: string;
  isFeatured?: boolean;
  isBestseller?: boolean;
  isActive?: boolean;
  primaryImageUrl?: string;
  images?: Array<{
    id?: string;
    url: string;
    isPrimary?: boolean;
    sortOrder?: number;
    productColorId?: string;
  }>;
  colors?: Array<{
    id?: string;
    colorName?: string;
    colorHex?: string;
    stockOverride?: number;
    sortOrder?: number;
  }>;
  specs?: Array<{
    id?: string;
    specKey: string;
    specValue: string;
    sortOrder?: number;
  }>;
  averageRating?: number;
  reviewCount?: number;
  createdAt?: string;
}

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80';

function extractImageUrls(backend: BackendProduct): string[] {
  const urls: string[] = [];
  for (const img of backend.images ?? []) {
    if (img?.url) urls.push(img.url);
  }
  if (backend.primaryImageUrl && !urls.includes(backend.primaryImageUrl)) {
    urls.unshift(backend.primaryImageUrl);
  }
  if (urls.length === 0) urls.push(DEFAULT_IMAGE);
  return urls;
}

function extractSpecs(backend: BackendProduct): Record<string, string> {
  const out: Record<string, string> = {};
  for (const spec of backend.specs ?? []) {
    if (spec?.specKey) out[spec.specKey] = spec.specValue ?? '';
  }
  return out;
}

function deriveIsNew(backend: BackendProduct): boolean {
  if (!backend.createdAt) return false;
  const created = Date.parse(backend.createdAt);
  if (Number.isNaN(created)) return false;
  return Date.now() - created < 30 * 24 * 60 * 60 * 1000; // < 30 days
}

/**
 * Convert a backend product (e.g. `AdminProduct`) into the simpler
 * `Product` shape used by the customer-facing storefront.
 */
export function normalizeProduct(backend: BackendProduct): Product {
  return {
    id: backend.id,
    title: backend.title,
    subtitle: backend.material ?? '',
    description: backend.description ?? '',
    price: backend.price,
    category: backend.categoryName ?? 'Uncategorized',
    material: backend.material ?? '',
    technology: '',
    rating: backend.averageRating ?? 0,
    reviewCount: backend.reviewCount ?? 0,
    isNew: deriveIsNew(backend),
    isFeatured: backend.isFeatured ?? false,
    inStock: backend.isInStock ?? (backend.stock ?? 0) > 0,
    images: extractImageUrls(backend),
    specs: extractSpecs(backend),
  };
}

/** Normalize a list of backend products. */
export function normalizeProducts(backend: BackendProduct[]): Product[] {
  return backend.map(normalizeProduct);
}