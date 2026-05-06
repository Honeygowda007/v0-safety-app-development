"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { StatusHeader } from "@/components/silentshield/status-header"
import { RiskMeter } from "@/components/silentshield/risk-meter"
import { AudioWaveform } from "@/components/silentshield/audio-waveform"
import { EmergencyButton } from "@/components/silentshield/emergency-button"
import { TrustedContacts } from "@/components/silentshield/trusted-contacts"
import { LocationMap } from "@/components/silentshield/location-map"
import { ActivityLog } from "@/components/silentshield/activity-log"
import { SettingsPanel } from "@/components/silentshield/settings-panel"
import { QuickActions } from "@/components/silentshield/quick-actions"
import { SafetyAnalytics } from "@/components/silentshield/safety-analytics"
import { useAuth } from "@/hooks/use-auth"
import { useContacts } from "@/hooks/use-contacts"
import { useAlerts } from "@/hooks/use-alerts"
import { useSettings } from "@/hooks/use-settings"
import { useActivity } from "@/hooks/use-activity"
import { useMonitoring } from "@/hooks/use-monitoring"
import { useAnalytics } from "@/hooks/use-analytics"
import Link from "next/link"

// Types
interface Contact {
  id: string
  name: string
  phone: string
  relationship: string
  isNotified?: boolean
}

interface ActivityItem {
  id: string
  type: "detection" | "location" | "alert" | "safe" | "system"
  message: string
  timestamp: Date
  severity?: "low" | "medium" | "high"
}

export default function SilentShieldDashboard() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth()
  const { contacts: dbContacts, addContact: addDbContact, deleteContact: deleteDbContact } = useContacts()
  const { activeAlert, triggerAlert, resolveAlert } = useAlerts()
  const { settings: dbSettings, updateSettings } = useSettings()
  const { activities: dbActivities, logActivity } = useActivity()
  const { isMonitoring, startMonitoring, stopMonitoring } = useMonitoring()
  const { analytics } = useAnalytics()

  // State
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [status, setStatus] = useState<"safe" | "monitoring" | "alert" | "emergency">("monitoring")
  const [riskLevel, setRiskLevel] = useState<"low" | "medium" | "high">("low")
  const [riskScore, setRiskScore] = useState(15)
  const [isListening, setIsListening] = useState(true)
  const [audioIntensity, setAudioIntensity] = useState(0.2)
  const [detectedEmotion, setDetectedEmotion] = useState<string>("NORMAL")
  const [countdown, setCountdown] = useState<number | undefined>(undefined)
  const [localContacts, setLocalContacts] = useState<Contact[]>([])
  const [localActivities, setLocalActivities] = useState<ActivityItem[]>([])
  const [localSettings, setLocalSettings] = useState({
    audioDetection: true,
    locationTracking: true,
    autoAlarm: true,
    vibrationFeedback: true,
    offlineMode: false,
    darkMode: true,
    silentMode: false,
    multiLanguage: true,
  })

  // Location state
  const [location, setLocation] = useState({
    latitude: 12.9716,
    longitude: 77.5946,
    address: "Bengaluru, Karnataka, India"
  })

  // Sync contacts from database
  useEffect(() => {
    if (dbContacts.length > 0) {
      setLocalContacts(dbContacts.map(c => ({
        id: c.id,
        name: c.name,
        phone: c.phone,
        relationship: c.relationship || "Contact",
        isNotified: false
      })))
    }
  }, [dbContacts])

  // Sync settings from database
  useEffect(() => {
    if (dbSettings) {
      setLocalSettings({
        audioDetection: dbSettings.voice_detection_enabled,
        locationTracking: dbSettings.location_sharing_enabled,
        autoAlarm: dbSettings.auto_recording_enabled,
        vibrationFeedback: true,
        offlineMode: dbSettings.offline_mode_enabled,
        darkMode: true,
        silentMode: false,
        multiLanguage: true,
      })
      setIsListening(dbSettings.voice_detection_enabled)
    }
  }, [dbSettings])

  // Sync activities from database
  useEffect(() => {
    if (dbActivities.length > 0) {
      setLocalActivities(dbActivities.map(a => ({
        id: a.id,
        type: mapEventTypeToActivityType(a.event_type),
        message: a.message,
        timestamp: new Date(a.created_at),
        severity: a.severity === 'critical' ? 'high' : a.severity === 'warning' ? 'medium' : 'low'
      })))
    }
  }, [dbActivities])

  // Sync active alert status
  useEffect(() => {
    if (activeAlert) {
      setStatus("emergency")
      setRiskScore(activeAlert.risk_level)
    }
  }, [activeAlert])

  // Get browser location
  useEffect(() => {
    if (navigator.geolocation && localSettings.locationTracking) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            address: "Current Location"
          })
        },
        () => {
          // Keep default location on error
        }
      )
    }
  }, [localSettings.locationTracking])

  // Start monitoring on mount if authenticated
  useEffect(() => {
    if (isAuthenticated && !isMonitoring) {
      startMonitoring().catch(console.error)
    }
  }, [isAuthenticated, isMonitoring, startMonitoring])

  // Helper to map event types
  function mapEventTypeToActivityType(eventType: string): ActivityItem["type"] {
    switch (eventType) {
      case 'alert_triggered':
      case 'alert_resolved':
        return 'alert'
      case 'location_update':
        return 'location'
      case 'monitoring_start':
      case 'monitoring_stop':
      case 'risk_elevated':
        return 'detection'
      default:
        return 'system'
    }
  }

  // Add activity helper - using ref to avoid dependency issues
  const addActivityRef = useRef<(type: ActivityItem["type"], message: string, severity?: ActivityItem["severity"]) => void>()
  
  addActivityRef.current = async (type: ActivityItem["type"], message: string, severity?: ActivityItem["severity"]) => {
    const newActivity: ActivityItem = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: new Date(),
      severity
    }
    setLocalActivities(prev => [newActivity, ...prev.slice(0, 49)])

    // Log to database if authenticated
    if (isAuthenticated) {
      try {
        await logActivity({
          event_type: type === 'alert' ? 'alert_triggered' : type === 'location' ? 'location_update' : 'system',
          severity: severity === 'high' ? 'critical' : severity === 'medium' ? 'warning' : 'info',
          message,
          metadata: {}
        })
      } catch {
        // Silently fail for activity logging
      }
    }
  }

  const addActivity = useCallback((type: ActivityItem["type"], message: string, severity?: ActivityItem["severity"]) => {
    addActivityRef.current?.(type, message, severity)
  }, [])

  // Simulate real-time audio detection and risk assessment in a single effect
  useEffect(() => {
    if (!isListening) return

    const statusRef = { current: status }
    statusRef.current = status

    const interval = setInterval(() => {
      // Update audio intensity
      setAudioIntensity(prev => Math.min(1, Math.max(0, prev + (Math.random() - 0.5) * 0.2)))

      // Occasionally detect new emotions
      if (Math.random() < 0.05) {
        const emotions = ["NORMAL", "STRESS", "FEAR", "NORMAL", "NORMAL"]
        const newEmotion = emotions[Math.floor(Math.random() * emotions.length)]
        
        setDetectedEmotion(prevEmotion => {
          if (prevEmotion === newEmotion) return prevEmotion
          
          // Calculate risk based on new emotion
          let newScore = 15
          let newLevel: "low" | "medium" | "high" = "low"

          if (newEmotion === "PANIC") {
            newScore = 85 + Math.random() * 15
            newLevel = "high"
          } else if (newEmotion === "FEAR") {
            newScore = 55 + Math.random() * 25
            newLevel = "medium"
          } else if (newEmotion === "STRESS") {
            newScore = 35 + Math.random() * 15
            newLevel = "medium"
          } else {
            newScore = 15 + Math.random() * 10
            newLevel = "low"
          }

          setRiskScore(newScore)
          setRiskLevel(newLevel)

          // Trigger alert if high risk detected while monitoring
          if (newLevel === "high" && statusRef.current === "monitoring") {
            setStatus("alert")
            setCountdown(30)
            addActivityRef.current?.("alert", "High risk detected! Confirming emergency...", "high")
          }

          return newEmotion
        })
      }
    }, 500)

    return () => clearInterval(interval)
  }, [isListening, status])

  // Countdown timer for alert confirmation
  useEffect(() => {
    if (status !== "alert" || countdown === undefined) return

    if (countdown <= 0) {
      handleTriggerEmergency()
      return
    }

    const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    return () => clearTimeout(timer)
  }, [status, countdown])

  // Trigger emergency in database
  const handleTriggerEmergency = async () => {
    setStatus("emergency")
    setLocalContacts(prev => prev.map(c => ({ ...c, isNotified: true })))
    addActivity("alert", "EMERGENCY TRIGGERED - Contacting help!", "high")

    if (isAuthenticated) {
      try {
        await triggerAlert({
          trigger_type: detectedEmotion === "PANIC" ? "voice_detected" : "manual",
          risk_level: Math.round(riskScore),
          latitude: location.latitude,
          longitude: location.longitude,
          location_name: location.address
        })
      } catch (error) {
        console.error("Failed to trigger alert:", error)
      }
    }
  }

  // Status change handler
  const handleStatusChange = async (newStatus: typeof status) => {
    setStatus(newStatus)
    setCountdown(undefined)

    if (newStatus === "safe") {
      setDetectedEmotion("NORMAL")
      setLocalContacts(prev => prev.map(c => ({ ...c, isNotified: false })))
      addActivity("safe", "User confirmed safe - Alert cancelled")

      if (isAuthenticated && activeAlert) {
        try {
          await resolveAlert(activeAlert.id, "cancelled", "User confirmed safe")
        } catch (error) {
          console.error("Failed to resolve alert:", error)
        }
      }
    } else if (newStatus === "emergency") {
      await handleTriggerEmergency()
    }
  }

  // Contact handlers
  const handleAddContact = async (contact: Omit<Contact, "id">) => {
    if (isAuthenticated) {
      try {
        await addDbContact({
          name: contact.name,
          phone: contact.phone,
          relationship: contact.relationship,
          is_primary: localContacts.length === 0,
          notify_on_alert: true,
          auto_call: false
        })
      } catch (error) {
        console.error("Failed to add contact:", error)
        // Add locally as fallback
        setLocalContacts(prev => [...prev, { ...contact, id: Date.now().toString() }])
      }
    } else {
      setLocalContacts(prev => [...prev, { ...contact, id: Date.now().toString() }])
    }
    addActivity("system", `Added ${contact.name} to trusted contacts`)
  }

  const handleRemoveContact = async (id: string) => {
    const contact = localContacts.find(c => c.id === id)
    
    if (isAuthenticated) {
      try {
        await deleteDbContact(id)
      } catch (error) {
        console.error("Failed to delete contact:", error)
        setLocalContacts(prev => prev.filter(c => c.id !== id))
      }
    } else {
      setLocalContacts(prev => prev.filter(c => c.id !== id))
    }
    
    if (contact) addActivity("system", `Removed ${contact.name} from trusted contacts`)
  }

  // Settings handler
  const handleSettingChange = async (key: string, value: boolean) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }))
    addActivity("system", `${value ? "Enabled" : "Disabled"} ${key.replace(/([A-Z])/g, " $1").toLowerCase()}`)
    
    if (key === "audioDetection") {
      setIsListening(value)
      if (isAuthenticated) {
        await updateSettings({ voice_detection_enabled: value })
      }
    }
    
    if (key === "locationTracking" && isAuthenticated) {
      await updateSettings({ location_sharing_enabled: value })
    }
    
    if (key === "offlineMode" && isAuthenticated) {
      await updateSettings({ offline_mode_enabled: value })
    }
  }

  // Quick action handler
  const handleQuickAction = async (action: string) => {
    switch (action) {
      case "shake":
        addActivity("system", "Shake detection enabled")
        if (isAuthenticated) await updateSettings({ shake_sos_enabled: true })
        break
      case "siren":
        addActivity("alert", "Siren activated!", "medium")
        break
      case "share":
        addActivity("location", "Location shared with trusted contacts")
        break
      case "sms":
        addActivity("system", "Emergency SMS sent to all contacts")
        if (isAuthenticated) await updateSettings({ sms_alerts_enabled: true })
        break
      case "call112":
        addActivity("alert", "Initiating call to 112", "high")
        break
      case "record":
        addActivity("system", "Audio recording started")
        if (isAuthenticated) await updateSettings({ auto_recording_enabled: true })
        break
      case "photo":
        addActivity("system", "Evidence photo captured")
        break
      case "offline":
        handleSettingChange("offlineMode", !localSettings.offlineMode)
        break
    }
  }

  // Simulate demo scenarios
  const simulateScenario = (scenario: "panic" | "normal") => {
    if (scenario === "panic") {
      setDetectedEmotion("PANIC")
      setAudioIntensity(0.9)
      addActivity("detection", "PANIC detected in audio!", "high")
    } else {
      setDetectedEmotion("NORMAL")
      setAudioIntensity(0.2)
      setStatus("monitoring")
      setLocalContacts(prev => prev.map(c => ({ ...c, isNotified: false })))
    }
  }

  // Show login prompt if not authenticated
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="space-y-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
              <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-foreground">SilentShield AI</h1>
            <p className="text-muted-foreground">
              AI-powered personal safety and emergency response system
            </p>
          </div>
          
          <div className="space-y-4 pt-6">
            <Link 
              href="/auth/login"
              className="block w-full py-3 px-4 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              Sign In
            </Link>
            <Link 
              href="/auth/sign-up"
              className="block w-full py-3 px-4 rounded-xl border border-border text-foreground font-medium hover:bg-muted transition-colors"
            >
              Create Account
            </Link>
          </div>

          <p className="text-xs text-muted-foreground pt-4">
            Your safety data is encrypted and stored securely
          </p>
        </div>
      </div>
    )
  }

  // Show loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading SilentShield...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <StatusHeader
        isOnline={true}
        batteryLevel={78}
        location={location.address}
        onSettingsClick={() => setSettingsOpen(true)}
        userName={user?.email?.split('@')[0]}
      />

      <main className="container mx-auto px-4 py-6">
        {/* Demo controls */}
        <div className="mb-6 p-4 rounded-xl border border-border bg-card">
          <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Demo Controls</p>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => simulateScenario("panic")}
              className="px-3 py-1.5 text-xs rounded-lg bg-destructive/20 text-destructive border border-destructive/30 hover:bg-destructive/30 transition-colors"
            >
              Simulate Panic Detection
            </button>
            <button 
              onClick={() => simulateScenario("normal")}
              className="px-3 py-1.5 text-xs rounded-lg bg-success/20 text-success border border-success/30 hover:bg-success/30 transition-colors"
            >
              Reset to Normal
            </button>
          </div>
        </div>

        {/* Main dashboard grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="space-y-6">
            <EmergencyButton
              status={status}
              onStatusChange={handleStatusChange}
              countdown={countdown}
            />
            <RiskMeter riskLevel={riskLevel} riskScore={riskScore} />
          </div>

          {/* Center column */}
          <div className="space-y-6">
            <AudioWaveform
              isListening={isListening}
              intensity={audioIntensity}
              detectedEmotion={detectedEmotion}
            />
            <LocationMap
              latitude={location.latitude}
              longitude={location.longitude}
              address={location.address}
              isTracking={localSettings.locationTracking}
              lastUpdated={new Date()}
            />
          </div>

          {/* Right column */}
          <div className="space-y-6">
            <TrustedContacts
              contacts={localContacts}
              onAddContact={handleAddContact}
              onRemoveContact={handleRemoveContact}
              emergencyActive={status === "emergency"}
            />
            <QuickActions
              onAction={handleQuickAction}
              isEmergency={status === "emergency"}
            />
          </div>
        </div>

        {/* Analytics and Activity log */}
        <div className="mt-6 grid lg:grid-cols-2 gap-6">
          <SafetyAnalytics
            data={analytics || {
              totalMonitoringHours: 0,
              alertsThisWeek: 0,
              safetyScore: 100,
              averageResponseTime: 0,
              locationsVisited: 0,
              trendsUp: true
            }}
          />
          <ActivityLog activities={localActivities} />
        </div>
      </main>

      {/* Settings panel */}
      <SettingsPanel
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={localSettings}
        onSettingChange={handleSettingChange}
      />
    </div>
  )
}
