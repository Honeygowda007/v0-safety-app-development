'use client'

import useSWR from 'swr'
import type { TrustedContact } from '@/lib/types/database'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function useContacts() {
  const { data, error, isLoading, mutate } = useSWR<{ contacts: TrustedContact[] }>(
    '/api/contacts',
    fetcher
  )

  const addContact = async (contact: { name: string; phone: string; relationship?: string; is_primary?: boolean }) => {
    const res = await fetch('/api/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contact)
    })
    const result = await res.json()
    if (!res.ok) throw new Error(result.error)
    mutate()
    return result.contact
  }

  const updateContact = async (id: string, updates: Partial<TrustedContact>) => {
    const res = await fetch(`/api/contacts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    })
    const result = await res.json()
    if (!res.ok) throw new Error(result.error)
    mutate()
    return result.contact
  }

  const deleteContact = async (id: string) => {
    const res = await fetch(`/api/contacts/${id}`, {
      method: 'DELETE'
    })
    if (!res.ok) {
      const result = await res.json()
      throw new Error(result.error)
    }
    mutate()
  }

  return {
    contacts: data?.contacts || [],
    isLoading,
    error,
    addContact,
    updateContact,
    deleteContact,
    refresh: mutate
  }
}
