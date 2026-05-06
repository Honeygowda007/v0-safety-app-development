"use client"

import { cn } from "@/lib/utils"
import { Shield, Mic, MapPin, Bell, AlertTriangle, Check, Clock } from "lucide-react"

interface ActivityItem {
  id: string
  type: "detection" | "location" | "alert" | "safe" | "system"
  message: string
  timestamp: Date
  severity?: "low" | "medium" | "high"
}

interface ActivityLogProps {
  activities: ActivityItem[]
}

export function ActivityLog({ activities }: ActivityLogProps) {
  const getIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "detection":
        return Mic
      case "location":
        return MapPin
      case "alert":
        return AlertTriangle
      case "safe":
        return Check
      case "system":
        return Shield
    }
  }

  const getIconColor = (type: ActivityItem["type"], severity?: ActivityItem["severity"]) => {
    if (severity === "high") return "text-destructive bg-destructive/20"
    if (severity === "medium") return "text-warning bg-warning/20"
    switch (type) {
      case "detection":
        return "text-primary bg-primary/20"
      case "location":
        return "text-accent bg-accent/20"
      case "alert":
        return "text-warning bg-warning/20"
      case "safe":
        return "text-success bg-success/20"
      case "system":
        return "text-muted-foreground bg-muted"
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Activity Log
        </h3>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>Real-time</span>
        </div>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No activity yet</p>
            <p className="text-xs">Events will appear here in real-time</p>
          </div>
        ) : (
          activities.map((activity, index) => {
            const Icon = getIcon(activity.type)
            return (
              <div
                key={activity.id}
                className={cn(
                  "flex items-start gap-3 p-2 rounded-lg transition-all",
                  index === 0 ? "bg-muted/30" : "bg-transparent",
                  activity.severity === "high" && "bg-destructive/5"
                )}
              >
                <div className={cn(
                  "p-1.5 rounded-lg shrink-0",
                  getIconColor(activity.type, activity.severity)
                )}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-sm",
                    activity.severity === "high" ? "text-destructive" : "text-foreground"
                  )}>
                    {activity.message}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {formatTime(activity.timestamp)}
                  </p>
                </div>
                {activity.severity && (
                  <span className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded-full uppercase font-medium shrink-0",
                    activity.severity === "high" && "bg-destructive/20 text-destructive",
                    activity.severity === "medium" && "bg-warning/20 text-warning",
                    activity.severity === "low" && "bg-success/20 text-success"
                  )}>
                    {activity.severity}
                  </span>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Stats footer */}
      <div className="mt-4 pt-4 border-t border-border grid grid-cols-3 gap-2 text-center">
        <div className="p-2 rounded-lg bg-muted/30">
          <div className="text-lg font-bold text-foreground">{activities.filter(a => a.type === "detection").length}</div>
          <div className="text-[10px] text-muted-foreground uppercase">Detections</div>
        </div>
        <div className="p-2 rounded-lg bg-muted/30">
          <div className="text-lg font-bold text-foreground">{activities.filter(a => a.type === "alert").length}</div>
          <div className="text-[10px] text-muted-foreground uppercase">Alerts</div>
        </div>
        <div className="p-2 rounded-lg bg-muted/30">
          <div className="text-lg font-bold text-success">{activities.filter(a => a.type === "safe").length}</div>
          <div className="text-[10px] text-muted-foreground uppercase">All Clear</div>
        </div>
      </div>
    </div>
  )
}
