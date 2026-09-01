import { useEffect, useState, type FormEvent } from 'react'
import { updateOrderStatus } from '../api'
import type { AdminOrder } from '../types'
import { theme } from '../../../styles/theme'

interface OrderStatusUpdaterProps {
  order: AdminOrder | null
  onStatusUpdate?: () => void
}

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'printing', label: 'Printing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
] as const

export default function OrderStatusUpdater({ order, onStatusUpdate }: OrderStatusUpdaterProps) {
  const { colors, shadows } = theme
  const [status, setStatus] = useState<string>(order?.status || 'pending')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    setStatus(order?.status || 'pending')
  }, [order])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!order) {
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)
      setSuccess(null)

      await updateOrderStatus(order.id, { status: status as AdminOrder['status'] })
      setSuccess('Order status updated successfully.')
      onStatusUpdate?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update order status')
    } finally {
      setIsSubmitting(false)
    }
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
        <h3 
          className="text-lg font-semibold"
          style={{ color: colors.text.primary }}
        >
          Update order workflow
        </h3>
        <p 
          className="mt-2 text-sm leading-7"
          style={{ color: colors.text.secondary }}
        >
          Select an order from the list to update its status.
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
      <h3 
        className="text-lg font-semibold"
        style={{ color: colors.text.primary }}
      >
        Update order workflow
      </h3>
      <p 
        className="mt-2 text-sm leading-7"
        style={{ color: colors.text.secondary }}
      >
        Updating status for order{' '}
        <span className="font-mono text-xs font-medium" style={{ color: colors.text.primary }}>
          {order.id}
        </span>
      </p>

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
        <label 
          className="block text-sm font-medium"
          style={{ color: colors.text.primary }}
        >
          Status
          <select
            className="mt-2 w-full rounded-[1rem] border px-4 py-3 text-sm outline-none transition"
            style={{
              borderColor: colors.border.DEFAULT,
              backgroundColor: colors.surface.low,
              color: colors.text.primary,
              transition: 'all 0.2s',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = colors.border.focus
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = colors.border.DEFAULT
            }}
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <button
          type="submit"
          disabled={isSubmitting || status === order.status}
          className="mt-6 w-full rounded-[1rem] px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50"
          style={{
            backgroundColor: colors.primary.DEFAULT,
            color: colors.text.inverted,
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            if (!e.currentTarget.disabled) {
              e.currentTarget.style.backgroundColor = colors.primary.dark
            }
          }}
          onMouseLeave={(e) => {
            if (!e.currentTarget.disabled) {
              e.currentTarget.style.backgroundColor = colors.primary.DEFAULT
            }
          }}
        >
          {isSubmitting ? 'Updating...' : 'Update status'}
        </button>
      </form>
    </div>
  )
}
