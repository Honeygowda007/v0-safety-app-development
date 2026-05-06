import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }
  
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const limit = parseInt(searchParams.get('limit') || '50')
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let query = supabase
    .from('emergency_alerts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (status) {
    query = query.eq('status', status)
  }

  const { data: alerts, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ alerts })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { 
    trigger_type, 
    risk_level, 
    latitude, 
    longitude, 
    location_name,
    audio_evidence_url,
    notes 
  } = body

  const { data: alert, error } = await supabase
    .from('emergency_alerts')
    .insert({
      user_id: user.id,
      status: 'active',
      trigger_type: trigger_type || 'manual',
      risk_level: risk_level || 75,
      latitude,
      longitude,
      location_name,
      audio_evidence_url,
      notes
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Log the alert
  await supabase.from('activity_logs').insert({
    user_id: user.id,
    event_type: 'alert_triggered',
    severity: 'critical',
    message: `Emergency alert triggered via ${trigger_type || 'manual'}`,
    metadata: { alert_id: alert.id, risk_level, location_name }
  })

  // Get trusted contacts to notify
  const { data: contacts } = await supabase
    .from('trusted_contacts')
    .select('*')
    .eq('user_id', user.id)
    .eq('notify_on_alert', true)

  // Log contact notifications
  if (contacts && contacts.length > 0) {
    for (const contact of contacts) {
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        event_type: 'contact_notified',
        severity: 'warning',
        message: `Notifying ${contact.name}`,
        metadata: { contact_id: contact.id, contact_phone: contact.phone }
      })
    }
  }

  return NextResponse.json({ alert, notified_contacts: contacts?.length || 0 }, { status: 201 })
}
