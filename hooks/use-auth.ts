'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import useSWR from 'swr'

export function useAuth() {
  const router = useRouter()
  const [supabaseClient, setSupabaseClient] = useState<ReturnType<typeof createClient> | null>(null)

  // Initialize Supabase client safely on mount
  useEffect(() => {
    try {
      const client = createClient()
      setSupabaseClient(client)
    } catch (error) {
      console.error('Failed to initialize Supabase client:', error)
    }
  }, [])

  const { data, error, isLoading, mutate } = useSWR(
    supabaseClient ? 'auth-user' : null,
    async () => {
      if (!supabaseClient) return null
      const { data: { user }, error } = await supabaseClient.auth.getUser()
      if (error) throw error
      return user
    }
  )

  // Listen for auth state changes
  useEffect(() => {
    if (!supabaseClient) return

    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          mutate()
        } else if (event === 'SIGNED_OUT') {
          mutate(null)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabaseClient, mutate])

  const signOut = useCallback(async () => {
    if (!supabaseClient) return
    await supabaseClient.auth.signOut()
    mutate(null)
    router.push('/auth/login')
  }, [supabaseClient, mutate, router])

  return {
    user: data,
    isLoading: !supabaseClient || isLoading,
    isAuthenticated: !!data,
    error,
    signOut,
    refresh: mutate
  }
}
