'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type AuthResult = {
  success: boolean
  error?: string
}

/**
 * Signs up a new user with auto-confirmation (no email verification required).
 * Uses the admin client to create the user with email_confirm: true.
 */
export async function signUpWithAutoConfirm(
  email: string,
  password: string,
  fullName?: string
): Promise<AuthResult> {
  try {
    const adminClient = createAdminClient()

    // Create user with admin client - this auto-confirms them
    const { data: adminData, error: adminError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: fullName || null,
      },
    })

    if (adminError) {
      // Check for common errors
      if (adminError.message.includes('already registered')) {
        return { success: false, error: 'An account with this email already exists' }
      }
      return { success: false, error: adminError.message }
    }

    if (!adminData.user) {
      return { success: false, error: 'Failed to create user' }
    }

    // Now sign in the user with the regular client to create a session
    const supabase = await createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      return { success: false, error: signInError.message }
    }

    revalidatePath('/', 'layout')
    return { success: true }
  } catch (error) {
    console.error('[v0] signUpWithAutoConfirm error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    }
  }
}

/**
 * Signs in a user with email and password.
 */
export async function signIn(email: string, password: string): Promise<AuthResult> {
  try {
    const supabase = await createClient()
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/', 'layout')
    return { success: true }
  } catch (error) {
    console.error('[v0] signIn error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    }
  }
}

/**
 * Signs out the current user.
 */
export async function signOut(): Promise<AuthResult> {
  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/', 'layout')
    return { success: true }
  } catch (error) {
    console.error('[v0] signOut error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    }
  }
}
