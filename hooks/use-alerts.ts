'use client'

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

  const triggerAlert = async (alertData: {
    type?: string
    latitude?: number
    longitude?: number
    address?: string
    message?: string
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
  }

  const resolveAlert = async (id: string, status: 'resolved' | 'cancelled', message?: string) => {
    const res = await fetch(`/api/alerts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, message })
    })
    const result = await res.json()
    if (!res.ok) throw new Error(result.error)
    mutate()
    return result.alert
  }

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
