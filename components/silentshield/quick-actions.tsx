"use client"

import { cn } from "@/lib/utils"
import { 
  Smartphone, 
  Volume2, 
  MapPin, 
  MessageSquare, 
  Phone, 
  Camera,
  Mic,
  Wifi
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface QuickActionsProps {
  onAction: (action: string) => void
  isEmergency?: boolean
}

export function QuickActions({ onAction, isEmergency }: QuickActionsProps) {
  const actions = [
    { id: "shake", icon: Smartphone, label: "Shake SOS", description: "Shake phone to trigger" },
    { id: "siren", icon: Volume2, label: "Loud Siren", description: "Play emergency sound" },
    { id: "share", icon: MapPin, label: "Share Location", description: "Send to contacts" },
    { id: "sms", icon: MessageSquare, label: "Send SMS", description: "Emergency message" },
  ]

  const emergencyActions = [
    { id: "call112", icon: Phone, label: "Call 112", color: "destructive" },
    { id: "record", icon: Mic, label: "Record Audio", color: "warning" },
    { id: "photo", icon: Camera, label: "Take Photo", color: "primary" },
    { id: "offline", icon: Wifi, label: "Offline Mode", color: "muted" },
  ]

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
        Quick Actions
      </h3>

      {/* Main actions grid */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {actions.map((action) => (
          <Button
            key={action.id}
            variant="outline"
            className={cn(
              "h-auto flex-col gap-1 p-4 border-border hover:border-primary hover:bg-primary/10",
              isEmergency && "opacity-50 pointer-events-none"
            )}
            onClick={() => onAction(action.id)}
          >
            <action.icon className="w-5 h-5 text-primary" />
            <span className="text-xs font-medium">{action.label}</span>
            <span className="text-[10px] text-muted-foreground">{action.description}</span>
          </Button>
        ))}
      </div>

      {/* Emergency actions */}
      <div className="pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider">
          Emergency Functions
        </p>
        <div className="flex flex-wrap gap-2">
          {emergencyActions.map((action) => (
            <Button
              key={action.id}
              variant="ghost"
              size="sm"
              className={cn(
                "gap-1.5",
                action.color === "destructive" && "text-destructive hover:bg-destructive/10",
                action.color === "warning" && "text-warning hover:bg-warning/10",
                action.color === "primary" && "text-primary hover:bg-primary/10",
                action.color === "muted" && "text-muted-foreground hover:bg-muted"
              )}
              onClick={() => onAction(action.id)}
            >
              <action.icon className="w-4 h-4" />
              <span className="text-xs">{action.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Shake detection info */}
      <div className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/30">
        <div className="flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-primary" />
          <span className="text-xs text-foreground">
            <strong>Shake Detection Active:</strong> Shake your phone rapidly 3 times to trigger emergency
          </span>
        </div>
      </div>
    </div>
  )
}
