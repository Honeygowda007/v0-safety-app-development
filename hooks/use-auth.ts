'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'

export function useAuth() {
  const router = useRouter()
  const supabase = createClient()

  const { data, error, isLoading, mutate } = useSWR('auth-user', async () => {
    if (!supabase) return null
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  })

  const signOut = async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    mutate(null)
    router.push('/auth/login')
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
