import { useEffect, useState, useCallback } from 'react'
import AdminLayout from '../components/AdminLayout'
import OrderStatusUpdater from '../components/OrderStatusUpdater'
import OrderTrackingUpdater from '../components/OrderTrackingUpdater'
import { fetchAdminOrders } from '../api'
import type { AdminOrder } from '../types'
import { theme } from '../../../styles/theme'

function formatDate(dateString: string) {
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

export default function AdminOrdersPage() {
  const { colors } = theme
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null)

  const loadOrders = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetchAdminOrders()
      setOrders(response.items || [])
      setSelectedOrder((current) => current || response.items?.[0] || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadOrders()
  }, [loadOrders])

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
                    <th className="px-4 py-3">Order</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Total</th>
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
                          className="font-medium"
                          style={{ color: colors.text.primary }}
                        >
                          {order.orderNumber}
                        </div>
                        <div 
                          className="text-xs"
                          style={{ color: colors.text.secondary }}
                        >
                          {formatDate(order.placedAt)}
                        </div>
                      </td>
                      <td 
                        className="px-4 py-3"
                        style={{ color: colors.text.secondary }}
                      >
                        {order.customerName}
                      </td>
                      <td className="px-4 py-3">
                        <span 
                          className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em]"
                          style={{
                            backgroundColor: colors.surface.tint,
                            color: colors.primary.DEFAULT,
                          }}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td 
                        className="px-4 py-3"
                        style={{ color: colors.text.secondary }}
                      >
                        {formatCurrency(order.totalAmount)}
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
          <OrderStatusUpdater order={selectedOrder} onStatusUpdate={handleStatusUpdate} />
          <OrderTrackingUpdater order={selectedOrder} onTrackingUpdate={handleTrackingUpdate} />
        </div>
      </section>
    </AdminLayout>
  )
}
