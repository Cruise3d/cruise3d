import { useEffect, useState, useCallback } from 'react'
import AdminLayout from '../components/AdminLayout'
import LowStockTable from '../components/LowStockTable'
import StatsCard from '../components/StatsCard'
import { fetchDashboardStats } from '../api'
import type { DashboardStats, LowStockProduct } from '../types'
import { theme } from '../../../styles/theme'

export default function AdminDashboardPage() {
  const { colors } = theme
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadDashboardData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await fetchDashboardStats()
      setStats(data)
      setLowStockProducts(data.lowStockProducts || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadDashboardData()
  }, [loadDashboardData])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <AdminLayout
      title="Dashboard"
      description="Monitor revenue, order volume, customer activity, and stock health from one place."
    >
      {error ? (
        <div 
          className="rounded-[1rem] border p-4"
          style={{
            borderColor: colors.status.error.DEFAULT,
            backgroundColor: colors.status.error.light,
            color: colors.status.error.text,
          }}
        >
          {error}
          <button
            onClick={() => void loadDashboardData()}
            className="ml-2 underline"
            style={{ color: colors.primary.DEFAULT }}
          >
            Try again
          </button>
        </div>
      ) : (
        <>
          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <StatsCard
              title="Products"
              value={isLoading ? '...' : String(stats?.totalProducts || 0)}
              detail="Total products in catalog"
              accent="bg-primary-container/10 text-primary"
            />
            <StatsCard
              title="Orders"
              value={isLoading ? '...' : String(stats?.totalOrders || 0)}
              detail="Total orders received"
              accent="bg-tertiary-container/10 text-tertiary"
            />
            <StatsCard
              title="Customers"
              value={isLoading ? '...' : String(stats?.totalCustomers || 0)}
              detail="Registered customers"
              accent="bg-secondary-container/70 text-secondary"
            />
            <StatsCard
              title="Revenue"
              value={isLoading ? '...' : formatCurrency(stats?.totalRevenue || 0)}
              detail="Total revenue"
              accent="bg-error-container/70 text-error"
            />
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <LowStockTable products={lowStockProducts} />

            <div 
              className="rounded-[1.5rem] border p-6"
              style={{
                borderColor: colors.border.DEFAULT,
                backgroundColor: colors.surface.DEFAULT,
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
              }}
            >
              <h3 
                className="text-lg font-semibold"
                style={{ color: colors.text.primary }}
              >
                Quick actions
              </h3>
              <div className="mt-6 space-y-3 text-sm">
                <div 
                  className="rounded-[1rem] p-4"
                  style={{
                    backgroundColor: colors.surface.low,
                    color: colors.text.secondary,
                  }}
                >
                  Publish a featured product to the home page.
                </div>
                <div 
                  className="rounded-[1rem] p-4"
                  style={{
                    backgroundColor: colors.surface.low,
                    color: colors.text.secondary,
                  }}
                >
                  Review new testimonials before they go live.
                </div>
                <div 
                  className="rounded-[1rem] p-4"
                  style={{
                    backgroundColor: colors.surface.low,
                    color: colors.text.secondary,
                  }}
                >
                  Assign the next batch of printing jobs.
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </AdminLayout>
  )
}