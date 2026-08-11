import axiosClient from '@/api/axiosClient';

import type { Testimonial } from './types';

export interface CreateTestimonialPayload {
  author: string;
  role?: string;
  rating: number;
  content: string;
}

export async function getTestimonials() {
  return axiosClient.get<Testimonial[]>('/testimonials');
}

export async function submitTestimonial(payload: CreateTestimonialPayload) {
  return axiosClient.post<Testimonial>('/testimonials', payload);
}
