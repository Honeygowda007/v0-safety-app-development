"use client"

import { cn } from "@/lib/utils"
import { 
  X, 
  Shield, 
  Bell, 
  Mic, 
  MapPin, 
  Moon, 
  Volume2, 
  Smartphone, 
  Wifi, 
  Battery, 
  Languages,
  Vibrate,
  Eye
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"

interface SettingsPanelProps {
  isOpen: boolean
  onClose: () => void
  settings: {
    audioDetection: boolean
    locationTracking: boolean
    autoAlarm: boolean
    vibrationFeedback: boolean
    offlineMode: boolean
    darkMode: boolean
    silentMode: boolean
    multiLanguage: boolean
  }
  onSettingChange: (key: string, value: boolean) => void
}

export function SettingsPanel({ isOpen, onClose, settings, onSettingChange }: SettingsPanelProps) {
  if (!isOpen) return null

  const settingsGroups = [
    {
      title: "Detection",
      items: [
        {
          key: "audioDetection",
          icon: Mic,
          label: "Audio Detection",
          description: "AI-powered distress detection",
          value: settings.audioDetection
        },
        {
          key: "locationTracking",
          icon: MapPin,
          label: "Location Tracking",
          description: "Real-time GPS monitoring",
          value: settings.locationTracking
        },
        {
          key: "multiLanguage",
          icon: Languages,
          label: "Multi-language Support",
          description: "Detect distress in multiple languages",
          value: settings.multiLanguage
        }
      ]
    },
    {
      title: "Alerts",
      items: [
        {
          key: "autoAlarm",
          icon: Volume2,
          label: "Auto Alarm",
          description: "Trigger loud siren on emergency",
          value: settings.autoAlarm
        },
        {
          key: "vibrationFeedback",
          icon: Vibrate,
          label: "Vibration Feedback",
          description: "Haptic confirmation before alerts",
          value: settings.vibrationFeedback
        },
        {
          key: "silentMode",
          icon: Eye,
          label: "Silent Mode",
          description: "Discreet alerts without sound",
          value: settings.silentMode
        }
      ]
    },
    {
      title: "System",
      items: [
        {
          key: "offlineMode",
          icon: Wifi,
          label: "Offline Mode",
          description: "On-device AI when no network",
          value: settings.offlineMode
        },
        {
          key: "darkMode",
          icon: Moon,
          label: "Dark Mode",
          description: "Eye-friendly dark interface",
          value: settings.darkMode
        }
      ]
    }
  ]

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-card border-l border-border shadow-xl overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-card/95 backdrop-blur-sm border-b border-border p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Settings</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {settingsGroups.map((group) => (
            <div key={group.title}>
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                {group.title}
              </h3>
              <div className="space-y-2">
                {group.items.map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-2 rounded-lg",
                        item.value ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                      )}>
                        <item.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                    <Switch
                      checked={item.value}
                      onCheckedChange={(checked) => onSettingChange(item.key, checked)}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* App info */}
          <div className="pt-4 border-t border-border">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              About
            </h3>
            <div className="p-4 rounded-lg bg-muted/30 border border-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Version</span>
                <span className="text-sm font-mono text-foreground">1.0.0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">AI Model</span>
                <span className="text-sm font-mono text-foreground">TensorFlow Lite</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Detection Engine</span>
                <span className="text-sm font-mono text-primary">Active</span>
              </div>
            </div>
          </div>

          {/* Safe word */}
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Secret Safe Word</span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Say this word to quickly cancel an alert without touching your phone
            </p>
            <div className="p-2 rounded bg-background border border-border text-center">
              <span className="text-lg font-mono text-primary">{"\"BUTTERFLY\""}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
