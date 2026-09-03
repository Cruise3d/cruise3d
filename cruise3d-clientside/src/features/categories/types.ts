export interface Category {
  id: string;
  name: string;
  slug: string;
  iconUrl?: string;
  sortOrder?: number;
  productCount?: number;
  isActive?: boolean;
}

export interface CategoryProduct {
  id: string;
  title: string;
  price: number;
  stock: number;
  categoryName?: string;
  colorType?: string;
  primaryImageUrl?: string;
  averageRating?: number;
  reviewCount?: number;
}

export interface CategoryWithProducts extends Category {
  products: CategoryProduct[];
}
