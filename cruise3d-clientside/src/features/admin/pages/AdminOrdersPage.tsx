import { useEffect, useState, useCallback } from 'react'
import AdminLayout from '../components/AdminLayout'
import OrderStatusUpdater from '../components/OrderStatusUpdater'
import { fetchAdminOrders, updateOrderTracking } from '../api'
import type { AdminOrder } from '../types'
import { theme } from '../../../styles/theme'

function formatDate(dateString?: string) {
  if (!dateString) {
    return 'N/A'
  }
  try {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return dateString
  }
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(amount)
}

function formatPaymentStatus(status: AdminOrder['paymentStatus']) {
  switch (status) {
    case 'paid':
      return 'Paid'
    case 'pending':
      return 'Pending'
    case 'failed':
      return 'Failed'
    case 'refunded':
      return 'Refunded'
    case 'unpaid':
    default:
      return 'Unpaid'
  }
}

function formatOrderStatus(status: AdminOrder['status']) {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

function getStatusStyles(status: AdminOrder['status'], colors: typeof theme.colors) {
  switch (status) {
    case 'confirmed':
      return { backgroundColor: colors.surface.tint, color: colors.primary.DEFAULT }
    case 'printing':
      return { backgroundColor: colors.surface.low, color: colors.text.primary }
    case 'shipped':
      return { backgroundColor: colors.surface.tint, color: colors.primary.dark }
    case 'delivered':
      return { backgroundColor: colors.status.success.light, color: colors.status.success.text }
    case 'cancelled':
      return { backgroundColor: colors.status.error.light, color: colors.status.error.text }
    case 'pending':
    default:
      return { backgroundColor: colors.surface.low, color: colors.text.secondary }
  }
}

function getPaymentStyles(status: AdminOrder['paymentStatus'], colors: typeof theme.colors) {
  switch (status) {
    case 'paid':
      return { backgroundColor: colors.status.success.light, color: colors.status.success.text }
    case 'refunded':
      return { backgroundColor: colors.surface.tint, color: colors.primary.dark }
    case 'failed':
      return { backgroundColor: colors.status.error.light, color: colors.status.error.text }
    case 'pending':
      return { backgroundColor: colors.surface.tint, color: colors.primary.DEFAULT }
    case 'unpaid':
    default:
      return { backgroundColor: colors.surface.low, color: colors.text.secondary }
  }
}

export default function AdminOrdersPage() {
  const { colors } = theme
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null)
  const [trackingDraft, setTrackingDraft] = useState('')
  const [isSavingTracking, setIsSavingTracking] = useState(false)
  const [trackingError, setTrackingError] = useState<string | null>(null)
  const [trackingSuccess, setTrackingSuccess] = useState<string | null>(null)
  const [addressCopySuccess, setAddressCopySuccess] = useState<string | null>(null)

  const loadOrders = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetchAdminOrders()
      const nextOrders = response.items || []
      setOrders(nextOrders)
      setSelectedOrder((current) => {
        if (current && nextOrders.some((order) => order.id === current.id)) {
          return current
        }

        return nextOrders[0] || null
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadOrders()
  }, [loadOrders])

  useEffect(() => {
    setTrackingDraft(selectedOrder?.dtdcTrackingId ?? '')
    setTrackingError(null)
    setTrackingSuccess(null)
    setAddressCopySuccess(null)
  }, [selectedOrder])

  const handleOrderSelect = (order: AdminOrder) => {
    setSelectedOrder(order)
  }

  const handleStatusUpdate = () => {
    void loadOrders()
  }

  const handleTrackingUpdate = (updatedOrder: AdminOrder) => {
    setOrders((currentOrders) =>
      currentOrders.map((order) => order.id === updatedOrder.id ? updatedOrder : order),
    )
    setSelectedOrder(updatedOrder)
  }

  const handleSaveTracking = async () => {
    if (!selectedOrder) {
      return
    }

    const normalizedTrackingId = trackingDraft.trim()

    try {
      setIsSavingTracking(true)
      setTrackingError(null)
      setTrackingSuccess(null)

      const updatedOrder = await updateOrderTracking(selectedOrder.id, {
        dtdcTrackingId: normalizedTrackingId || null,
      })

      handleTrackingUpdate(updatedOrder)
      setTrackingDraft(updatedOrder.dtdcTrackingId ?? '')
      setTrackingSuccess('Tracking details saved.')
    } catch (err) {
      setTrackingError(err instanceof Error ? err.message : 'Failed to save tracking details')
    } finally {
      setIsSavingTracking(false)
    }
  }

  const selectedAddress = selectedOrder?.address
  const selectedTrackingId = selectedOrder?.dtdcTrackingId?.trim() || ''
  const selectedAddressLines = selectedAddress
    ? [
        selectedAddress.fullName,
        selectedAddress.addressLine,
        `${selectedAddress.city}, ${selectedAddress.state} ${selectedAddress.pincode}`.trim(),
      ].filter(Boolean)
    : []

  const handleCopyAddress = async () => {
    if (!selectedAddressLines.length) {
      return
    }

    const addressText = selectedAddressLines.join('\n')

    try {
      await navigator.clipboard.writeText(addressText)
      setAddressCopySuccess('Address copied to clipboard.')
    } catch {
      setAddressCopySuccess('Copy unavailable in this browser.')
    }
  }

  return (
    <AdminLayout
      title="Orders"
      description="Track customer orders, shipping progress, and fulfillment handoff."
    >
      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div 
          className="overflow-hidden rounded-[1.5rem] border"
          style={{
            borderColor: colors.border.DEFAULT,
            backgroundColor: colors.surface.DEFAULT,
          }}
        >
          <div 
            className="flex items-center justify-between border-b px-4 py-3"
            style={{
              borderColor: colors.border.DEFAULT,
              backgroundColor: colors.surface.low,
            }}
          >
            <h3 
              className="text-sm font-semibold uppercase tracking-[0.3em]"
              style={{ color: colors.primary.DEFAULT }}
            >
              Fulfillment queue
            </h3>
            <button
              onClick={() => void loadOrders()}
              className="text-sm transition"
              style={{ 
                color: colors.primary.DEFAULT,
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = colors.primary.dark}
              onMouseLeave={(e) => e.currentTarget.style.color = colors.primary.DEFAULT}
            >
              Refresh
            </button>
          </div>

          {isLoading ? (
            <div 
              className="p-8 text-center"
              style={{ color: colors.text.secondary }}
            >
              Loading orders...
            </div>
          ) : error ? (
            <div 
              className="p-8 text-center"
              style={{ color: colors.status.error.DEFAULT }}
            >
              <p>{error}</p>
              <button
                onClick={() => void loadOrders()}
                className="mt-2 text-sm underline"
                style={{ color: colors.primary.DEFAULT }}
              >
                Try again
              </button>
            </div>
          ) : orders.length === 0 ? (
            <div 
              className="p-8 text-center"
              style={{ color: colors.text.secondary }}
            >
              No orders found.
            </div>
          ) : (
            <div className="max-h-[600px] overflow-y-auto">
              <table className="min-w-full text-left text-sm">
                <thead 
                  className="sticky top-0"
                  style={{
                    backgroundColor: colors.surface.low,
                    color: colors.text.secondary,
                  }}
                >
                  <tr>
                    <th className="px-4 py-3">Order ID</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Items</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Payment</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Tracking</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      onClick={() => handleOrderSelect(order)}
                      className={`cursor-pointer border-t transition`}
                      style={{
                        borderColor: colors.border.DEFAULT,
                        backgroundColor: selectedOrder?.id === order.id ? colors.surface.tint : 'transparent',
                      }}
                      onMouseEnter={(e) => {
                        if (selectedOrder?.id !== order.id) {
                          e.currentTarget.style.backgroundColor = colors.surface.low
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedOrder?.id !== order.id) {
                          e.currentTarget.style.backgroundColor = 'transparent'
                        }
                      }}
                    >
                      <td className="px-4 py-3">
                        <div 
                          className="max-w-[180px] truncate font-mono text-xs font-medium"
                          style={{ color: colors.text.primary }}
                          title={order.id}
                        >
                          {order.id}
                        </div>
                      </td>
                      <td 
                        className="px-4 py-3"
                        style={{ color: colors.text.secondary }}
                      >
                        {order.address?.fullName || 'Unknown customer'}
                      </td>
                      <td 
                        className="px-4 py-3"
                        style={{ color: colors.text.secondary }}
                      >
                        {formatDate(order.placedAt)}
                      </td>
                      <td 
                        className="px-4 py-3"
                        style={{ color: colors.text.secondary }}
                      >
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </td>
                      <td 
                        className="px-4 py-3"
                        style={{ color: colors.text.secondary }}
                      >
                        {formatCurrency(order.totalAmount)}
                      </td>
                      <td className="px-4 py-3">
                        <span 
                          className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em]"
                          style={getPaymentStyles(order.paymentStatus, colors)}
                        >
                          {formatPaymentStatus(order.paymentStatus)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span 
                          className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em]"
                          style={getStatusStyles(order.status, colors)}
                        >
                          {formatOrderStatus(order.status)}
                        </span>
                      </td>
                      <td 
                        className="px-4 py-3"
                        style={{ color: colors.text.secondary }}
                      >
                        {order.dtdcTrackingId?.trim() || 'Not assigned'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            handleOrderSelect(order)
                          }}
                          className="rounded-full px-3 py-1 text-xs font-semibold transition"
                          style={{
                            backgroundColor:
                              selectedOrder?.id === order.id ? colors.primary.DEFAULT : colors.surface.low,
                            color:
                              selectedOrder?.id === order.id ? colors.text.inverted : colors.text.primary,
                            border: `1px solid ${colors.border.DEFAULT}`,
                          }}
                        >
                          {selectedOrder?.id === order.id ? 'Selected' : 'View'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {orders.length > 0 && (
            <div 
              className="border-t px-4 py-3 text-sm"
              style={{
                borderColor: colors.border.DEFAULT,
                color: colors.text.secondary,
              }}
            >
              {orders.length} order{orders.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        <div className="space-y-6">
          {selectedOrder ? (
            <section
              className="overflow-hidden rounded-[1.5rem] border"
              style={{
                borderColor: colors.border.DEFAULT,
                backgroundColor: colors.surface.DEFAULT,
              }}
            >
              <div
                className="border-b px-6 py-4"
                style={{
                  borderColor: colors.border.DEFAULT,
                  backgroundColor: colors.surface.low,
                }}
              >
                <h3 className="text-sm font-semibold uppercase tracking-[0.3em]" style={{ color: colors.primary.DEFAULT }}>
                  Order Details
                </h3>
                <p className="mt-1 text-sm" style={{ color: colors.text.secondary }}>
                  Detailed view for the selected order.
                </p>
              </div>

              <div className="space-y-6 p-6">
                <section className="rounded-[1rem] border p-4" style={{ borderColor: colors.border.DEFAULT, backgroundColor: colors.surface.low }}>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em]" style={{ color: colors.text.secondary }}>
                        Order Summary
                      </p>
                      <h4 className="mt-1 text-lg font-bold" style={{ color: colors.text.primary }}>
                        Order ID {selectedOrder.id}
                      </h4>
                      <div className="mt-3 space-y-1 text-sm" style={{ color: colors.text.secondary }}>
                        <p>Placed date: {formatDate(selectedOrder.placedAt)}</p>
                        <p>
                          Current order status:{' '}
                          <span className="font-semibold" style={{ color: colors.text.primary }}>
                            {formatOrderStatus(selectedOrder.status)}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em]" style={getStatusStyles(selectedOrder.status, colors)}>
                        {formatOrderStatus(selectedOrder.status)}
                      </span>
                      <span className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em]" style={getPaymentStyles(selectedOrder.paymentStatus, colors)}>
                        {formatPaymentStatus(selectedOrder.paymentStatus)}
                      </span>
                    </div>
                  </div>
                </section>

                <section className="rounded-[1rem] border p-4" style={{ borderColor: colors.border.DEFAULT, backgroundColor: colors.surface.low }}>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em]" style={{ color: colors.text.secondary }}>
                        Customer & Delivery
                      </p>
                      <h4 className="mt-1 text-base font-semibold" style={{ color: colors.text.primary }}>
                        {selectedAddress?.fullName || 'Unknown customer'}
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => void handleCopyAddress()}
                      className="rounded-full px-3 py-1 text-xs font-semibold transition"
                      style={{ backgroundColor: colors.surface.DEFAULT, color: colors.primary.DEFAULT, border: `1px solid ${colors.border.DEFAULT}` }}
                    >
                      Copy address
                    </button>
                  </div>

                  <div className="mt-4 rounded-[1rem] border p-4" style={{ borderColor: colors.border.DEFAULT, backgroundColor: colors.surface.DEFAULT }}>
                    {selectedAddress ? (
                      <address className="not-italic select-text space-y-1 text-sm" style={{ color: colors.text.primary }}>
                        <p className="font-medium">{selectedAddress.fullName}</p>
                        <p>{selectedAddress.addressLine}</p>
                        <p>
                          {selectedAddress.city}
                          {selectedAddress.city && selectedAddress.state ? ', ' : ''}
                          {selectedAddress.state} {selectedAddress.pincode}
                        </p>
                      </address>
                    ) : (
                      <p className="text-sm" style={{ color: colors.text.secondary }}>
                        No delivery address available.
                      </p>
                    )}
                  </div>

                  {addressCopySuccess && (
                    <p className="mt-3 text-xs font-medium" style={{ color: colors.primary.DEFAULT }}>
                      {addressCopySuccess}
                    </p>
                  )}
                </section>

                <section>
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em]" style={{ color: colors.text.secondary }}>
                      Order Items
                    </p>
                    <span className="text-xs" style={{ color: colors.text.secondary }}>
                      {selectedOrder.items.length} item{selectedOrder.items.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="mt-3 overflow-hidden rounded-[1rem] border" style={{ borderColor: colors.border.DEFAULT }}>
                    {selectedOrder.items.length === 0 ? (
                      <div className="p-4 text-sm" style={{ color: colors.text.secondary }}>
                        No ordered products found for this order.
                      </div>
                    ) : (
                      selectedOrder.items.map((item) => (
                        <div key={item.id} className="flex flex-col gap-4 border-b p-4 last:border-b-0 sm:flex-row sm:items-center" style={{ borderColor: colors.border.DEFAULT, backgroundColor: colors.surface.low }}>
                          <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-[1rem] border" style={{ borderColor: colors.border.DEFAULT, backgroundColor: colors.surface.DEFAULT }}>
                            {item.productImageUrl ? (
                              <img src={item.productImageUrl} alt={item.productTitle} className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-[10px]" style={{ color: colors.text.secondary }}>
                                No image
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-base font-semibold" style={{ color: colors.text.primary }}>
                              {item.productTitle}
                            </p>
                            <div className="mt-2 grid gap-1 text-sm sm:grid-cols-2">
                              <p style={{ color: colors.text.secondary }}>Quantity: <span style={{ color: colors.text.primary }}>{item.quantity}</span></p>
                              <p style={{ color: colors.text.secondary }}>Color: <span style={{ color: colors.text.primary }}>{item.colorName || 'N/A'}</span></p>
                              <p style={{ color: colors.text.secondary }}>Price: <span style={{ color: colors.text.primary }}>{formatCurrency(item.priceAtPurchase)}</span></p>
                              <p style={{ color: colors.text.secondary }}>Item total: <span style={{ color: colors.text.primary }}>{formatCurrency(item.itemTotal)}</span></p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </section>

                <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
                  <div className="rounded-[1rem] border p-4" style={{ borderColor: colors.border.DEFAULT, backgroundColor: colors.surface.low }}>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em]" style={{ color: colors.text.secondary }}>
                      Payment
                    </p>
                    <div className="mt-3 space-y-2 text-sm">
                      <div className="flex items-center justify-between gap-3">
                        <span style={{ color: colors.text.secondary }}>Payment status</span>
                        <span className="font-medium" style={{ color: colors.text.primary }}>{formatPaymentStatus(selectedOrder.paymentStatus)}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span style={{ color: colors.text.secondary }}>Payment ID</span>
                        <span className="break-all text-right font-mono" style={{ color: colors.text.primary }}>{selectedOrder.paymentId || 'Not assigned'}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span style={{ color: colors.text.secondary }}>Amount</span>
                        <span className="font-medium" style={{ color: colors.text.primary }}>{formatCurrency(selectedOrder.totalAmount)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[1rem] border p-4" style={{ borderColor: colors.border.DEFAULT, backgroundColor: colors.surface.low }}>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em]" style={{ color: colors.text.secondary }}>
                      Shipping / Courier
                    </p>
                    <div className="mt-3 space-y-4">
                      <div>
                        <p className="text-sm font-medium" style={{ color: colors.text.secondary }}>
                          Courier: <span className="font-semibold" style={{ color: colors.text.primary }}>DTDC</span>
                        </p>
                        <p className="mt-2 text-sm font-medium" style={{ color: colors.text.secondary }}>
                          Tracking ID / AWB Number
                        </p>
                      </div>
                      <form
                        onSubmit={(event) => {
                          event.preventDefault()
                          void handleSaveTracking()
                        }}
                      >
                        <label className="block text-sm font-medium" style={{ color: colors.text.primary }}>
                          Tracking ID / AWB Number
                          <input
                            type="text"
                            value={trackingDraft}
                            onChange={(event) => setTrackingDraft(event.target.value)}
                            placeholder="Enter tracking ID / AWB number"
                            className="mt-2 w-full rounded-[1rem] border px-4 py-3 text-sm outline-none transition"
                            style={{
                              borderColor: colors.border.DEFAULT,
                              backgroundColor: colors.surface.DEFAULT,
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
                        <div className="mt-4 flex flex-wrap gap-3">
                          <button
                            type="submit"
                            disabled={isSavingTracking || !selectedOrder || trackingDraft.trim() === (selectedOrder.dtdcTrackingId ?? '')}
                            className="inline-flex items-center justify-center rounded-[1rem] px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50"
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
                            {isSavingTracking ? 'Saving...' : 'Save Tracking Details'}
                          </button>
                        </div>
                      </form>

                      <p className="text-sm" style={{ color: colors.text.secondary }}>
                        {selectedTrackingId ? (
                          <>
                            Tracking ID: <span className="font-mono font-medium" style={{ color: colors.text.primary }}>{selectedTrackingId}</span>
                          </>
                        ) : (
                          <>
                            Tracking ID: <span className="font-medium" style={{ color: colors.text.primary }}>Not assigned</span>
                          </>
                        )}
                      </p>

                      {trackingError && (
                        <div className="rounded-[1rem] border px-4 py-3 text-sm" style={{ borderColor: colors.status.error.DEFAULT, backgroundColor: colors.status.error.light, color: colors.status.error.text }}>
                          {trackingError}
                        </div>
                      )}

                      {trackingSuccess && (
                        <div className="rounded-[1rem] border px-4 py-3 text-sm" style={{ borderColor: colors.status.success.DEFAULT, backgroundColor: colors.status.success.light, color: colors.status.success.text }}>
                          {trackingSuccess}
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                <section className="rounded-[1rem] border p-4" style={{ borderColor: colors.border.DEFAULT, backgroundColor: colors.surface.low }}>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span style={{ color: colors.text.secondary }}>Subtotal</span>
                      <span style={{ color: colors.text.primary }}>{formatCurrency(selectedOrder.subtotal)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span style={{ color: colors.text.secondary }}>Shipping charge</span>
                      <span style={{ color: colors.text.primary }}>{formatCurrency(selectedOrder.shippingCharge)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3 text-sm sm:col-span-2">
                      <span className="text-base font-semibold" style={{ color: colors.text.primary }}>Total amount</span>
                      <span className="text-lg font-bold" style={{ color: colors.primary.DEFAULT }}>
                        {formatCurrency(selectedOrder.totalAmount)}
                      </span>
                    </div>
                  </div>
                </section>
              </div>
            </section>
          ) : null}
          <OrderStatusUpdater order={selectedOrder} onStatusUpdate={handleStatusUpdate} />
        </div>
      </section>
    </AdminLayout>
  )
}
