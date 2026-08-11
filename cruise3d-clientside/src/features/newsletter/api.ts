import axiosClient from '@/api/axiosClient';

import type { Subscriber } from './types';

export interface NewsletterSubscribePayload {
  email: string;
}

export async function subscribe(payload: NewsletterSubscribePayload) {
  return axiosClient.post<Subscriber>('/newsletter', payload);
}
