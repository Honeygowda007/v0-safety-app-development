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
  // State
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [status, setStatus] = useState<"safe" | "monitoring" | "alert" | "emergency">("monitoring")
  const [riskLevel, setRiskLevel] = useState<"low" | "medium" | "high">("low")
  const [riskScore, setRiskScore] = useState(15)
  const [isListening, setIsListening] = useState(true)
  const [audioIntensity, setAudioIntensity] = useState(0.2)
  const [detectedEmotion, setDetectedEmotion] = useState<string>("NORMAL")
  const [countdown, setCountdown] = useState<number | undefined>(undefined)
  const [contacts, setContacts] = useState<Contact[]>([
    { id: "1", name: "Mom", phone: "+91 98765 43210", relationship: "Parent" },
    { id: "2", name: "Priya", phone: "+91 87654 32109", relationship: "Best Friend" },
  ])
  const [activities, setActivities] = useState<ActivityItem[]>([
    { id: "1", type: "system", message: "Protection system activated", timestamp: new Date() },
    { id: "2", type: "detection", message: "Audio monitoring started", timestamp: new Date() },
  ])
  const [settings, setSettings] = useState({
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

  // Add activity helper
  const addActivity = useCallback((type: ActivityItem["type"], message: string, severity?: ActivityItem["severity"]) => {
    setActivities(prev => [
      { id: Date.now().toString(), type, message, timestamp: new Date(), severity },
      ...prev.slice(0, 49)
    ])
  }, [])

  // Simulate real-time audio detection
  useEffect(() => {
    if (!isListening) return

    const interval = setInterval(() => {
      // Simulate varying audio intensity
      const newIntensity = Math.min(1, Math.max(0, audioIntensity + (Math.random() - 0.5) * 0.2))
      setAudioIntensity(newIntensity)

      // Occasionally simulate detection events
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

    // Auto-trigger alert on high risk
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
      setStatus("emergency")
      setContacts(prev => prev.map(c => ({ ...c, isNotified: true })))
      addActivity("alert", "EMERGENCY TRIGGERED - Contacting help!", "high")
      return
    }

    const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    return () => clearTimeout(timer)
  }, [status, countdown, addActivity])

  // Status change handler
  const handleStatusChange = (newStatus: typeof status) => {
    setStatus(newStatus)
    setCountdown(undefined)

    if (newStatus === "safe") {
      setDetectedEmotion("NORMAL")
      setContacts(prev => prev.map(c => ({ ...c, isNotified: false })))
      addActivity("safe", "User confirmed safe - Alert cancelled")
    } else if (newStatus === "emergency") {
      setContacts(prev => prev.map(c => ({ ...c, isNotified: true })))
      addActivity("alert", "Manual emergency triggered!", "high")
    }
  }

  // Contact handlers
  const handleAddContact = (contact: Omit<Contact, "id">) => {
    setContacts(prev => [...prev, { ...contact, id: Date.now().toString() }])
    addActivity("system", `Added ${contact.name} to trusted contacts`)
  }

  const handleRemoveContact = (id: string) => {
    const contact = contacts.find(c => c.id === id)
    setContacts(prev => prev.filter(c => c.id !== id))
    if (contact) addActivity("system", `Removed ${contact.name} from trusted contacts`)
  }

  // Settings handler
  const handleSettingChange = (key: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    addActivity("system", `${value ? "Enabled" : "Disabled"} ${key.replace(/([A-Z])/g, " $1").toLowerCase()}`)
    
    if (key === "audioDetection") {
      setIsListening(value)
    }
  }

  // Quick action handler
  const handleQuickAction = (action: string) => {
    switch (action) {
      case "shake":
        addActivity("system", "Shake detection enabled")
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
        handleSettingChange("offlineMode", !settings.offlineMode)
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
      setContacts(prev => prev.map(c => ({ ...c, isNotified: false })))
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <StatusHeader
        isOnline={true}
        batteryLevel={78}
        location={location.address}
        onSettingsClick={() => setSettingsOpen(true)}
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
              isTracking={settings.locationTracking}
              lastUpdated={new Date()}
            />
          </div>

          {/* Right column */}
          <div className="space-y-6">
            <TrustedContacts
              contacts={contacts}
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
              totalMonitoringHours: 156,
              alertsThisWeek: 2,
              safetyScore: 94,
              averageResponseTime: 3.2,
              locationsVisited: 12,
              trendsUp: true
            }}
          />
          <ActivityLog activities={activities} />
        </div>
      </main>

      {/* Settings panel */}
      <SettingsPanel
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onSettingChange={handleSettingChange}
      />
    </div>
  )
}
