"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"

interface CameraFeedProps {
  title: string
  location: string
  streamUrl: string
}

export function CameraFeed({ title, location, streamUrl }: CameraFeedProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 1000)

    // Auto-refresh every 30 seconds
    const refreshInterval = setInterval(() => {
      setLastUpdate(new Date())
    }, 30000)

    return () => {
      clearTimeout(timer)
      clearInterval(refreshInterval)
    }
  }, [])

  return (
    <Card className="bg-card border-border overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-card-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground">{location}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
            <span className="text-xs text-muted-foreground">LIVE</span>
          </div>
        </div>
      </div>

      {/* Camera Feed */}
      <div className="relative aspect-video bg-muted">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm text-muted-foreground">Loading feed...</span>
            </div>
          </div>
        ) : (
          <img
            src={streamUrl || "/placeholder.svg"}
            alt={`${title} camera feed`}
            className="w-full h-full object-cover"
            onLoad={() => setIsLoading(false)}
          />
        )}

        {/* Overlay Info
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <div className="flex items-center justify-between text-white text-sm">
            <span className="font-mono">{lastUpdate.toLocaleTimeString()}</span>
            <span className="bg-black/40 px-2 py-1 rounded text-xs">640x480</span>
          </div>
        </div> */}
      </div>

      {/* Status Bar */}
      <div className="p-3 bg-muted/50 border-t border-border">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground">Status:</span>
            <span className="text-success">Active</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground">Quality:</span>
            <span className="text-foreground">HD</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
