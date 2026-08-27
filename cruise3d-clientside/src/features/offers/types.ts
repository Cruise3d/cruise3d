// src/features/offers/types.ts

export interface Offer {
  id: string;
  message: string;
  startDate: string; // ISO-8601 UTC string
  endDate: string; // ISO-8601 UTC string
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OfferCreatePayload {
  message: string;
  startDate: string;
  endDate: string;
  isActive?: boolean;
}

export interface OfferUpdatePayload {
  message?: string;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}

/**
 * Status derived from the offer's `isActive` flag combined with the
 * current time relative to the configured date window. Used by the admin
 * table to surface a single human-readable label.
 */
export type OfferStatus = 'active' | 'scheduled' | 'expired' | 'disabled';
