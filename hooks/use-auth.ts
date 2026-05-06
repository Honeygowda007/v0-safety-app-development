'use client'

import { signOut as serverSignOut } from '@/app/auth/actions'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'

export function useAuth() {
  const router = useRouter()
  const supabase = createClient()

  const { data, error, isLoading, mutate } = useSWR('auth-user', async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  })

  const signOut = async () => {
    await serverSignOut()
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
