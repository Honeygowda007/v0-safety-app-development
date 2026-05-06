"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Shield, ShieldAlert, ShieldCheck, Phone, MessageSquare, MapPin, Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EmergencyButtonProps {
  status: "safe" | "monitoring" | "alert" | "emergency"
  onStatusChange: (status: "safe" | "monitoring" | "alert" | "emergency") => void
  countdown?: number
}

export function EmergencyButton({ status, onStatusChange, countdown }: EmergencyButtonProps) {
  const [isPulsing, setIsPulsing] = useState(false)

  useEffect(() => {
    if (status === "alert" || status === "emergency") {
      setIsPulsing(true)
    } else {
      setIsPulsing(false)
    }
  }, [status])

  const getStatusConfig = () => {
    switch (status) {
      case "safe":
        return {
          icon: ShieldCheck,
          label: "You are Safe",
          sublabel: "Protection Active",
          bgColor: "bg-success/20",
          borderColor: "border-success/50",
          textColor: "text-success",
          glowClass: "glow-green"
        }
      case "monitoring":
        return {
          icon: Shield,
          label: "Monitoring",
          sublabel: "AI Active",
          bgColor: "bg-primary/20",
          borderColor: "border-primary/50",
          textColor: "text-primary",
          glowClass: "glow-cyan"
        }
      case "alert":
        return {
          icon: ShieldAlert,
          label: "Alert Detected",
          sublabel: countdown ? `Confirming in ${countdown}s` : "Analyzing...",
          bgColor: "bg-warning/20",
          borderColor: "border-warning/50",
          textColor: "text-warning",
          glowClass: ""
        }
      case "emergency":
        return {
          icon: ShieldAlert,
          label: "EMERGENCY",
          sublabel: "Help is on the way",
          bgColor: "bg-destructive/20",
          borderColor: "border-destructive/50",
          textColor: "text-destructive",
          glowClass: "glow-red animate-pulse-glow"
        }
    }
  }

  const config = getStatusConfig()
  const Icon = config.icon

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
        Safety Status
      </h3>

      {/* Main status indicator */}
      <div className="flex flex-col items-center mb-6">
        <div className={cn(
          "relative w-32 h-32 rounded-full flex items-center justify-center border-4 transition-all duration-300",
          config.bgColor,
          config.borderColor,
          config.glowClass
        )}>
          {isPulsing && (
            <>
              <div className={cn(
                "absolute inset-0 rounded-full animate-ping opacity-25",
                config.bgColor
              )} />
              <div className={cn(
                "absolute inset-0 rounded-full animate-pulse opacity-50",
                config.bgColor
              )} />
            </>
          )}
          <Icon className={cn("w-16 h-16 relative z-10", config.textColor)} />
        </div>
        <div className="mt-4 text-center">
          <p className={cn("text-xl font-bold", config.textColor)}>{config.label}</p>
          <p className="text-sm text-muted-foreground">{config.sublabel}</p>
        </div>
      </div>

      {/* Action buttons based on status */}
      {status === "alert" && (
        <div className="space-y-3">
          <Button
            onClick={() => onStatusChange("safe")}
            className="w-full bg-success hover:bg-success/90 text-success-foreground"
          >
            <ShieldCheck className="w-4 h-4 mr-2" />
            {"I'm Safe - Cancel Alert"}
          </Button>
          <Button
            onClick={() => onStatusChange("emergency")}
            variant="destructive"
            className="w-full"
          >
            <ShieldAlert className="w-4 h-4 mr-2" />
            Trigger Emergency Now
          </Button>
        </div>
      )}

      {status === "emergency" && (
        <div className="space-y-3">
          <Button
            onClick={() => onStatusChange("safe")}
            className="w-full bg-success hover:bg-success/90 text-success-foreground"
          >
            <ShieldCheck className="w-4 h-4 mr-2" />
            {"I'm Safe Now"}
          </Button>
        </div>
      )}

      {(status === "safe" || status === "monitoring") && (
        <div className="space-y-3">
          <Button
            onClick={() => onStatusChange("emergency")}
            variant="destructive"
            className="w-full"
          >
            <ShieldAlert className="w-4 h-4 mr-2" />
            Manual SOS
          </Button>
        </div>
      )}

      {/* Emergency actions grid */}
      {status === "emergency" && (
        <div className="mt-6 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider">
            Active Emergency Actions
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-destructive/10 border border-destructive/30">
              <Phone className="w-4 h-4 text-destructive" />
              <span className="text-xs text-destructive">Calling 112</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-destructive/10 border border-destructive/30">
              <MessageSquare className="w-4 h-4 text-destructive" />
              <span className="text-xs text-destructive">SMS Sent</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-destructive/10 border border-destructive/30">
              <MapPin className="w-4 h-4 text-destructive" />
              <span className="text-xs text-destructive">Location Shared</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-destructive/10 border border-destructive/30">
              <Volume2 className="w-4 h-4 text-destructive" />
              <span className="text-xs text-destructive">Recording</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
