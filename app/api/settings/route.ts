import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }
  
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
  
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  
  // Filter allowed fields
  const allowedFields = [
    'voice_detection_enabled',
    'keyword_detection_enabled',
    'auto_recording_enabled',
    'shake_sos_enabled',
    'sms_alerts_enabled',
    'call_alerts_enabled',
    'location_sharing_enabled',
    'offline_mode_enabled',
    'detection_sensitivity',
    'keywords'
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
    event_type: 'settings_changed',
    severity: 'info',
    message: 'Updated safety settings',
    metadata: { changed_fields: Object.keys(updateData).filter(k => k !== 'updated_at') }
  })

  return NextResponse.json({ settings })
}
