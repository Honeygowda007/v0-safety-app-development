import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { status, notes } = body

  const updateData: Record<string, unknown> = {}
  
  if (status) {
    updateData.status = status
    if (status === 'resolved' || status === 'cancelled' || status === 'false_alarm') {
      updateData.resolved_at = new Date().toISOString()
    }
  }
  
  if (notes !== undefined) {
    updateData.notes = notes
  }

  const { data: alert, error } = await supabase
    .from('emergency_alerts')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Log the resolution
  if (status && status !== 'active') {
    await supabase.from('activity_logs').insert({
      user_id: user.id,
      event_type: 'alert_resolved',
      severity: 'info',
      message: `Alert ${status}: ${notes || 'No notes provided'}`,
      metadata: { alert_id: id, resolution: status }
    })
  }

  return NextResponse.json({ alert })
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: alert, error } = await supabase
    .from('emergency_alerts')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ alert })
}
