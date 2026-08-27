// src/features/admin/components/OfferForm.tsx
import { useEffect, useState, type FormEvent } from 'react';

import { createOffer, updateOffer } from '@/features/offers/api';
import type {
  Offer,
  OfferCreatePayload,
  OfferUpdatePayload,
} from '@/features/offers/types';
import { theme } from '../../../styles/theme';

interface OfferFormProps {
  editingOffer?: Offer | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const MAX_MESSAGE_LENGTH = 1000;

/**
 * Convert a `datetime-local` string ("2026-08-27T14:30") into an ISO-8601
 * UTC string. The picker is timezone-naive; the API doc requires UTC, so
 * we use the local clock and convert with `toISOString()`.
 */
function localDateTimeToIso(value: string): string {
  return new Date(value).toISOString();
}

/**
 * Convert an ISO-8601 UTC string into the `YYYY-MM-DDTHH:mm` value that
 * a `<input type="datetime-local">` expects. We render the time in the
 * viewer's local timezone so the admin sees what they actually entered.
 */
function isoToLocalDateTime(value: string | undefined): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}

export default function OfferForm({
  editingOffer,
  onSuccess,
  onCancel,
}: OfferFormProps) {
  const { colors, shadows } = theme;
  const isEditing = Boolean(editingOffer);

  const [message, setMessage] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Hydrate the form when the parent hands us a new offer to edit.
  useEffect(() => {
    if (editingOffer) {
      setMessage(editingOffer.message);
      setStartDate(isoToLocalDateTime(editingOffer.startDate));
      setEndDate(isoToLocalDateTime(editingOffer.endDate));
      setIsActive(editingOffer.isActive);
      setError(null);
      setSuccess(null);
    } else {
      setMessage('');
      setStartDate('');
      setEndDate('');
      setIsActive(true);
      setError(null);
      setSuccess(null);
    }
  }, [editingOffer]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      setError('Offer message is required.');
      return;
    }
    if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
      setError(`Message must be ${MAX_MESSAGE_LENGTH} characters or fewer.`);
      return;
    }
    if (!startDate || !endDate) {
      setError('Start and end dates are required.');
      return;
    }

    const startMs = new Date(startDate).getTime();
    const endMs = new Date(endDate).getTime();
    if (Number.isNaN(startMs) || Number.isNaN(endMs)) {
      setError('Please provide valid start and end dates.');
      return;
    }
    if (endMs <= startMs) {
      setError('End date must be later than the start date.');
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingOffer) {
        const payload: OfferUpdatePayload = {
          message: trimmedMessage,
          startDate: localDateTimeToIso(startDate),
          endDate: localDateTimeToIso(endDate),
          isActive,
        };
        await updateOffer(editingOffer.id, payload);
        setSuccess('Offer updated successfully.');
      } else {
        const payload: OfferCreatePayload = {
          message: trimmedMessage,
          startDate: localDateTimeToIso(startDate),
          endDate: localDateTimeToIso(endDate),
          isActive,
        };
        await createOffer(payload);
        setSuccess('Offer created successfully.');
        // Clear the message but keep the dates — useful when batching.
        setMessage('');
      }
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save offer.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="rounded-[1.5rem] border p-6"
      style={{
        borderColor: colors.border.DEFAULT,
        backgroundColor: colors.surface.DEFAULT,
        boxShadow: shadows.DEFAULT,
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3
            className="text-lg font-semibold"
            style={{ color: colors.text.primary }}
          >
            {isEditing ? 'Edit offer' : 'New offer'}
          </h3>
          <p
            className="mt-2 text-sm leading-7"
            style={{ color: colors.text.secondary }}
          >
            {isEditing
              ? 'Update the message, schedule, or active state.'
              : 'Schedule a promotional announcement for the storefront banner.'}
          </p>
        </div>
        {isEditing && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg px-3 py-1.5 text-xs font-medium transition"
            style={{
              backgroundColor: colors.surface.low,
              color: colors.text.secondary,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.surface.tint;
              e.currentTarget.style.color = colors.text.primary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = colors.surface.low;
              e.currentTarget.style.color = colors.text.secondary;
            }}
          >
            Cancel
          </button>
        )}
      </div>

      {error && (
        <div
          className="mt-4 rounded-[1rem] border px-4 py-3 text-sm"
          style={{
            borderColor: colors.status.error.DEFAULT,
            backgroundColor: colors.status.error.light,
            color: colors.status.error.text,
          }}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          className="mt-4 rounded-[1rem] border px-4 py-3 text-sm"
          style={{
            borderColor: colors.status.success.DEFAULT,
            backgroundColor: colors.status.success.light,
            color: colors.status.success.text,
          }}
        >
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <label
          className="block text-sm font-medium"
          style={{ color: colors.text.primary }}
        >
          Message *
          <textarea
            className="mt-2 w-full rounded-[1rem] border px-4 py-3 text-sm outline-none transition"
            style={{
              borderColor: colors.border.DEFAULT,
              backgroundColor: colors.surface.low,
              color: colors.text.primary,
              transition: 'all 0.2s',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = colors.border.focus;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = colors.border.DEFAULT;
            }}
            placeholder="Flat 20% off on all 3D printed models — limited time!"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={3}
            maxLength={MAX_MESSAGE_LENGTH}
            required
          />
          <p
            className="mt-1 flex items-center justify-between text-xs"
            style={{ color: colors.text.secondary }}
          >
            <span>Shown in the storefront announcement bar.</span>
            <span>
              {message.length}/{MAX_MESSAGE_LENGTH}
            </span>
          </p>
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label
            className="block text-sm font-medium"
            style={{ color: colors.text.primary }}
          >
            Start date *
            <input
              type="datetime-local"
              className="mt-2 w-full rounded-[1rem] border px-4 py-3 text-sm outline-none transition"
              style={{
                borderColor: colors.border.DEFAULT,
                backgroundColor: colors.surface.low,
                color: colors.text.primary,
                transition: 'all 0.2s',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = colors.border.focus;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = colors.border.DEFAULT;
              }}
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              required
            />
          </label>

          <label
            className="block text-sm font-medium"
            style={{ color: colors.text.primary }}
          >
            End date *
            <input
              type="datetime-local"
              className="mt-2 w-full rounded-[1rem] border px-4 py-3 text-sm outline-none transition"
              style={{
                borderColor: colors.border.DEFAULT,
                backgroundColor: colors.surface.low,
                color: colors.text.primary,
                transition: 'all 0.2s',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = colors.border.focus;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = colors.border.DEFAULT;
              }}
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              required
            />
          </label>
        </div>
        <p
          className="text-xs leading-5"
          style={{ color: colors.text.secondary }}
        >
          Times below are taken in your browser's local timezone and stored as
          UTC. Pick a start time slightly in the past if you want the offer to
          be visible immediately.
        </p>

        <label
          className="flex cursor-pointer items-center gap-3 rounded-[1rem] border px-4 py-3 text-sm font-medium"
          style={{
            borderColor: colors.border.DEFAULT,
            backgroundColor: colors.surface.low,
            color: colors.text.primary,
          }}
        >
          <input
            type="checkbox"
            className="h-4 w-4 cursor-pointer accent-current"
            checked={isActive}
            onChange={(event) => setIsActive(event.target.checked)}
          />
          <span>
            Active
            <span
              className="ml-2 text-xs font-normal"
              style={{ color: colors.text.secondary }}
            >
              When disabled, the offer stays in the database but won't show
              on the storefront even if the date window allows it.
            </span>
          </span>
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-4 w-full rounded-[1rem] px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70"
          style={{
            backgroundColor: colors.primary.DEFAULT,
            color: colors.text.inverted,
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            if (!e.currentTarget.disabled) {
              e.currentTarget.style.backgroundColor = colors.primary.dark;
            }
          }}
          onMouseLeave={(e) => {
            if (!e.currentTarget.disabled) {
              e.currentTarget.style.backgroundColor = colors.primary.DEFAULT;
            }
          }}
        >
          {isSubmitting
            ? isEditing
              ? 'Saving...'
              : 'Creating...'
            : isEditing
              ? 'Save changes'
              : 'Create offer'}
        </button>
      </form>
    </div>
  );
}
