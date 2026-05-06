import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: settings, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error) {
    // If no settings exist, create default settings
    if (error.code === 'PGRST116') {
      const { data: newSettings, error: createError } = await supabase
        .from('user_settings')
        .insert({ user_id: user.id })
        .select()
        .single()
      
      if (createError) {
        return NextResponse.json({ error: createError.message }, { status: 500 })
      }
      
      return NextResponse.json({ settings: newSettings })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ settings })
}

export async function PUT(request: Request) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  
  // Filter allowed fields
  const allowedFields = [
    'sos_enabled',
    'shake_to_alert',
    'auto_call_enabled',
    'location_sharing',
    'check_in_interval',
    'safe_words',
    'theme',
    'notifications_enabled'
  ]

  const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() }
  
  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updateData[field] = body[field]
    }
  }

  const { data: settings, error } = await supabase
    .from('user_settings')
    .update(updateData)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Log settings change
  await supabase.from('activity_logs').insert({
    user_id: user.id,
    action: 'settings_updated',
    description: 'Updated safety settings',
    metadata: { changed_fields: Object.keys(updateData).filter(k => k !== 'updated_at') }
  })

  return NextResponse.json({ settings })
}
