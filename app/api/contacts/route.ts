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

  const { data: contacts, error } = await supabase
    .from('trusted_contacts')
    .select('*')
    .eq('user_id', user.id)
    .order('is_primary', { ascending: false })
    .order('created_at', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ contacts })
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
  const { name, phone, email, relationship, is_primary, notify_on_alert, auto_call } = body

  if (!name || !phone) {
    return NextResponse.json({ error: 'Name and phone are required' }, { status: 400 })
  }

  // If this contact is primary, unset other primary contacts
  if (is_primary) {
    await supabase
      .from('trusted_contacts')
      .update({ is_primary: false })
      .eq('user_id', user.id)
  }

  const { data: contact, error } = await supabase
    .from('trusted_contacts')
    .insert({
      user_id: user.id,
      name,
      phone,
      email: email || null,
      relationship: relationship || null,
      is_primary: is_primary || false,
      notify_on_alert: notify_on_alert ?? true,
      auto_call: auto_call || false
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Log activity
  await supabase.from('activity_logs').insert({
    user_id: user.id,
    event_type: 'system',
    severity: 'info',
    message: `Added trusted contact: ${name}`,
    metadata: { contact_id: contact.id }
  })

  return NextResponse.json({ contact }, { status: 201 })
}
