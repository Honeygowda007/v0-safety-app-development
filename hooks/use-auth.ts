'use client'

import { createClient } from '@/lib/supabase/client'
import useSWR from 'swr'

export function useAuth() {
  const supabase = createClient()

  const { data, error, isLoading, mutate } = useSWR('auth-user', async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  })

  const signOut = async () => {
    await supabase.auth.signOut()
    mutate(null)
    // Force full page reload to clear all cookies and state
    window.location.href = '/auth/login'
  }

  return {
    user: data,
    isLoading,
    isAuthenticated: !!data,
    error,
    signOut,
    refresh: mutate
  }
}
