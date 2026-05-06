"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface RiskMeterProps {
  riskLevel: "low" | "medium" | "high"
  riskScore: number
}

export function RiskMeter({ riskLevel, riskScore }: RiskMeterProps) {
  const [animatedScore, setAnimatedScore] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(riskScore)
    }, 100)
    return () => clearTimeout(timer)
  }, [riskScore])

  const getRiskColor = () => {
    switch (riskLevel) {
      case "low":
        return "text-success"
      case "medium":
        return "text-warning"
      case "high":
        return "text-destructive"
    }
  }

  const getRiskGlow = () => {
    switch (riskLevel) {
      case "low":
        return "glow-green"
      case "medium":
        return ""
      case "high":
        return "glow-red animate-pulse-glow"
    }
  }

  const getGradient = () => {
    switch (riskLevel) {
      case "low":
        return "from-success/20 to-success/5"
      case "medium":
        return "from-warning/20 to-warning/5"
      case "high":
        return "from-destructive/20 to-destructive/5"
    }
  }

  return (
    <div className={cn(
      "relative rounded-xl border border-border bg-white/80 backdrop-blur-sm shadow-sm p-6",
      getRiskGlow()
    )}>
      {/* Background gradient */}
      <div className={cn(
        "absolute inset-0 rounded-xl bg-gradient-to-br opacity-50",
        getGradient()
      )} />
      
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Risk Assessment
          </h3>
          <span className={cn(
            "text-xs font-mono px-2 py-1 rounded-full border",
            riskLevel === "low" && "border-success/50 bg-success/10 text-success",
            riskLevel === "medium" && "border-warning/50 bg-warning/10 text-warning",
            riskLevel === "high" && "border-destructive/50 bg-destructive/10 text-destructive"
          )}>
            {riskLevel.toUpperCase()}
          </span>
        </div>

        {/* Circular gauge */}
        <div className="flex justify-center mb-4">
          <div className="relative w-40 h-40">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-muted/30"
              />
              {/* Progress circle */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={251.2}
                strokeDashoffset={251.2 - (251.2 * animatedScore) / 100}
                className={cn(
                  "transition-all duration-1000 ease-out",
                  getRiskColor()
                )}
              />
            </svg>
            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={cn(
                "text-4xl font-bold font-mono",
                getRiskColor()
              )}>
                {Math.round(animatedScore)}
              </span>
              <span className="text-xs text-muted-foreground">SCORE</span>
            </div>
          </div>
        </div>

        {/* Risk indicators */}
        <div className="flex justify-between text-xs">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-success" />
            <span className="text-muted-foreground">Safe</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-warning" />
            <span className="text-muted-foreground">Caution</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-destructive" />
            <span className="text-muted-foreground">Danger</span>
          </div>
        </div>
      </div>
    </div>
  )
}
