// src/features/offers/components/OfferBanner.tsx
import { useActiveOffer } from '../hooks/useActiveOffer';
import { theme } from '../../../styles/theme';

/**
 * Storefront announcement bar. Renders nothing while the active offer is
 * loading or when the API reports no active offer.
 *
 * The banner is rendered inside the fixed Header above the navbar.
 */
export default function OfferBanner() {
  const { offer, isLoading } = useActiveOffer();

  if (isLoading || !offer) return null;

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
      <div className="mx-auto flex max-w-[1280px] items-center gap-3 px-6 py-2 text-center text-sm font-medium">
        <div className="offer-marquee min-w-0 flex-1 overflow-hidden">
          <div className="offer-marquee__track">
            {[0, 1].map((groupIndex) => (
              <div
                key={groupIndex}
                className="offer-marquee__group"
                aria-hidden={groupIndex === 1}
              >
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((messageIndex) => (
                  <span
                    key={messageIndex}
                    className="offer-marquee__item"
                    aria-hidden={messageIndex > 0}
                  >
                    <span
                      className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                      style={{ backgroundColor: colors.primary.dark }}
                      aria-hidden="true"
                    >
                      <span className="material-symbols-outlined text-[0.95rem] leading-none">
                        local_offer
                      </span>
                    </span>
                    <span>{offer.message}</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
