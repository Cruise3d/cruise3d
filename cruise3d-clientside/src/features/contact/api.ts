import axiosClient from '@/api/axiosClient';

import type { ContactMessage, ContactMessagePayload } from './types';

export async function submitContactMessage(payload: ContactMessagePayload) {
  return axiosClient.post<ContactMessage>('/contact/messages', payload);
}
