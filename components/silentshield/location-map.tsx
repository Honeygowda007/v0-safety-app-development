"use client"

import { cn } from "@/lib/utils"
import { MapPin, Navigation, Clock, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface LocationMapProps {
  latitude: number
  longitude: number
  address?: string
  isTracking: boolean
  lastUpdated?: Date
}

export function LocationMap({ latitude, longitude, address, isTracking, lastUpdated }: LocationMapProps) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Map visualization */}
      <div className="relative h-48 bg-muted/30">
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full">
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Radar effect */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            {/* Radar rings */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full border border-primary/20 animate-ping" style={{ animationDuration: "3s" }} />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full border border-primary/30 animate-ping" style={{ animationDuration: "2.5s" }} />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full border border-primary/40 animate-ping" style={{ animationDuration: "2s" }} />
            </div>
            
            {/* Center point */}
            <div className="relative w-8 h-8 flex items-center justify-center">
              <div className="absolute w-8 h-8 rounded-full bg-primary/30 animate-pulse" />
              <div className="w-4 h-4 rounded-full bg-primary glow-cyan" />
            </div>
          </div>
        </div>

        {/* Tracking indicator */}
        {isTracking && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 rounded-full bg-success/20 border border-success/50">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs text-success font-medium">Live</span>
          </div>
        )}

        {/* Location pin */}
        <div className="absolute bottom-3 left-3">
          <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-background/80 backdrop-blur-sm border border-border">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-xs text-foreground font-mono">
              {latitude.toFixed(4)}°, {longitude.toFixed(4)}°
            </span>
          </div>
        </div>
      </div>

      {/* Location details */}
      <div className="p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/20">
            <Navigation className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {address || "Fetching address..."}
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
              <Clock className="w-3 h-3" />
              <span>
                Updated {lastUpdated ? formatTimeAgo(lastUpdated) : "just now"}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1">
            <Share2 className="w-4 h-4 mr-2" />
            Share Location
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <MapPin className="w-4 h-4 mr-2" />
            Open Maps
          </Button>
        </div>

        {/* Location history */}
        <div className="pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">
            Location History
          </p>
          <div className="space-y-2">
            {[
              { time: "2 min ago", location: "Current location" },
              { time: "5 min ago", location: "Moving" },
              { time: "10 min ago", location: "Home" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <div className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  i === 0 ? "bg-primary" : "bg-muted-foreground"
                )} />
                <span className="text-muted-foreground">{item.time}</span>
                <span className="text-foreground">{item.location}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
  if (seconds < 60) return "just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}
