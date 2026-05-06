'use client'

import useSWR from 'swr'
import type { UserSettings } from '@/lib/types/database'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function useSettings() {
  const { data, error, isLoading, mutate } = useSWR<{ settings: UserSettings }>(
    '/api/settings',
    fetcher
  )

  const updateSettings = async (updates: Partial<UserSettings>) => {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    })
    const result = await res.json()
    if (!res.ok) throw new Error(result.error)
    mutate()
    return result.settings
  }

  return {
    settings: data?.settings,
    isLoading,
    error,
    updateSettings,
    refresh: mutate
  }
}
