import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) {
    // If no profile exists, create one
    if (error.code === 'PGRST116') {
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({ 
          id: user.id,
          display_name: user.email 
        })
        .select()
        .single()
      
      if (createError) {
        return NextResponse.json({ error: createError.message }, { status: 500 })
      }
      
      return NextResponse.json({ profile: newProfile, email: user.email })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ profile, email: user.email })
}

export async function PUT(request: Request) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { display_name, phone, avatar_url } = body

  const { data: profile, error } = await supabase
    .from('profiles')
    .update({
      display_name,
      phone,
      avatar_url,
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ profile })
}
