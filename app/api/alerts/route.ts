import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const limit = parseInt(searchParams.get('limit') || '50')
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let query = supabase
    .from('alerts')
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
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { 
    type = 'manual',
    latitude, 
    longitude, 
    address,
    message
  } = body

  const location = latitude && longitude ? { latitude, longitude, address } : null

  const { data: alert, error } = await supabase
    .from('alerts')
    .insert({
      user_id: user.id,
      type,
      status: 'active',
      location,
      message
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Log the alert
  await supabase.from('activity_logs').insert({
    user_id: user.id,
    action: 'alert_triggered',
    description: `Emergency alert triggered: ${type}`,
    metadata: { alert_id: alert.id, location }
  })

  // Get emergency contacts to notify
  const { data: contacts } = await supabase
    .from('emergency_contacts')
    .select('*')
    .eq('user_id', user.id)

  // Log contact notifications
  if (contacts && contacts.length > 0) {
    for (const contact of contacts) {
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        action: 'contact_notified',
        description: `Notifying ${contact.name}`,
        metadata: { contact_id: contact.id, contact_phone: contact.phone }
      })
    }
  }

  return NextResponse.json({ alert, notified_contacts: contacts?.length || 0 }, { status: 201 })
}
