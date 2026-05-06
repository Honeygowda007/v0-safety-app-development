import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }
  
  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') || '20')
  const offset = parseInt(searchParams.get('offset') || '0')
  const severity = searchParams.get('severity')
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let query = supabase
    .from('activity_logs')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (severity) {
    query = query.eq('severity', severity)
  }

  const { data: activities, error, count } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ activities, total: count })
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
  const { event_type, severity, message, metadata } = body

  if (!event_type || !message) {
    return NextResponse.json({ error: 'event_type and message are required' }, { status: 400 })
  }

  const { data: activity, error } = await supabase
    .from('activity_logs')
    .insert({
      user_id: user.id,
      event_type,
      severity: severity || 'info',
      message,
      metadata
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ activity }, { status: 201 })
}
