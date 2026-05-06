import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get active session
  const { data: activeSession, error } = await supabase
    .from('monitoring_sessions')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ session: activeSession })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { action } = body

  if (action === 'start') {
    // End any existing active sessions
    await supabase
      .from('monitoring_sessions')
      .update({ 
        status: 'ended', 
        ended_at: new Date().toISOString() 
      })
      .eq('user_id', user.id)
      .eq('status', 'active')

    // Start new session
    const { data: session, error } = await supabase
      .from('monitoring_sessions')
      .insert({
        user_id: user.id,
        status: 'active'
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Log activity
    await supabase.from('activity_logs').insert({
      user_id: user.id,
      event_type: 'monitoring_start',
      severity: 'info',
      message: 'Started monitoring session',
      metadata: { session_id: session.id }
    })

    return NextResponse.json({ session }, { status: 201 })
  }

  if (action === 'stop') {
    const { data: session, error } = await supabase
      .from('monitoring_sessions')
      .update({ 
        status: 'ended', 
        ended_at: new Date().toISOString() 
      })
      .eq('user_id', user.id)
      .eq('status', 'active')
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Calculate duration
    if (session) {
      const startTime = new Date(session.started_at).getTime()
      const endTime = new Date().getTime()
      const durationSeconds = Math.floor((endTime - startTime) / 1000)

      await supabase
        .from('monitoring_sessions')
        .update({ total_duration_seconds: durationSeconds })
        .eq('id', session.id)

      // Log activity
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        event_type: 'monitoring_stop',
        severity: 'info',
        message: `Stopped monitoring session (${Math.floor(durationSeconds / 60)} minutes)`,
        metadata: { session_id: session.id, duration_seconds: durationSeconds }
      })
    }

    return NextResponse.json({ session })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
