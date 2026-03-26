import os
import time
import logging
import cv2
from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import StreamingResponse
from .stream_handler import StreamHandler, ensure_rtsp_ffmpeg_options

from fastapi.middleware.cors import CORSMiddleware

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="RTSP Streaming Kit")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Get default RTSP URL from environment
DEFAULT_RTSP_URL = os.getenv("RTSP_URL", "rtsp://localhost:8554/mystream")


def _mjpeg_generator(rtsp_url: str, fps: float):
    """Open the RTSP stream and yield MJPEG frames."""
    handler = StreamHandler(rtsp_url)
    
    if not handler.open():
        logger.error(f"MJPEG: Could not open stream {rtsp_url}. Error: {handler.last_open_error}")
        return

    min_interval = 1.0 / max(fps, 1.0)
    last_yield = 0.0

    try:
        while True:
            frame = handler.read_frame()
            if frame is None:
                # Attempt to reconnect once if a frame is missed
                logger.warning("Missed frame, attempting to reconnect...")
                handler.release()
                time.sleep(1)
                if not handler.open():
                    break
                continue

            now = time.time()
            if now - last_yield < min_interval:
                continue
            
            last_yield = now
            ok, buf = cv2.imencode(".jpg", frame, [cv2.IMWRITE_JPEG_QUALITY, 75])
            if not ok:
                continue
                
            yield (
                b"--frame\r\n"
                b"Content-Type: image/jpeg\r\n\r\n"
                + buf.tobytes()
                + b"\r\n"
            )
    finally:
        handler.release()


@app.get("/api/stream")
def stream_camera(
    url: str = Query(default=DEFAULT_RTSP_URL),
    fps: float = Query(default=10.0, ge=1.0, le=30.0),
):
    """
    MJPEG live stream for a given RTSP URL.
    Usage: <img src="/api/stream?url=rtsp://...">
    """
    return StreamingResponse(
        _mjpeg_generator(url, fps),
        media_type="multipart/x-mixed-replace; boundary=frame",
    )


@app.get("/api/health")
def health_check():
    return {"status": "healthy", "timestamp": time.time()}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
