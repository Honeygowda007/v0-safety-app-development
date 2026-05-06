"use client"

import { useState, useEffect, useCallback } from "react"
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
import Link from "next/link"
import { Shield } from "lucide-react"

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
    darkMode: false,
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
        audioDetection: dbSettings.sos_enabled,
        locationTracking: dbSettings.location_sharing,
        autoAlarm: dbSettings.auto_call_enabled,
        vibrationFeedback: true,
        offlineMode: false,
        darkMode: dbSettings.theme === 'dark',
        silentMode: false,
        multiLanguage: true,
      })
      setIsListening(dbSettings.sos_enabled)
    }
  }, [dbSettings])

  // Sync activities from database
  useEffect(() => {
    if (dbActivities.length > 0) {
      setLocalActivities(dbActivities.map(a => ({
        id: a.id,
        type: mapActionToActivityType(a.action),
        message: a.description || a.action,
        timestamp: new Date(a.created_at),
        severity: 'low'
      })))
    }
  }, [dbActivities])

  // Sync active alert status
  useEffect(() => {
    if (activeAlert) {
      setStatus("emergency")
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

  // Helper to map action types
  function mapActionToActivityType(action: string): ActivityItem["type"] {
    switch (action) {
      case 'alert_triggered':
      case 'alert_resolved':
        return 'alert'
      case 'location_update':
        return 'location'
      case 'contact_added':
      case 'contact_removed':
        return 'system'
      default:
        return 'system'
    }
  }

  // Add activity helper
  const addActivity = useCallback(async (type: ActivityItem["type"], message: string, severity?: ActivityItem["severity"]) => {
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
          action: type === 'alert' ? 'alert_triggered' : type === 'location' ? 'location_update' : 'system',
          description: message,
          metadata: {}
        })
      } catch {
        // Silently fail for activity logging
      }
    }
  }, [isAuthenticated, logActivity])

  // Simulate real-time audio detection
  useEffect(() => {
    if (!isListening) return

    const interval = setInterval(() => {
      const newIntensity = Math.min(1, Math.max(0, audioIntensity + (Math.random() - 0.5) * 0.2))
      setAudioIntensity(newIntensity)

      if (Math.random() < 0.05) {
        const emotions = ["NORMAL", "STRESS", "FEAR", "NORMAL", "NORMAL"]
        const newEmotion = emotions[Math.floor(Math.random() * emotions.length)]
        setDetectedEmotion(newEmotion)
        
        if (newEmotion !== "NORMAL") {
          addActivity("detection", `Detected ${newEmotion.toLowerCase()} pattern in audio`, 
            newEmotion === "FEAR" ? "medium" : "low")
        }
      }
    }, 500)

    return () => clearInterval(interval)
  }, [isListening, audioIntensity, addActivity])

  // Update risk based on audio and emotion
  useEffect(() => {
    let newScore = 15
    let newLevel: "low" | "medium" | "high" = "low"

    if (detectedEmotion === "PANIC") {
      newScore = 85 + Math.random() * 15
      newLevel = "high"
    } else if (detectedEmotion === "FEAR") {
      newScore = 55 + Math.random() * 25
      newLevel = "medium"
    } else if (detectedEmotion === "STRESS") {
      newScore = 35 + Math.random() * 15
      newLevel = "medium"
    } else {
      newScore = 10 + audioIntensity * 25
      newLevel = newScore > 40 ? "medium" : "low"
    }

    setRiskScore(newScore)
    setRiskLevel(newLevel)

    if (newLevel === "high" && status === "monitoring") {
      setStatus("alert")
      setCountdown(30)
      addActivity("alert", "High risk detected! Confirming emergency...", "high")
    }
  }, [detectedEmotion, audioIntensity, status, addActivity])

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
          type: detectedEmotion === "PANIC" ? "sos" : "manual",
          latitude: location.latitude,
          longitude: location.longitude,
          address: location.address
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
          is_primary: localContacts.length === 0
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
        await updateSettings({ sos_enabled: value })
      }
    }
    
    if (key === "locationTracking" && isAuthenticated) {
      await updateSettings({ location_sharing: value })
    }
  }

  // Quick action handler
  const handleQuickAction = async (action: string) => {
    switch (action) {
      case "shake":
        addActivity("system", "Shake detection enabled")
        if (isAuthenticated) await updateSettings({ shake_to_alert: true })
        break
      case "siren":
        addActivity("alert", "Siren activated!", "medium")
        break
      case "share":
        addActivity("location", "Location shared with trusted contacts")
        break
      case "sms":
        addActivity("system", "Emergency SMS sent to all contacts")
        break
      case "call112":
        addActivity("alert", "Initiating call to 112", "high")
        break
      case "record":
        addActivity("system", "Audio recording started")
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
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="space-y-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-teal-100 to-blue-100 flex items-center justify-center shadow-lg">
              <Shield className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">SilentShield AI</h1>
            <p className="text-muted-foreground">
              AI-powered personal safety and emergency response system
            </p>
          </div>
          
          <div className="space-y-4 pt-6">
            <Link 
              href="/auth/login"
              className="block w-full py-3 px-4 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all shadow-md hover:shadow-lg"
            >
              Sign In
            </Link>
            <Link 
              href="/auth/sign-up"
              className="block w-full py-3 px-4 rounded-xl border border-border bg-white text-foreground font-medium hover:bg-muted transition-all shadow-sm hover:shadow-md"
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
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading SilentShield...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50/50 via-white to-blue-50/50">
      <StatusHeader
        isOnline={true}
        batteryLevel={78}
        location={location.address}
        onSettingsClick={() => setSettingsOpen(true)}
        userName={user?.email?.split('@')[0]}
      />

      <main className="container mx-auto px-4 py-6">
        {/* Demo controls */}
        <div className="mb-6 p-4 rounded-xl border border-border bg-white/80 backdrop-blur-sm shadow-sm">
          <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider font-medium">Demo Controls</p>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => simulateScenario("panic")}
              className="px-4 py-2 text-sm rounded-lg bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 transition-all font-medium"
            >
              Simulate Panic Detection
            </button>
            <button 
              onClick={() => simulateScenario("normal")}
              className="px-4 py-2 text-sm rounded-lg bg-success/10 text-success border border-success/20 hover:bg-success/20 transition-all font-medium"
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
            data={{
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
