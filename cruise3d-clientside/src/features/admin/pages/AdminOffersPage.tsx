// src/features/admin/pages/AdminOffersPage.tsx
import { useEffect, useState, useCallback } from 'react';
import AdminLayout from '../components/AdminLayout';
import OfferForm from '../components/OfferForm';
import { getAllOffers, deleteOffer, updateOffer } from '@/features/offers/api';
import { getOfferStatus, OFFER_STATUS_LABEL } from '@/features/offers/offerStatus';
import type { Offer, OfferStatus } from '@/features/offers/types';
import { theme } from '../../../styles/theme';

function formatDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return isoString;
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

const STATUS_BADGE_STYLES: Record<
  OfferStatus,
  { bg: string; text: string; border: string }
> = {
  active: {
    bg: '#dcfce7',
    text: '#15803d',
    border: '#bbf7d0',
  },
  scheduled: {
    bg: '#e0f2fe',
    text: '#0369a1',
    border: '#bae6fd',
  },
  expired: {
    bg: '#f3f4f6',
    text: '#6b7280',
    border: '#e5e7eb',
  },
  disabled: {
    bg: '#fee2e2',
    text: '#b91c1c',
    border: '#fecaca',
  },
};

export default function AdminOffersPage() {
  const { colors } = theme;
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const loadOffers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getAllOffers();
      setOffers(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load offers');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOffers();
  }, [loadOffers]);

  const handleDelete = async (offer: Offer) => {
    if (!confirm(`Are you sure you want to delete this offer?\n\n"${offer.message}"`)) {
      return;
    }

    try {
      setDeletingId(offer.id);
      await deleteOffer(offer.id);
      if (editingOffer?.id === offer.id) {
        setEditingOffer(null);
      }
      await loadOffers();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete offer');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleActive = async (offer: Offer) => {
    try {
      setTogglingId(offer.id);
      await updateOffer(offer.id, { isActive: !offer.isActive });
      await loadOffers();
      if (editingOffer?.id === offer.id) {
        setEditingOffer({ ...editingOffer, isActive: !offer.isActive });
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update offer status');
    } finally {
      setTogglingId(null);
    }
  };

  const handleFormSuccess = () => {
    setEditingOffer(null);
    void loadOffers();
  };

  return (
    <AdminLayout
      title="Offers & Announcements"
      description="Create and manage time-sensitive promotional banners displayed on the storefront."
    >
      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div
          className="overflow-hidden rounded-[1.5rem] border"
          style={{
            borderColor: colors.border.DEFAULT,
            backgroundColor: colors.surface.DEFAULT,
          }}
        >
          <div
            className="flex items-center justify-between border-b px-5 py-4"
            style={{
              borderColor: colors.border.DEFAULT,
              backgroundColor: colors.surface.low,
            }}
          >
            <div className="flex items-center gap-3">
              <h3
                className="text-sm font-semibold uppercase tracking-[0.3em]"
                style={{ color: colors.primary.DEFAULT }}
              >
                Promotional Banners
              </h3>
              <span
                className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                style={{
                  backgroundColor: colors.surface.DEFAULT,
                  color: colors.text.secondary,
                }}
              >
                {offers.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {editingOffer && (
                <button
                  type="button"
                  onClick={() => setEditingOffer(null)}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium transition"
                  style={{
                    backgroundColor: colors.surface.DEFAULT,
                    color: colors.text.primary,
                    borderColor: colors.border.DEFAULT,
                  }}
                >
                  + New Offer
                </button>
              )}
              <button
                type="button"
                onClick={() => void loadOffers()}
                className="text-sm font-medium transition hover:opacity-80"
                style={{ color: colors.primary.DEFAULT }}
              >
                Refresh
              </button>
            </div>
          </div>

          {isLoading ? (
            <div
              className="p-8 text-center"
              style={{ color: colors.text.secondary }}
            >
              Loading offers...
            </div>
          ) : error ? (
            <div
              className="p-8 text-center"
              style={{ color: colors.status.error.DEFAULT }}
            >
              <p>{error}</p>
              <button
                type="button"
                onClick={() => void loadOffers()}
                className="mt-2 text-sm underline"
                style={{ color: colors.primary.DEFAULT }}
              >
                Try again
              </button>
            </div>
          ) : offers.length === 0 ? (
            <div
              className="p-8 text-center"
              style={{ color: colors.text.secondary }}
            >
              No offers found. Create your first banner using the form.
            </div>
          ) : (
            <div
              className="divide-y"
              style={{ borderColor: colors.border.DEFAULT }}
            >
              {offers.map((offer) => {
                const status = getOfferStatus(offer);
                const badge = STATUS_BADGE_STYLES[status];
                const isSelected = editingOffer?.id === offer.id;

                return (
                  <div
                    key={offer.id}
                    className="flex flex-col gap-3 p-5 transition sm:flex-row sm:items-center sm:justify-between"
                    style={{
                      backgroundColor: isSelected
                        ? colors.surface.low
                        : 'transparent',
                    }}
                  >
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider"
                          style={{
                            backgroundColor: badge.bg,
                            color: badge.text,
                            borderColor: badge.border,
                          }}
                        >
                          {OFFER_STATUS_LABEL[status]}
                        </span>
                        <span
                          className="text-xs"
                          style={{ color: colors.text.secondary }}
                        >
                          Created {formatDate(offer.createdAt)}
                        </span>
                      </div>

                      <p
                        className="font-medium text-sm leading-relaxed"
                        style={{ color: colors.text.primary }}
                      >
                        {offer.message}
                      </p>

                      <div
                        className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs"
                        style={{ color: colors.text.secondary }}
                      >
                        <span>
                          <strong className="font-semibold">Start:</strong>{' '}
                          {formatDate(offer.startDate)}
                        </span>
                        <span>
                          <strong className="font-semibold">End:</strong>{' '}
                          {formatDate(offer.endDate)}
                        </span>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => void handleToggleActive(offer)}
                        disabled={togglingId === offer.id}
                        className="rounded-lg border px-2.5 py-1.5 text-xs font-medium transition disabled:opacity-50"
                        style={{
                          borderColor: colors.border.DEFAULT,
                          backgroundColor: offer.isActive
                            ? colors.surface.DEFAULT
                            : colors.surface.low,
                          color: offer.isActive
                            ? colors.status.success.DEFAULT
                            : colors.text.secondary,
                        }}
                        title={offer.isActive ? 'Disable offer' : 'Enable offer'}
                      >
                        {togglingId === offer.id
                          ? '...'
                          : offer.isActive
                            ? 'Enabled'
                            : 'Disabled'}
                      </button>

                      <button
                        type="button"
                        onClick={() => setEditingOffer(offer)}
                        className="rounded-lg border px-3 py-1.5 text-xs font-medium transition"
                        style={{
                          borderColor: colors.border.DEFAULT,
                          backgroundColor: isSelected
                            ? colors.primary.DEFAULT
                            : colors.surface.DEFAULT,
                          color: isSelected
                            ? colors.text.inverted
                            : colors.text.primary,
                        }}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => void handleDelete(offer)}
                        disabled={deletingId === offer.id}
                        className="rounded-lg px-3 py-1.5 text-xs font-medium transition disabled:opacity-50"
                        style={{
                          backgroundColor: colors.status.error.light,
                          color: colors.status.error.DEFAULT,
                        }}
                        onMouseEnter={(e) => {
                          if (!e.currentTarget.disabled) {
                            e.currentTarget.style.backgroundColor =
                              colors.status.error.DEFAULT;
                            e.currentTarget.style.color = colors.text.inverted;
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!e.currentTarget.disabled) {
                            e.currentTarget.style.backgroundColor =
                              colors.status.error.light;
                            e.currentTarget.style.color =
                              colors.status.error.DEFAULT;
                          }
                        }}
                      >
                        {deletingId === offer.id ? '...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {offers.length > 0 && (
            <div
              className="border-t px-5 py-3 text-xs"
              style={{
                borderColor: colors.border.DEFAULT,
                color: colors.text.secondary,
              }}
            >
              Showing {offers.length} promotional offer{offers.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        <OfferForm
          editingOffer={editingOffer}
          onSuccess={handleFormSuccess}
          onCancel={() => setEditingOffer(null)}
        />
      </section>
    </AdminLayout>
  );
}
