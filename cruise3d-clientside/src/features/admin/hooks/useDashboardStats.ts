import { useEffect, useState, useCallback } from 'react'

import { fetchDashboardStats } from '../api'
import type { DashboardStats } from '../types'

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadStats = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await fetchDashboardStats()
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard stats')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadStats()
  }, [loadStats])

  return { stats, isLoading, error, refetch: loadStats }
}
