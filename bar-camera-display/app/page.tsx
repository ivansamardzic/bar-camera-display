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
              <h1 className="text-2xl md:text-3xl font-semibold text-foreground">Bar Line Monitor</h1>
              <p className="text-muted-foreground mt-1">Live camera feeds showing current line status</p>
            </div>
            <div className="flex items-center gap-4">
              <StatusIndicator />
              <div className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleTimeString()}</div>
            </div>
          </div>
        </header>

        {/* Camera Feeds Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CameraFeed title="Stages/Ale Line" location="Main Entrance" streamUrl="http://localhost:8000/mjpeg" />
          <CameraFeed title="Trin Line" location="Side Entrance" streamUrl="http://localhost:8000/mjpeg" />
        </div>

        {/* Footer Info */}
        <footer className="mt-12 pt-6 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <div>Feeds refresh automatically every 30 seconds</div>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                System Online
              </span>
              <span>Resolution: 640x480</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
