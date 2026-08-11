export interface Category {
  id: string;
  name: string;
  slug: string;
  sortOrder?: number;
  productCount?: number;
  isActive?: boolean;
}
