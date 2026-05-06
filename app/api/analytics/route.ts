import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const lastWeekAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

  // Get total monitoring hours
  const { data: sessions } = await supabase
    .from('monitoring_sessions')
    .select('total_duration_seconds')
    .eq('user_id', user.id)

  const totalSeconds = sessions?.reduce((acc, s) => acc + (s.total_duration_seconds || 0), 0) || 0
  const totalMonitoringHours = Math.round(totalSeconds / 3600 * 10) / 10

  // Get alerts this week
  const { count: alertsThisWeek } = await supabase
    .from('emergency_alerts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', weekAgo.toISOString())

  // Get alerts last week for trend
  const { count: alertsLastWeek } = await supabase
    .from('emergency_alerts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', lastWeekAgo.toISOString())
    .lt('created_at', weekAgo.toISOString())

  // Calculate safety score (simple formula: 100 - (alerts * 10), min 0)
  const safetyScore = Math.max(0, 100 - ((alertsThisWeek || 0) * 10))

  // Get average response time from resolved alerts
  const { data: resolvedAlerts } = await supabase
    .from('emergency_alerts')
    .select('created_at, resolved_at')
    .eq('user_id', user.id)
    .not('resolved_at', 'is', null)

  let averageResponseTime = 0
  if (resolvedAlerts && resolvedAlerts.length > 0) {
    const totalResponseTime = resolvedAlerts.reduce((acc, alert) => {
      const created = new Date(alert.created_at).getTime()
      const resolved = new Date(alert.resolved_at!).getTime()
      return acc + (resolved - created)
    }, 0)
    averageResponseTime = Math.round((totalResponseTime / resolvedAlerts.length) / 60000 * 10) / 10 // in minutes
  }

  // Get unique locations visited this week
  const { data: locations } = await supabase
    .from('emergency_alerts')
    .select('location_name')
    .eq('user_id', user.id)
    .gte('created_at', weekAgo.toISOString())
    .not('location_name', 'is', null)

  const uniqueLocations = new Set(locations?.map(l => l.location_name)).size

  // Get weekly data for chart
  const weeklyData = []
  for (let i = 6; i >= 0; i--) {
    const dayStart = new Date(now)
    dayStart.setDate(dayStart.getDate() - i)
    dayStart.setHours(0, 0, 0, 0)
    
    const dayEnd = new Date(dayStart)
    dayEnd.setHours(23, 59, 59, 999)

    const { data: daySessions } = await supabase
      .from('monitoring_sessions')
      .select('total_duration_seconds')
      .eq('user_id', user.id)
      .gte('started_at', dayStart.toISOString())
      .lt('started_at', dayEnd.toISOString())

    const hours = (daySessions?.reduce((acc, s) => acc + (s.total_duration_seconds || 0), 0) || 0) / 3600

    const { count: dayAlerts } = await supabase
      .from('emergency_alerts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', dayStart.toISOString())
      .lt('created_at', dayEnd.toISOString())

    weeklyData.push({
      day: dayStart.toLocaleDateString('en-US', { weekday: 'short' }),
      hours: Math.round(hours * 10) / 10,
      alerts: dayAlerts || 0
    })
  }

  return NextResponse.json({
    totalMonitoringHours,
    alertsThisWeek: alertsThisWeek || 0,
    safetyScore,
    averageResponseTime,
    locationsVisited: uniqueLocations,
    trendsUp: (alertsThisWeek || 0) <= (alertsLastWeek || 0),
    weeklyData
  })
}
