import { useEffect, useState, type FormEvent } from 'react'
import { updateOrderTracking } from '../api'
import type { AdminOrder } from '../types'
import { theme } from '../../../styles/theme'

interface OrderTrackingUpdaterProps {
  order: AdminOrder | null
  onTrackingUpdate?: (order: AdminOrder) => void
}

export default function OrderTrackingUpdater({ order, onTrackingUpdate }: OrderTrackingUpdaterProps) {
  const { colors, shadows } = theme
  const [trackingId, setTrackingId] = useState(order?.dtdcTrackingId ?? '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    setTrackingId(order?.dtdcTrackingId ?? '')
    setError(null)
    setSuccess(null)
  }, [order])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!order) {
      return
    }

    const normalizedTrackingId = trackingId.trim()
    const hadTrackingId = !!order.dtdcTrackingId

    try {
      setIsSubmitting(true)
      setError(null)
      setSuccess(null)

      const updatedOrder = await updateOrderTracking(order.id, {
        dtdcTrackingId: normalizedTrackingId || null,
      })
      setTrackingId(updatedOrder.dtdcTrackingId ?? '')

      if (normalizedTrackingId) {
        setSuccess(
          hadTrackingId
            ? 'DTDC tracking ID updated successfully.'
            : 'DTDC tracking ID added successfully.',
        )
      } else if (hadTrackingId) {
        setSuccess('DTDC tracking ID cleared successfully.')
      }

      onTrackingUpdate?.(updatedOrder)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update DTDC tracking ID')
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleClear() {
    setTrackingId('')
    setError(null)
    setSuccess(null)
  }

  if (!order) {
    return (
      <div
        className="rounded-[1.5rem] border p-6"
        style={{
          borderColor: colors.border.DEFAULT,
          backgroundColor: colors.surface.DEFAULT,
          boxShadow: shadows.DEFAULT,
        }}
      >
        <h3 className="text-lg font-semibold" style={{ color: colors.text.primary }}>
          DTDC tracking
        </h3>
        <p className="mt-2 text-sm leading-7" style={{ color: colors.text.secondary }}>
          Select an order from the list to manage its DTDC tracking ID.
        </p>
      </div>
    )
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
      <h3 className="text-lg font-semibold" style={{ color: colors.text.primary }}>
        DTDC tracking
      </h3>
      <p className="mt-2 text-sm leading-7" style={{ color: colors.text.secondary }}>
        Add or update the courier tracking ID for order{' '}
        <span className="font-mono text-xs font-medium" style={{ color: colors.text.primary }}>
          {order.id}
        </span>
        .
      </p>

      <div
        className="mt-4 rounded-[1rem] border px-4 py-3 text-sm"
        style={{
          borderColor: colors.border.DEFAULT,
          backgroundColor: colors.surface.low,
          color: colors.text.secondary,
        }}
      >
        <span className="text-xs font-semibold uppercase tracking-[0.2em]">
          Current tracking ID
        </span>
        <div
          className="mt-1 break-all font-mono text-sm"
          style={{ color: colors.text.primary }}
        >
          {order.dtdcTrackingId || (
            <span className="font-sans italic" style={{ color: colors.text.tertiary }}>
              Not assigned
            </span>
          )}
        </div>
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

      <form onSubmit={handleSubmit} className="mt-6">
        <label className="block text-sm font-medium" style={{ color: colors.text.primary }}>
          DTDC Tracking ID
          <input
            type="text"
            value={trackingId}
            maxLength={50}
            placeholder="e.g. D1234567890"
            onChange={(event) => setTrackingId(event.target.value)}
            className="mt-2 w-full rounded-[1rem] border px-4 py-3 text-sm outline-none transition"
            style={{
              borderColor: colors.border.DEFAULT,
              backgroundColor: colors.surface.low,
              color: colors.text.primary,
              transition: 'all 0.2s',
            }}
            onFocus={(event) => {
              event.currentTarget.style.borderColor = colors.border.focus
            }}
            onBlur={(event) => {
              event.currentTarget.style.borderColor = colors.border.DEFAULT
            }}
          />
        </label>

        <div className="mt-6 flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting || trackingId.trim() === (order.dtdcTrackingId ?? '')}
            className="flex-1 rounded-[1rem] px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              backgroundColor: colors.primary.DEFAULT,
              color: colors.text.inverted,
              transition: 'all 0.2s',
            }}
            onMouseEnter={(event) => {
              if (!event.currentTarget.disabled) {
                event.currentTarget.style.backgroundColor = colors.primary.dark
              }
            }}
            onMouseLeave={(event) => {
              if (!event.currentTarget.disabled) {
                event.currentTarget.style.backgroundColor = colors.primary.DEFAULT
              }
            }}
          >
            {isSubmitting ? 'Updating...' : trackingId.trim() ? 'Update tracking ID' : 'Clear tracking ID'}
          </button>

          {trackingId && (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleClear}
              className="rounded-[1rem] border px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                borderColor: colors.border.DEFAULT,
                backgroundColor: colors.surface.low,
                color: colors.text.secondary,
                transition: 'all 0.2s',
              }}
              onMouseEnter={(event) => {
                if (!event.currentTarget.disabled) {
                  event.currentTarget.style.backgroundColor = colors.surface.DEFAULT
                  event.currentTarget.style.color = colors.text.primary
                }
              }}
              onMouseLeave={(event) => {
                if (!event.currentTarget.disabled) {
                  event.currentTarget.style.backgroundColor = colors.surface.low
                  event.currentTarget.style.color = colors.text.secondary
                }
              }}
            >
              Clear
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
