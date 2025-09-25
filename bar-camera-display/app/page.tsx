"use client"

import { useState } from "react"
import { CameraFeed } from "@/components/camera-feed"
import DarkModeToggle from "@/components/ui/darkmode"

export default function BarCameraDisplay() {
  const cameras = [
    {
      id: 1,
      title: "Stages & Ale Line",
      location: "Princess St. Main Entrance",
      streamUrl: "https://letsgetsendy.bouncedat.tech/ale/index.m3u8",
    },
    {
      id: 2,
      title: "Trin Line",
      location: "Division St. Main Entrance",
      streamUrl: "https://letsgetsendy.bouncedat.tech/trin/index.m3u8",
    },
  ]

  const [currentCamera, setCurrentCamera] = useState(cameras[0])
  const [menuOpen, setMenuOpen] = useState(false)

  // Track online status
  const [cameraStatuses, setCameraStatuses] = useState<Record<number, boolean>>(
    cameras.reduce((acc, cam) => ({ ...acc, [cam.id]: false }), {})
  )

  // Track resolutions
  const [cameraResolutions, setCameraResolutions] = useState<Record<number, string>>(
    cameras.reduce((acc, cam) => ({ ...acc, [cam.id]: "Loading..." }), {})
  )

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 relative">
      <DarkModeToggle />
      <div className="mx-auto max-w-7xl relative">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-foreground">BarBud</h1>
            <p className="text-muted-foreground mt-1">
              Live camera feeds showing current line status
            </p>
          </div>

          {/* Hamburger */}
          <button
            className="flex flex-col justify-between w-6 h-6 md:hidden z-30"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span className="block h-0.5 w-full bg-foreground"></span>
            <span className="block h-0.5 w-full bg-foreground"></span>
            <span className="block h-0.5 w-full bg-foreground"></span>
          </button>
        </header>

        <div className="md:flex md:gap-6">
          {/* Sidebar */}
          <div
            className={`
              md:w-64 bg-card border-r border-border p-4 rounded-md
              fixed top-0 left-0 h-full z-20 transition-transform duration-300
              ${menuOpen ? "translate-x-0" : "-translate-x-full"}
              md:relative md:translate-x-0 md:h-auto md:border-none
            `}
          >
            <h2 className="text-lg font-medium mb-4 hidden md:block">Select Camera</h2>
            <div className="flex flex-col gap-3">
              {cameras.map((cam) => (
                <div
                  key={cam.id}
                  onClick={() => {
                    setCurrentCamera(cam)
                    setMenuOpen(false)
                  }}
                  className={`
                    p-3 rounded-lg shadow-md cursor-pointer transition-all duration-200
                    hover:shadow-xl hover:bg-muted/30
                    ${currentCamera.id === cam.id ? "bg-muted/40 border border-primary" : "bg-card"}
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-card-foreground">{cam.title}</h3>
                      <p className="text-sm text-muted-foreground">{cam.location}</p>
                    </div>

                    {/* Connection Bars + Status */}
                    <div className="flex flex-col items-center gap-1 ml-2">
                      <div className="flex items-end gap-0.5">
                        {[1, 2, 3, 4].map((bar) => (
                          <div
                            key={bar}
                            className={`w-1 rounded-sm ${
                              cameraStatuses[cam.id] ? "bg-green-500" : "bg-gray-300"
                            }`}
                            style={{ height: `${bar * 4}px` }}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {cameraStatuses[cam.id] ? "Online" : "Offline"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {cameraResolutions[cam.id]}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Overlay */}
          {menuOpen && <div className="fixed inset-0 bg-black/30 z-10 md:hidden" onClick={() => setMenuOpen(false)} />}

          {/* Camera Feed */}
          <div className="flex-1 mt-6 md:mt-0">
            <CameraFeed
              key={currentCamera.id}
              title={currentCamera.title}
              location={currentCamera.location}
              streamUrl={currentCamera.streamUrl}
              onStatusChange={(status) =>
                setCameraStatuses((prev) => ({ ...prev, [currentCamera.id]: status }))
              }
              onResolutionChange={(res) =>
                setCameraResolutions((prev) => ({ ...prev, [currentCamera.id]: res }))
              }
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-border text-sm text-muted-foreground text-center">
          © 2025 Gooners LTD. All rights reserved.
        </footer>
      </div>
    </div>
  )
}
