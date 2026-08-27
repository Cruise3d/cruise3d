// src/features/offers/offerStatus.ts
import type { Offer, OfferStatus } from './types';

/**
 * Derive a human-readable status from an offer's `isActive` flag and its
 * scheduled date window. The backend already filters to a single active
 * offer for the public endpoint; on the admin side we want to surface the
 * full lifecycle (scheduled → active → expired, plus a manual "disabled"
 * state via `isActive === false`).
 */
export function getOfferStatus(offer: Offer, now: Date = new Date()): OfferStatus {
  if (!offer.isActive) {
    return 'disabled';
  }

  const start = new Date(offer.startDate).getTime();
  const end = new Date(offer.endDate).getTime();
  const current = now.getTime();

  if (current < start) {
    return 'scheduled';
  }
  if (current > end) {
    return 'expired';
  }
  return 'active';
}

export const OFFER_STATUS_LABEL: Record<OfferStatus, string> = {
  active: 'Active',
  scheduled: 'Scheduled',
  expired: 'Expired',
  disabled: 'Disabled',
};
