'use client'

import useSWR from 'swr'
import type { ActivityLog } from '@/lib/types/database'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function useActivity(limit = 20) {
  const { data, error, isLoading, mutate } = useSWR<{ activities: ActivityLog[], total: number }>(
    `/api/activity?limit=${limit}`,
    fetcher,
    { refreshInterval: 10000 } // Poll every 10 seconds
  )

  const logActivity = async (activity: {
    event_type: string
    severity?: string
    message: string
    metadata?: Record<string, unknown>
  }) => {
    const res = await fetch('/api/activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(activity)
    })
    const result = await res.json()
    if (!res.ok) throw new Error(result.error)
    mutate()
    return result.activity
  }

  return {
    activities: data?.activities || [],
    total: data?.total || 0,
    isLoading,
    error,
    logActivity,
    refresh: mutate
  }
}
