"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { Mic, MicOff, Volume2 } from "lucide-react"

interface AudioWaveformProps {
  isListening: boolean
  intensity: number
  detectedEmotion?: string
}

export function AudioWaveform({ isListening, intensity, detectedEmotion }: AudioWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const [bars, setBars] = useState<number[]>(Array(32).fill(0.1))

  useEffect(() => {
    if (!isListening) {
      setBars(Array(32).fill(0.1))
      return
    }

    const animate = () => {
      setBars(prev => prev.map((_, i) => {
        const baseHeight = 0.1 + Math.random() * 0.3
        const intensityBoost = intensity * 0.6
        const waveEffect = Math.sin(Date.now() / 200 + i * 0.5) * 0.2
        return Math.min(1, baseHeight + intensityBoost + waveEffect)
      }))
      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isListening, intensity])

  const getIntensityColor = () => {
    if (intensity > 0.7) return "bg-destructive"
    if (intensity > 0.4) return "bg-warning"
    return "bg-primary"
  }

  const getGlowClass = () => {
    if (intensity > 0.7) return "glow-red"
    if (intensity > 0.4) return ""
    return "glow-cyan"
  }

  return (
    <div className={cn(
      "rounded-xl border border-border bg-white/80 backdrop-blur-sm shadow-sm p-6",
      isListening && intensity > 0.7 && "glow-destructive"
    )}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={cn(
            "p-2 rounded-lg",
            isListening ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
          )}>
            {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          </div>
          <div>
            <h3 className="text-sm font-medium text-foreground">Audio Monitor</h3>
            <p className="text-xs text-muted-foreground">
              {isListening ? "Listening..." : "Inactive"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs font-mono text-muted-foreground">
            {Math.round(intensity * 100)}%
          </span>
        </div>
      </div>

      {/* Waveform visualization */}
      <div className="relative h-24 bg-muted/30 rounded-lg overflow-hidden">
        {/* Scan line effect */}
        {isListening && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent animate-scan-line" />
          </div>
        )}
        
        {/* Bars */}
        <div className="absolute inset-0 flex items-end justify-around gap-0.5 p-2">
          {bars.map((height, i) => (
            <div
              key={i}
              className={cn(
                "w-full rounded-t transition-all duration-75",
                getIntensityColor()
              )}
              style={{
                height: `${height * 100}%`,
                opacity: 0.3 + height * 0.7
              }}
            />
          ))}
        </div>

        {/* Center line */}
        <div className="absolute top-1/2 inset-x-2 h-px bg-border" />
      </div>

      {/* Detected emotion */}
      {detectedEmotion && isListening && (
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Detected Pattern:</span>
          <span className={cn(
            "text-xs font-mono px-2 py-1 rounded-full",
            detectedEmotion === "PANIC" && "bg-destructive/20 text-destructive",
            detectedEmotion === "FEAR" && "bg-warning/20 text-warning",
            detectedEmotion === "NORMAL" && "bg-success/20 text-success",
            detectedEmotion === "STRESS" && "bg-warning/20 text-warning"
          )}>
            {detectedEmotion}
          </span>
        </div>
      )}

      {/* Audio levels */}
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="p-2 rounded-lg bg-muted/30">
          <div className="text-xs text-muted-foreground">Frequency</div>
          <div className="text-sm font-mono text-foreground">{Math.round(200 + intensity * 2000)} Hz</div>
        </div>
        <div className="p-2 rounded-lg bg-muted/30">
          <div className="text-xs text-muted-foreground">Decibels</div>
          <div className="text-sm font-mono text-foreground">{Math.round(30 + intensity * 70)} dB</div>
        </div>
        <div className="p-2 rounded-lg bg-muted/30">
          <div className="text-xs text-muted-foreground">Confidence</div>
          <div className="text-sm font-mono text-foreground">{Math.round(60 + intensity * 35)}%</div>
        </div>
      </div>
    </div>
  )
}
