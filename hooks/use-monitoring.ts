'use client'

import useSWR from 'swr'
import type { MonitoringSession } from '@/lib/types/database'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function useMonitoring() {
  const { data, error, isLoading, mutate } = useSWR<{ session: MonitoringSession | null }>(
    '/api/monitoring',
    fetcher,
    { refreshInterval: 30000 } // Poll every 30 seconds
  )

  const startMonitoring = async () => {
    const res = await fetch('/api/monitoring', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'start' })
    })
    const result = await res.json()
    if (!res.ok) throw new Error(result.error)
    mutate()
    return result.session
  }

  const stopMonitoring = async () => {
    const res = await fetch('/api/monitoring', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'stop' })
    })
    const result = await res.json()
    if (!res.ok) throw new Error(result.error)
    mutate()
    return result.session
  }

  return {
    session: data?.session,
    isMonitoring: data?.session?.status === 'active',
    isLoading,
    error,
    startMonitoring,
    stopMonitoring,
    refresh: mutate
  }
}
