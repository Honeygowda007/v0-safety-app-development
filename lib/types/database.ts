export interface Profile {
  id: string
  display_name: string | null
  phone: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface TrustedContact {
  id: string
  user_id: string
  name: string
  phone: string
  relationship: string | null
  is_primary: boolean
  created_at: string
  updated_at: string
}

export interface EmergencyAlert {
  id: string
  user_id: string
  type: 'sos' | 'check_in' | 'geofence' | 'timer' | 'manual'
  status: 'active' | 'resolved' | 'cancelled'
  location: {
    latitude: number
    longitude: number
    address?: string
  } | null
  message: string | null
  triggered_at: string
  resolved_at: string | null
  created_at: string
}

export interface ActivityLog {
  id: string
  user_id: string
  action: string
  description: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

export interface UserSettings {
  id: string
  user_id: string
  sos_enabled: boolean
  shake_to_alert: boolean
  auto_call_enabled: boolean
  location_sharing: boolean
  check_in_interval: number
  safe_words: string[] | null
  theme: string
  notifications_enabled: boolean
  created_at: string
  updated_at: string
}

export interface LocationHistory {
  id: string
  user_id: string
  latitude: number
  longitude: number
  accuracy: number | null
  address: string | null
  recorded_at: string
}

export interface SafetyAnalyticsData {
  totalMonitoringHours: number
  alertsThisWeek: number
  safetyScore: number
  averageResponseTime: number
  locationsVisited: number
  trendsUp: boolean
}
