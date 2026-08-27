// src/features/offers/api.ts
import axiosClient from '@/api/axiosClient';

import type { Offer, OfferCreatePayload, OfferUpdatePayload } from './types';

/**
 * Public storefront endpoint. Returns the offer whose `isActive` flag is
 * true and whose date window contains the current time, or `null` if the
 * backend reports that no offer is currently active.
 *
 * The backend responds with `200 OK` and `data: null` when no offer is
 * active, so the storefront banner can render nothing cleanly.
 */
export async function getActiveOffer(): Promise<Offer | null> {
  return axiosClient.get<Offer | null>('/offers/active');
}

// Admin endpoints
export async function getAllOffers() {
  return axiosClient.get<Offer[]>('/offers');
}

export async function getOfferById(id: string) {
  return axiosClient.get<Offer>(`/offers/${id}`);
}

export async function createOffer(payload: OfferCreatePayload) {
  return axiosClient.post<Offer>('/offers', payload);
}

export async function updateOffer(id: string, payload: OfferUpdatePayload) {
  return axiosClient.put<Offer>(`/offers/${id}`, payload);
}

export async function deleteOffer(id: string) {
  return axiosClient.delete<string>(`/offers/${id}`);
}
