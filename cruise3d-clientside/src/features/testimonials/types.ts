export interface Testimonial {
  id: string;
  author: string;
  role?: string;
  rating: number;
  content: string;
  status?: 'approved' | 'pending' | 'rejected';
}
