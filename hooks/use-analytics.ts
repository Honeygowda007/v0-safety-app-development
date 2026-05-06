'use client'

import useSWR from 'swr'

interface AnalyticsData {
  totalMonitoringHours: number
  alertsThisWeek: number
  safetyScore: number
  averageResponseTime: number
  locationsVisited: number
  trendsUp: boolean
  weeklyData: Array<{
    day: string
    hours: number
    alerts: number
  }>
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function useAnalytics() {
  const { data, error, isLoading, mutate } = useSWR<AnalyticsData>(
    '/api/analytics',
    fetcher,
    { refreshInterval: 60000 } // Refresh every minute
  )

  return {
    analytics: data,
    isLoading,
    error,
    refresh: mutate
  }
}
