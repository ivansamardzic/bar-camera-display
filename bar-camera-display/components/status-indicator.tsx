"use client"

import { useState, useEffect } from "react"

export function StatusIndicator() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    // Simulate connection status check
    const checkConnection = () => {
      setIsOnline(navigator.onLine)
    }

    window.addEventListener("online", checkConnection)
    window.addEventListener("offline", checkConnection)

    return () => {
      window.removeEventListener("online", checkConnection)
      window.removeEventListener("offline", checkConnection)
    }
  }, [])

  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${isOnline ? "bg-success animate-pulse" : "bg-destructive"}`}></div>
      <span className="text-sm text-muted-foreground">{isOnline ? "Connected" : "Offline"}</span>
    </div>
  )
}
