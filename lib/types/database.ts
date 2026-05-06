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
  email: string | null
  relationship: string | null
  is_primary: boolean
  notify_on_alert: boolean
  auto_call: boolean
  created_at: string
  updated_at: string
}

export interface EmergencyAlert {
  id: string
  user_id: string
  status: 'active' | 'resolved' | 'cancelled' | 'false_alarm'
  trigger_type: 'manual' | 'voice_detected' | 'shake_sos' | 'keyword' | 'auto_detection'
  risk_level: number
  latitude: number | null
  longitude: number | null
  location_name: string | null
  audio_evidence_url: string | null
  notes: string | null
  resolved_at: string | null
  created_at: string
}

export interface ActivityLog {
  id: string
  user_id: string
  event_type: 'monitoring_start' | 'monitoring_stop' | 'alert_triggered' | 'alert_resolved' | 'location_update' | 'contact_notified' | 'evidence_recorded' | 'settings_changed' | 'risk_elevated' | 'system'
  severity: 'info' | 'warning' | 'critical'
  message: string
  metadata: Record<string, unknown> | null
  created_at: string
}

export interface UserSettings {
  id: string
  user_id: string
  voice_detection_enabled: boolean
  keyword_detection_enabled: boolean
  auto_recording_enabled: boolean
  shake_sos_enabled: boolean
  sms_alerts_enabled: boolean
  call_alerts_enabled: boolean
  location_sharing_enabled: boolean
  offline_mode_enabled: boolean
  detection_sensitivity: number
  keywords: string[]
  created_at: string
  updated_at: string
}

export interface MonitoringSession {
  id: string
  user_id: string
  started_at: string
  ended_at: string | null
  total_duration_seconds: number | null
  alerts_count: number
  average_risk_level: number
  status: 'active' | 'paused' | 'ended'
}

export interface SafetyAnalyticsData {
  totalMonitoringHours: number
  alertsThisWeek: number
  safetyScore: number
  averageResponseTime: number
  locationsVisited: number
  trendsUp: boolean
}
