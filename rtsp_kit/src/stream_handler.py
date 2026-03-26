import os
import cv2
import logging
import threading
import shutil
import subprocess
from urllib.parse import urlparse

logger = logging.getLogger(__name__)

_RTSP_FFMPEG_CAPTURE_OPTIONS = "rtsp_transport;tcp|stimeout;5000000"
_FFMPEG_ENV_LOCK = threading.Lock()


def ensure_rtsp_ffmpeg_options() -> None:
    """Set RTSP FFmpeg capture options exactly once in a threadsafe way."""
    with _FFMPEG_ENV_LOCK:
        if os.environ.get("OPENCV_FFMPEG_CAPTURE_OPTIONS") != _RTSP_FFMPEG_CAPTURE_OPTIONS:
            os.environ["OPENCV_FFMPEG_CAPTURE_OPTIONS"] = _RTSP_FFMPEG_CAPTURE_OPTIONS


class StreamHandler:
    """Manages an RTSP/video stream connection."""

    def __init__(self, rtsp_url: str):
        self.rtsp_url = rtsp_url
        self._cap: cv2.VideoCapture | None = None
        self.last_open_error: str | None = None

    def _diagnose_open_failure(self) -> str:
        hints: list[str] = []
        parsed = urlparse(self.rtsp_url)

        if parsed.scheme.lower() == "rtsp":
            if not parsed.netloc:
                hints.append("RTSP URL is missing a host")
            if parsed.path in ("", "/"):
                hints.append("RTSP URL is missing a stream path")

        ffprobe_path = shutil.which("ffprobe")
        if ffprobe_path:
            try:
                result = subprocess.run(
                    [
                        ffprobe_path,
                        "-v",
                        "error",
                        "-rtsp_transport",
                        "tcp",
                        "-rw_timeout",
                        "5000000",
                        "-i",
                        self.rtsp_url,
                        "-show_entries",
                        "stream=index",
                        "-of",
                        "json",
                    ],
                    capture_output=True,
                    text=True,
                    timeout=8,
                )
                stderr = (result.stderr or "").strip()
                if stderr:
                    hints.append(f"ffprobe: {stderr}")
            except subprocess.TimeoutExpired:
                hints.append("ffprobe: probe timed out")
            except Exception as exc:
                hints.append(f"ffprobe unavailable during probe: {exc}")

        if parsed.scheme.lower() == "rtsp":
            hints.append(
                "common causes: wrong RTSP path, stream publisher not running, authentication mismatch, or server exposing a different mount name"
            )

        return "; ".join(hints)

    def open(self) -> bool:
        if self.rtsp_url.lower().startswith("rtsp://"):
            ensure_rtsp_ffmpeg_options()

        self._cap = cv2.VideoCapture(self.rtsp_url, cv2.CAP_FFMPEG)
        self._cap.set(cv2.CAP_PROP_OPEN_TIMEOUT_MSEC, 10_000)
        self._cap.set(cv2.CAP_PROP_READ_TIMEOUT_MSEC, 10_000)
        self._cap.set(cv2.CAP_PROP_BUFFERSIZE, 3)

        if not self._cap.isOpened():
            self.last_open_error = self._diagnose_open_failure()
            return False
        self.last_open_error = None
        logger.info("Stream opened: %s", self.rtsp_url)
        return True

    def read_frame(self):
        if self._cap is None or not self._cap.isOpened():
            return None
        ret, frame = self._cap.read()
        return frame if ret else None

    def release(self):
        if self._cap is not None:
            self._cap.release()
            self._cap = None
            logger.info("Stream released: %s", self.rtsp_url)