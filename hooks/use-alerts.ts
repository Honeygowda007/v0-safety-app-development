'use client'

import { useCallback } from 'react'
import useSWR from 'swr'
import type { EmergencyAlert } from '@/lib/types/database'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function useAlerts(status?: string) {
  const url = status ? `/api/alerts?status=${status}` : '/api/alerts'
  
  const { data, error, isLoading, mutate } = useSWR<{ alerts: EmergencyAlert[] }>(
    url,
    fetcher,
    { refreshInterval: 5000 } // Poll every 5 seconds for active alerts
  )

  const triggerAlert = useCallback(async (alertData: {
    trigger_type?: string
    risk_level?: number
    latitude?: number
    longitude?: number
    location_name?: string
    notes?: string
  }) => {
    const res = await fetch('/api/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(alertData)
    })
    const result = await res.json()
    if (!res.ok) throw new Error(result.error)
    mutate()
    return result
  }, [mutate])

  const resolveAlert = useCallback(async (id: string, status: 'resolved' | 'cancelled' | 'false_alarm', notes?: string) => {
    const res = await fetch(`/api/alerts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, notes })
    })
    const result = await res.json()
    if (!res.ok) throw new Error(result.error)
    mutate()
    return result.alert
  }, [mutate])

  const activeAlert = data?.alerts?.find(a => a.status === 'active')

  return {
    alerts: data?.alerts || [],
    activeAlert,
    isLoading,
    error,
    triggerAlert,
    resolveAlert,
    refresh: mutate
  }
}
