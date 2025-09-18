"""
RTSP → MJPEG HTTP server (Windows-compatible)
---------------------------------------------

Serves an RTSP camera stream as Motion JPEG (multipart/x-mixed-replace) so you
can drop it into a simple <img> tag in any webpage.

Run on Windows:

  pip install -r requirements.txt
  # or: pip install fastapi uvicorn opencv-python python-dotenv

# PowerShell
  $env:RTSP_URL="rtsp://username:password@192.168.2.38:554/stream1"  # or set in .env
  uvicorn app:app --host 0.0.0.0 --port 8000

# CMD
  set RTSP_URL=rtsp://username:password@192.168.2.38:554/stream1
  uvicorn app:app --host 0.0.0.0 --port 8000
"""

import os
import time
import threading
from typing import Generator, Optional

import cv2  # type: ignore
from fastapi import FastAPI, Response, HTTPException
from fastapi.responses import HTMLResponse, StreamingResponse, PlainTextResponse
from starlette.concurrency import run_in_threadpool
from dotenv import load_dotenv

# Load .env if present
load_dotenv()

# --- Configuration from environment variables --------------------------------
RTSP_URL = os.environ.get("RTSP_URL", "")
FPS = float(os.environ.get("FPS", "10"))  # target output FPS for MJPEG
JPEG_QUALITY = int(os.environ.get("JPEG_QUALITY", "80"))  # 1..100
USE_TCP = os.environ.get("USE_TCP", "0") == "1"  # some cameras need TCP
REOPEN_DELAY_SEC = float(os.environ.get("REOPEN_DELAY_SEC", "2.0"))

if not RTSP_URL:
    print("[WARN] RTSP_URL not set. Set it via env var or .env file.")

# --- Threaded RTSP reader with auto-reconnect ---------------------------------
class RTSPReader:
    def __init__(self, url: str, use_tcp: bool = False):
        self.url = url
        self.use_tcp = use_tcp
        self.cap: Optional[cv2.VideoCapture] = None
        self.frame = None
        self.lock = threading.Lock()
        self.alive = False
        self.thread: Optional[threading.Thread] = None

    def _open(self) -> bool:
        url = self.url
        if self.use_tcp and "rtsp_transport" not in url and "?" not in url:
            url = f"{self.url}?rtsp_transport=tcp"
        cap = cv2.VideoCapture(url)
        if not cap.isOpened():
            return False
        self.cap = cap
        return True

    def start(self):
        if self.alive:
            return
        self.alive = True
        self.thread = threading.Thread(target=self._loop, daemon=True)
        self.thread.start()

    def stop(self):
        self.alive = False
        if self.thread and self.thread.is_alive():
            self.thread.join(timeout=2)
        if self.cap:
            self.cap.release()
            self.cap = None

    def _loop(self):
        while self.alive:
            if self.cap is None or not self.cap.isOpened():
                if not self._open():
                    time.sleep(REOPEN_DELAY_SEC)
                    continue
            ok, frame = self.cap.read()
            if not ok or frame is None:
                if self.cap:
                    self.cap.release()
                    self.cap = None
                time.sleep(REOPEN_DELAY_SEC)
                continue
            with self.lock:
                self.frame = frame

    def get_latest(self):
        with self.lock:
            return None if self.frame is None else self.frame.copy()


reader = RTSPReader(RTSP_URL, use_tcp=USE_TCP)
reader.start()

# --- FastAPI app ---------------------------------------------------------------
app = FastAPI(title="RTSP → MJPEG Server")

@app.on_event("shutdown")
async def _shutdown():
    reader.stop()

@app.get("/health", response_class=PlainTextResponse)
async def health():
    return "ok"

@app.get("/", response_class=HTMLResponse)
async def index():
    return f"""
    <!doctype html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>RTSP → MJPEG</title>
      <style>
        body {{ font-family: system-ui, Segoe UI, Roboto, sans-serif; padding: 20px; }}
        .wrap {{ max-width: 900px; margin: auto; }}
        img {{ width: 100%; height: auto; background: #000; }}
        code {{ background:#f4f4f4; padding:2px 4px; border-radius:4px; }}
      </style>
    </head>
    <body>
      <div class="wrap">
        <h1>RTSP → MJPEG</h1>
        <p>Embedding example: <code>&lt;img src="/mjpeg" /&gt;</code></p>
        <img src="/mjpeg" alt="MJPEG stream" />
      </div>
    </body>
    </html>
    """

def mjpeg_generator() -> Generator[bytes, None, None]:
    if not RTSP_URL:
        raise RuntimeError("RTSP_URL not configured")

    last_sent = 0.0
    min_interval = 1.0 / max(FPS, 0.1)

    while True:
        frame = reader.get_latest()
        if frame is None:
            time.sleep(0.01)
            continue

        now = time.time()
        if now - last_sent < min_interval:
            time.sleep(0.001)
            continue

        ok, buf = cv2.imencode(".jpg", frame, [int(cv2.IMWRITE_JPEG_QUALITY), JPEG_QUALITY])
        if not ok:
            continue
        jpg: bytes = buf.tobytes()

        boundary = b"--frame\r\n"
        headers = (
            b"Content-Type: image/jpeg\r\n" +
            f"Content-Length: {len(jpg)}\r\n\r\n".encode("ascii")
        )
        chunk = boundary + headers + jpg + b"\r\n"
        yield chunk
        last_sent = now

@app.get("/mjpeg")
async def mjpeg():
    if not RTSP_URL:
        raise HTTPException(status_code=500, detail="RTSP_URL not configured")

    return StreamingResponse(
        mjpeg_generator(),
        media_type="multipart/x-mixed-replace; boundary=frame",
        headers={
            "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
            "Pragma": "no-cache",
            "Expires": "0",
        },
    )

@app.get("/snapshot.jpg")
async def snapshot():
    frame = await run_in_threadpool(reader.get_latest)
    if frame is None:
        raise HTTPException(status_code=503, detail="No frame available yet")
    ok, buf = cv2.imencode(".jpg", frame, [int(cv2.IMWRITE_JPEG_QUALITY), JPEG_QUALITY])
    if not ok:
        raise HTTPException(status_code=500, detail="JPEG encoding failed")
    return Response(content=buf.tobytes(), media_type="image/jpeg")
