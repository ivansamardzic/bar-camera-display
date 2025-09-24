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
  const [isLoading, setIsLoading] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    let hls: Hls | null = null

    if (videoRef.current) {
      if (Hls.isSupported()) {
        hls = new Hls()
        hls.loadSource(streamUrl)
        hls.attachMedia(videoRef.current)
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          videoRef.current?.play()
          setIsLoading(false)
        })
      } else if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
        // Safari natively supports HLS
        videoRef.current.src = streamUrl
        videoRef.current.addEventListener("loadedmetadata", () => {
          videoRef.current?.play()
          setIsLoading(false)
        })
      }
    }

    return () => {
      if (hls) {
        hls.destroy()
      }
    }
  }, [streamUrl])

  return (
    <Card className="bg-card border-border overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-card-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{location}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
          <span className="text-xs text-muted-foreground">LIVE</span>
        </div>
      </div>

      <div className="relative aspect-video bg-muted">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm text-muted-foreground">Loading feed...</span>
            </div>
          </div>
        )}
        <video ref={videoRef} className="w-full h-full object-cover" controls muted />
      </div>
    </Card>
  )
}
