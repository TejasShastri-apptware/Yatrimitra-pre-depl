# RTSP Streaming Kit

A standalone, containerized project for ingesting RTSP streams and serving them as MJPEG over HTTP.

## Features
- **Robust Ingestion**: Uses OpenCV with FFmpeg backend, forcing TCP transport to prevent H.264 decode errors.
- **MJPEG Streaming**: Served via FastAPI, compatible with standard `<img>` tags.
- **Easy Deployment**: Fully Dockerized with MediaMTX (RTSP server) and a sample stream publisher.

## Project Structure
- `src/stream_handler.py`: Core logic for managing RTSP connections.
- `src/main.py`: FastAPI application.
- `data/`: Directory for sample video files.
- `Dockerfile`: Container definition for the app.
- `docker-compose.yml`: Full environment setup.

## Getting Started

### 1. Prerequisites
- Docker and Docker Compose installed.

### 2. Setup
Place a sample video file in `data/sample.mp4` (one is already provided in this kit).

### 3. Run
```bash
docker-compose up --build
```

### 4. Access the Stream
Open your browser and navigate to:
`http://localhost:8000/api/stream?url=rtsp://rtsp-server:8554/mystream`

## Usage in Frontend
You can embed the live feed in any web page using a simple image tag:

```html
<img src="http://localhost:8000/api/stream?url=rtsp://rtsp-server:8554/mystream&fps=10" alt="Live Feed" />
```

## API Documentation
- `GET /api/stream`: The MJPEG stream endpoint.
  - `url`: (Optional) The RTSP URL to stream. Defaults to the environment variable `RTSP_URL`.
  - `fps`: (Optional) Target FPS for the output MJPEG stream.
- `GET /api/health`: Basic health check.

## Environment Variables
- `RTSP_URL`: The default RTSP stream to use if no `url` parameter is provided to the stream endpoint.
