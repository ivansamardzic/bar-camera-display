import { CameraFeed } from "@/components/camera-feed"
import { StatusIndicator } from "@/components/status-indicator"

export default function BarCameraDisplay() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold text-foreground">Queen's University Bar Line Monitor</h1>
              <p className="text-muted-foreground mt-1">Live camera feeds showing current line status</p>
            </div>
          </div>
        </header>

        {/* Camera Feeds Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CameraFeed title="Stages & Ale Line" location="Princess St. Main Entrance" streamUrl="https://letsgetsendy.bouncedat.tech/cam/index.m3u8" />
          <CameraFeed title="Trin Line" location="Division St. Main Entrance" streamUrl="https://letsgetsendy.bouncedat.tech/cam/index.m3u8" />
        </div>

        {/* Footer Info */}
        <footer className="mt-12 pt-6 border-t border-border text-sm text-muted-foreground text-center">
          © 2025 Gooners LTD. All rights reserved.
          
        </footer>
      </div>
    </div>
  )
}
