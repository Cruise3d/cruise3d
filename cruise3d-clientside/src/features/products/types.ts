export interface Product {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  material: string;
  technology: string;
  rating: number;
  reviewCount: number;
  isNew?: boolean;
  isFeatured?: boolean;
  inStock: boolean;
  images: string[];
  specs?: Record<string, string>;
}

export interface ProductFilterState {
  search: string;
  category: string;
  materials: string[];
  technologies: string[];
  minPrice: number;
  maxPrice: number;
  sortBy: 'featured' | 'price-low' | 'price-high' | 'rating' | 'newest';
  inStockOnly: boolean;
}
