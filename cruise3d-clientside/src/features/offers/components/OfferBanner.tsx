// src/features/offers/components/OfferBanner.tsx
import { useEffect, useState } from 'react';

import { useActiveOffer } from '../hooks/useActiveOffer';
import { theme } from '../../../styles/theme';

const DISMISSED_OFFER_STORAGE_KEY = 'cruise3d.dismissedOfferId';

/**
 * Storefront announcement bar. Renders nothing while the active offer is
 * loading, when the API reports no active offer, or when the user has
 * dismissed the current offer for this session.
 *
 * The banner sits in normal flow right under the fixed header; the
 * existing `pt-24` on MainLayout's `<main>` continues to clear the
 * header. We add a small extra spacer so the page content doesn't
 * sit flush against the banner.
 */
export default function OfferBanner() {
  const { offer, isLoading } = useActiveOffer();
  const [dismissedId, setDismissedId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      return window.sessionStorage.getItem(DISMISSED_OFFER_STORAGE_KEY);
    } catch {
      return null;
    }
  });

  // Re-read dismissal state if the user opens a second tab or the
  // session storage is updated externally.
  useEffect(() => {
    function readDismissed() {
      try {
        setDismissedId(window.sessionStorage.getItem(DISMISSED_OFFER_STORAGE_KEY));
      } catch {
        // Ignore storage access errors (e.g. SSR or strict privacy modes).
      }
    }
    window.addEventListener('storage', readDismissed);
    return () => window.removeEventListener('storage', readDismissed);
  }, []);

  if (isLoading || !offer) return null;
  if (dismissedId === offer.id) return null;

  function handleDismiss() {
    try {
      window.sessionStorage.setItem(DISMISSED_OFFER_STORAGE_KEY, offer!.id);
    } catch {
      // Even if storage isn't available, hide the banner for this render.
    }
    setDismissedId(offer!.id);
  }

  const { colors } = theme;

  return (
    <div
      role="status"
      aria-live="polite"
      className="w-full border-b"
      style={{
        backgroundColor: colors.primary.DEFAULT,
        color: colors.text.inverted,
        borderColor: colors.primary.dark,
      }}
    >
      <div className="mx-auto flex max-w-[1280px] items-center justify-center gap-3 px-6 py-2 text-center text-sm font-medium">
        <span
          className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: colors.primary.dark }}
          aria-hidden="true"
        >
          <span className="material-symbols-outlined text-[0.95rem] leading-none">
            local_offer
          </span>
        </span>
        <span className="truncate">{offer.message}</span>
        <button
          type="button"
          onClick={handleDismiss}
          className="ml-2 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-opacity hover:opacity-80"
          aria-label="Dismiss offer banner"
          style={{ color: colors.text.inverted }}
        >
          <span className="material-symbols-outlined text-[0.95rem] leading-none">
            close
          </span>
        </button>
      </div>
    </div>
  );
}
