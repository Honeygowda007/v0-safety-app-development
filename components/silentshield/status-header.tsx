"use client"

import { cn } from "@/lib/utils"
import { Shield, Battery, Wifi, MapPin, Bell, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"

interface StatusHeaderProps {
  isOnline: boolean
  batteryLevel: number
  location?: string
  onSettingsClick: () => void
}

export function StatusHeader({ isOnline, batteryLevel, location, onSettingsClick }: StatusHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Shield className="w-8 h-8 text-primary" />
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-success animate-pulse" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground tracking-tight">
                SilentShield
                <span className="text-primary ml-1">AI</span>
              </h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                Protection Active
              </p>
            </div>
          </div>

          {/* Status indicators */}
          <div className="hidden sm:flex items-center gap-4">
            {/* Location */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              <span className="max-w-24 truncate">{location || "Locating..."}</span>
            </div>

            {/* Network status */}
            <div className="flex items-center gap-1.5">
              <Wifi className={cn(
                "w-3.5 h-3.5",
                isOnline ? "text-success" : "text-destructive"
              )} />
              <span className={cn(
                "text-xs",
                isOnline ? "text-success" : "text-destructive"
              )}>
                {isOnline ? "Online" : "Offline"}
              </span>
            </div>

            {/* Battery */}
            <div className="flex items-center gap-1.5">
              <Battery className={cn(
                "w-3.5 h-3.5",
                batteryLevel > 20 ? "text-success" : "text-destructive"
              )} />
              <span className={cn(
                "text-xs font-mono",
                batteryLevel > 20 ? "text-muted-foreground" : "text-destructive"
              )}>
                {batteryLevel}%
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onSettingsClick}>
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
