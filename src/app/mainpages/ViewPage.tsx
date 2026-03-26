import React, { useRef, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import type { Camera, FloorPlanElement, Point, Room } from '../types/floorplan';
import { drawGrid, drawRoom, drawDoor,drawWindow, drawCamera,  drawWall, drawPencilPath, drawTextBlock,} from '../utils/drawing';
import { COLORS, MIN_ZOOM, MAX_ZOOM, ZOOM_STEP } from '../utils/constants';

interface StreamModalProps {
    camera: Camera;
    roomName: string | null;
    onClose: () => void;
}

function StreamModal({ camera, roomName, onClose }: StreamModalProps) {
    return (
        <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-slate-900 rounded-2xl p-6 md:p-10 w-full max-w-6xl relative shadow-2xl border border-slate-800"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <h2 className="text-3xl font-light text-white mb-8">
                    Camera Feed: <span className="font-mono text-blue-400">CAM-{camera.id.slice(0, 6).toUpperCase()}</span>
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Details */}
                    <div className="lg:col-span-4 space-y-8 order-2 lg:order-1">
                        <div className="bg-slate-800/40 p-6 rounded-xl border border-slate-700/50 space-y-6">
                            <div>
                                <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">Camera ID</p>
                                <p className="text-white font-mono">{camera.id}</p>
                            </div>
                            <div>
                                <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">Status</p>
                                <div className="flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                    <p className="text-white font-medium">Online / Active</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">Location</p>
                                <p className="text-white text-lg">{roomName ?? 'Unassigned / External'}</p>
                            </div>
                            <div>
                                <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">Rotation Angle</p>
                                <p className="text-white font-mono text-lg">{camera.rotation}°</p>
                            </div>
                        </div>
                    </div>

                    {/* Stream */}
                    <div className="lg:col-span-8 order-1 lg:order-2">
                        <div className="w-full aspect-video bg-black rounded-xl border border-slate-800 relative overflow-hidden shadow-inner">
                            <div className="absolute inset-0 bg-linear-to-br from-blue-900/10 to-transparent" />

                            {/* HUD */}
                            <div className="absolute top-4 left-4 flex items-center gap-3">
                                <div className="bg-red-600 px-2 py-0.5 rounded text-[10px] font-bold text-white tracking-tighter">REC</div>
                                <div className="text-white/50 font-mono text-xs uppercase tracking-tighter">
                                    {new Date().toISOString()}
                                </div>
                            </div>

                            <div className="flex flex-col items-center justify-center h-full">
                                {camera.rtspUrl ? (
                                    <img 
                                        src={`http://localhost:8000/api/stream?url=${encodeURIComponent(camera.rtspUrl)}&fps=15`}
                                        alt="Live Feed"
                                        className="w-full h-full object-contain"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = ''; // Clear src on error
                                            (e.target as HTMLImageElement).parentElement!.innerHTML = `
                                                <div class="flex flex-col items-center justify-center h-full text-red-400 font-mono text-xs p-4 text-center">
                                                    <svg class="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                    </svg>
                                                    STREAM CONNECTION FAILED<br/>
                                                    <span class="text-slate-500 mt-1">${camera.rtspUrl}</span>
                                                </div>
                                            `;
                                        }}
                                    />
                                ) : (
                                    <>
                                        <div className="text-slate-500 font-mono text-sm tracking-[0.2em]">
                                            NO RTSP URL ASSIGNED
                                        </div>
                                        <div className="mt-2 text-slate-700 text-xs font-mono uppercase">
                                            ID: {camera.id}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// view-only gng

interface ViewCanvasProps {
    elements: FloorPlanElement[];
    zoom: number;
    panOffset: Point;
    setPanOffset: React.Dispatch<React.SetStateAction<Point>>;
    onZoomChange: (z: number) => void;
    onCameraClick: (camera: Camera) => void;
    hoveredCameraId: string | null;
    setHoveredCameraId: (id: string | null) => void;
}

function ViewCanvas({elements,zoom,panOffset,setPanOffset,onZoomChange,onCameraClick,
    hoveredCameraId,
    setHoveredCameraId,
}: ViewCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isPanning, setIsPanning] = useState(false);
    const [panStart, setPanStart] = useState<Point | null>(null);

    // Render
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        ctx.fillStyle = COLORS.background;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        drawGrid(ctx, canvas.width, canvas.height, panOffset, zoom);

        elements.forEach((el) => {
            const isHovered = el.type === 'camera' && el.id === hoveredCameraId;
            switch (el.type) {
                case 'room': drawRoom(ctx, el, panOffset, false, zoom); break;
                case 'door': drawDoor(ctx, el, panOffset, false, zoom); break;
                case 'window': drawWindow(ctx, el, panOffset, false, zoom); break;
                case 'camera': drawCamera(ctx, el, panOffset, isHovered, zoom); break;
                case 'wall': drawWall(ctx, el, panOffset, false, zoom); break;
                case 'pencil': drawPencilPath(ctx, el, panOffset, false, zoom); break;
                case 'text': drawTextBlock(ctx, el, panOffset, false, zoom); break;
            }
        });
    }, [elements, zoom, panOffset, hoveredCameraId]);

    const getPoint = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
        const rect = canvasRef.current!.getBoundingClientRect();
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const getCameraAtPoint = (point: Point): Camera | null => {
        const cameras = elements.filter((el): el is Camera => el.type === 'camera');
        return cameras.find((cam) => {
            const dx = point.x - (cam.x * zoom + panOffset.x);
            const dy = point.y - (cam.y * zoom + panOffset.y);
            return Math.sqrt(dx * dx + dy * dy) < 20 * zoom;
        }) ?? null;
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (e.button === 1 || e.altKey) {
            setIsPanning(true);
            setPanStart(getPoint(e));
        }
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const point = getPoint(e);

        if (isPanning && panStart) {
            setPanOffset(prev => ({
                x: prev.x + (point.x - panStart.x),
                y: prev.y + (point.y - panStart.y),
            }));
            setPanStart(point);
            return;
        }

        const cam = getCameraAtPoint(point);
        setHoveredCameraId(cam?.id ?? null);
    };

    const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (isPanning) {
            setIsPanning(false);
            setPanStart(null);
            return;
        }
        const point = getPoint(e);
        const cam = getCameraAtPoint(point);
        if (cam) onCameraClick(cam);
    };

    const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
        onZoomChange(Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom + delta)));
    };

    return (
        <canvas
            ref={canvasRef}
            className="w-full h-full"
            style={{ cursor: hoveredCameraId ? 'pointer' : isPanning ? 'grabbing' : 'default' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onWheel={handleWheel}
        />
    );
}

// viewpage

export default function ViewPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [zoom, setZoom] = useState(1);
    const [panOffset, setPanOffset] = useState<Point>({ x: 0, y: 0 });
    const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
    const [hoveredCameraId, setHoveredCameraId] = useState<string | null>(null);

    const savedDiagrams = JSON.parse(localStorage.getItem('diagrams') || '[]');
    const diagram = savedDiagrams.find((d: any) => d.id === id);

    if (!diagram) {
        return (
            <div className="h-screen flex items-center justify-center bg-slate-950 text-slate-400">
                Diagram not found.{' '}
                <button onClick={() => navigate('/')} className="ml-2 text-blue-400 hover:underline">
                    Go back
                </button>
            </div>
        );
    }

    const elements: FloorPlanElement[] = diagram.elements || [];
    const rooms = elements.filter((el): el is Room => el.type === 'room');
    const roomMap: Record<string, Room> = {};
    rooms.forEach(r => { roomMap[r.id] = r; });

    const cameraCount = elements.filter(el => el.type === 'camera').length;

    return (
        <div className="h-screen flex flex-col bg-slate-950">
            {/* Header */}
            <div className="bg-slate-900 border-b border-slate-700 px-6 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(`/post/${id}`)}
                        className="text-slate-400 hover:text-white transition-colors"
                        title="Back to Post Dashboard"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m15 18-6-6 6-6" />
                        </svg>
                    </button>
                    <div>
                        <h1 className="text-xl text-white font-light">{diagram.name || 'Untitled Blueprint'}</h1>
                        <p className="text-xs text-slate-500 font-mono uppercase tracking-widest">View-Only Mode</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Camera count badge */}
                    <div className="bg-green-600/20 text-green-400 px-3 py-1 rounded border border-green-600/30 text-sm font-mono">
                        {cameraCount} camera{cameraCount !== 1 ? 's' : ''}
                    </div>

                    {/* Zoom controls */}
                    <div className="flex items-center gap-1 bg-slate-800 rounded-lg border border-slate-700 px-1">
                        <button
                            onClick={() => setZoom(z => Math.max(MIN_ZOOM, z - ZOOM_STEP))}
                            className="p-2 text-slate-400 hover:text-white transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14" /></svg>
                        </button>
                        <span className="text-slate-400 text-xs font-mono w-12 text-center">{Math.round(zoom * 100)}%</span>
                        <button
                            onClick={() => setZoom(z => Math.min(MAX_ZOOM, z + ZOOM_STEP))}
                            className="p-2 text-slate-400 hover:text-white transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                        </button>
                        <button
                            onClick={() => setZoom(1)}
                            className="p-2 text-slate-400 hover:text-white transition-colors text-xs font-mono"
                            title="Reset zoom"
                        >
                            1:1
                        </button>
                    </div>

                    <button
                        onClick={() => navigate(`/editor/${id}`)}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500 transition-all text-sm font-medium flex items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
                        Edit
                    </button>
                </div>
            </div>

            {/* Hint bar */}
            <div className="bg-slate-900/60 border-b border-slate-800 px-6 py-1.5 text-xs text-slate-500 flex items-center gap-4 shrink-0">
                <span className="flex items-center gap-1.5">
                    <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
                    Click a camera on the canvas to view its feed
                </span>
                <span>•</span>
                <span>Scroll to zoom • Alt+drag to pan</span>
            </div>

            {/* Canvas */}
            <div className="flex-1 relative overflow-hidden">
                <ViewCanvas
                    elements={elements}
                    zoom={zoom}
                    panOffset={panOffset}
                    setPanOffset={setPanOffset}
                    onZoomChange={setZoom}
                    onCameraClick={setSelectedCamera}
                    hoveredCameraId={hoveredCameraId}
                    setHoveredCameraId={setHoveredCameraId}
                />
            </div>

            {/* Footer */}
            <div className="bg-slate-900 border-t border-slate-700 px-6 py-2 text-xs text-slate-500 flex items-center justify-between shrink-0">
                <div>View-Only Mode • Zoom: {Math.round(zoom * 100)}%</div>
                <div className="text-slate-600 font-mono">READ ONLY</div>
            </div>

            {/* Stream Modal */}
            {selectedCamera && (
                <StreamModal
                    camera={selectedCamera}
                    roomName={
                        selectedCamera.roomId && roomMap[selectedCamera.roomId]?.name
                            ? roomMap[selectedCamera.roomId].name!
                            : null
                    }
                    onClose={() => setSelectedCamera(null)}
                />
            )}
        </div>
    );
}
