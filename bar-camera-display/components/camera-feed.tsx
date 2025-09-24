"use client"

import { useState, useEffect, useRef } from "react"
import Hls from "hls.js"
import { Card } from "@/components/ui/card"

interface CameraFeedProps {
  title: string
  location: string
  streamUrl: string
}

export function CameraFeed({ title, location, streamUrl }: CameraFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isOnline, setIsOnline] = useState(false)
  const [resolution, setResolution] = useState<{ width: number; height: number } | null>(null)

  useEffect(() => {
    let hls: Hls | null = null
    const video = videoRef.current
    if (!video) return

    const updateResolution = () => {
      if (video.videoWidth && video.videoHeight) {
        setResolution({ width: video.videoWidth, height: video.videoHeight })
      }
    }

    video.addEventListener("loadedmetadata", updateResolution)
    video.addEventListener("resize", updateResolution)

    if (Hls.isSupported()) {
      hls = new Hls({
        liveSyncDuration: 3,
        liveMaxLatencyDuration: 5,
        maxBufferLength: 30,
      })
      hls.loadSource(streamUrl)
      hls.attachMedia(video)
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play()
        setIsOnline(true)
        setIsLoading(false)
      })
      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) setIsOnline(false)
      })
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl
      video.addEventListener("loadedmetadata", () => {
        video.play()
        setIsOnline(true)
        setIsLoading(false)
      })
      video.addEventListener("error", () => setIsOnline(false))
    }

    return () => {
      video.removeEventListener("loadedmetadata", updateResolution)
      video.removeEventListener("resize", updateResolution)
      if (hls) hls.destroy()
    }
  }, [streamUrl])

  return (
    <Card className="bg-card border-border overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-card-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{location}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-muted-foreground font-semibold">LIVE</span>
        </div>
      </div>

      {/* Video Player */}
      <div className="relative aspect-video bg-muted group">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm text-muted-foreground">Loading feed...</span>
            </div>
          </div>
        )}
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          controls
          autoPlay
          muted
          playsInline
        />
      </div>

      {/* Footer */}
      <footer className="pt-4 border-t border-border">
        <div className="flex items-center justify-between text-sm text-muted-foreground p-4">
          <div className="flex items-center gap-4">
            <span>{isOnline ? "System Online" : "Offline"}</span>
            <span>
              Resolution: {resolution ? `${resolution.width}x${resolution.height}` : "Loading..."}
            </span>
          </div>
        </div>
      </footer>


    </Card>
  )
}
