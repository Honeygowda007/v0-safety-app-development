"use client"

import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Shield, Clock, MapPin, AlertTriangle } from "lucide-react"

interface SafetyAnalyticsProps {
  data: {
    totalMonitoringHours: number
    alertsThisWeek: number
    safetyScore: number
    averageResponseTime: number
    locationsVisited: number
    trendsUp: boolean
  }
}

export function SafetyAnalytics({ data }: SafetyAnalyticsProps) {
  const stats = [
    {
      label: "Total Monitoring",
      value: `${data.totalMonitoringHours}h`,
      icon: Clock,
      description: "This month",
      trend: data.trendsUp ? "up" : "stable"
    },
    {
      label: "Alerts Detected",
      value: data.alertsThisWeek,
      icon: AlertTriangle,
      description: "This week",
      trend: data.alertsThisWeek > 3 ? "warning" : "good"
    },
    {
      label: "Safety Score",
      value: `${data.safetyScore}%`,
      icon: Shield,
      description: "Based on patterns",
      trend: data.safetyScore > 80 ? "good" : data.safetyScore > 50 ? "warning" : "danger"
    },
    {
      label: "Response Time",
      value: `${data.averageResponseTime}s`,
      icon: TrendingUp,
      description: "Avg. confirmation",
      trend: data.averageResponseTime < 5 ? "good" : "warning"
    }
  ]

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Safety Analytics
        </h3>
        <div className="flex items-center gap-1 text-xs">
          {data.trendsUp ? (
            <>
              <TrendingUp className="w-3 h-3 text-success" />
              <span className="text-success">Improving</span>
            </>
          ) : (
            <>
              <TrendingDown className="w-3 h-3 text-warning" />
              <span className="text-warning">Monitor</span>
            </>
          )}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, i) => (
          <div
            key={i}
            className={cn(
              "p-3 rounded-lg border",
              stat.trend === "good" && "bg-success/5 border-success/30",
              stat.trend === "warning" && "bg-warning/5 border-warning/30",
              stat.trend === "danger" && "bg-destructive/5 border-destructive/30",
              stat.trend === "up" && "bg-primary/5 border-primary/30",
              stat.trend === "stable" && "bg-muted/30 border-border"
            )}
          >
            <div className="flex items-center gap-2 mb-1">
              <stat.icon className={cn(
                "w-3.5 h-3.5",
                stat.trend === "good" && "text-success",
                stat.trend === "warning" && "text-warning",
                stat.trend === "danger" && "text-destructive",
                stat.trend === "up" && "text-primary",
                stat.trend === "stable" && "text-muted-foreground"
              )} />
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
            <div className="text-xl font-bold text-foreground">{stat.value}</div>
            <div className="text-[10px] text-muted-foreground">{stat.description}</div>
          </div>
        ))}
      </div>

      {/* Weekly chart placeholder */}
      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider">
          Weekly Activity
        </p>
        <div className="flex items-end justify-between h-16 gap-1">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => {
            const height = [40, 60, 30, 80, 50, 20, 45][i]
            return (
              <div key={day} className="flex-1 flex flex-col items-center gap-1">
                <div 
                  className={cn(
                    "w-full rounded-t transition-all",
                    height > 70 ? "bg-warning" : "bg-primary"
                  )}
                  style={{ height: `${height}%` }}
                />
                <span className="text-[10px] text-muted-foreground">{day}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Insights */}
      <div className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/30">
        <p className="text-xs text-foreground">
          <strong className="text-primary">AI Insight:</strong> Your safety patterns are consistent. 
          Peak activity detected during evening hours. Consider enabling silent mode after 10 PM.
        </p>
      </div>
    </div>
  )
}
