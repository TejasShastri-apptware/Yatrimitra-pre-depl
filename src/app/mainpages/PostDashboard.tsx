import { useState } from "react";
import { useNavigate } from "react-router";
import CamCard from "../components/CamCard";
import { Camera, Room, FloorPlanElement } from "../types/floorplan";

interface PostDashboardProps {
    diagram: {
        id: string;
        name: string;
        elements: FloorPlanElement[];
        updatedAt: number;
    };
    onEdit: () => void;
    onView?: () => void;
}

const PostDashboard = ({ diagram, onEdit, onView }: PostDashboardProps) => {
    const navigate = useNavigate();
    const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);

    const handleView = onView ?? (() => navigate(`/view/${diagram.id}`));

    const elements = diagram.elements || [];
    const rooms = elements.filter((el): el is Room => el.type === "room");
    const cameras = elements.filter((el): el is Camera => el.type === "camera");

    // Build room lookup map
    const roomMap: Record<string, Room> = {};
    rooms.forEach(room => {
        roomMap[room.id] = room;
    });

    // Group cameras by roomId
    const camerasByRoom: Record<string, Camera[]> = {};
    const unassignedCameras: Camera[] = [];

    cameras.forEach(camera => {
        if (camera.roomId) {
            if (!camerasByRoom[camera.roomId]) {
                camerasByRoom[camera.roomId] = [];
            }
            camerasByRoom[camera.roomId].push(camera);
        } else {
            unassignedCameras.push(camera);
        }
    });

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200">
            <div className="mx-auto">
                {/* Header */}
                <div className="sticky top-0 z-50 bg-slate-950">
                    <header className="border-b-[0.2px] border-slate-500 flex flex-col md:flex-row md:items-end justify-between gap-6 mb-2 pb-4 ">
                    <div className="p-8">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded">
                                YatriMitra Camera Dashboard
                            </span>
                        </div>
                        <h1 className="text-5xl font-bold tracking-tight text-white">
                            {diagram.name || "Untitled Blueprint"}
                        </h1>
                        <div className="flex items-center gap-4 mt-3 text-sm text-slate-400">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                                <span>System Active</span>
                            </div>
                            <span className="text-slate-700">•</span>
                            <span>{cameras.length} Cameras</span>
                            <span className="text-slate-700">•</span>
                            <span>{rooms.length} Zones</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-10 pt-1">
                        <button
                            onClick={handleView}
                            className="group flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-300 bg-slate-900/50 border border-slate-800 rounded-xl hover:bg-slate-800 hover:text-white hover:border-slate-700 transition-all duration-200"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500 group-hover:text-blue-400 transition-colors"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
                            Open floor map
                        </button>
                        <button
                            onClick={onEdit}
                            className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-500 shadow-lg shadow-blue-600/20 transition-all duration-200 active:scale-[0.98]"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
                            Edit Blueprint
                        </button>
                    </div>
                </header>
                </div>

                {/* Rooms */}
                <div className="space-y-12 p-8">
                    {rooms.map(room => {
                        const roomCameras = camerasByRoom[room.id] || [];
                        if (roomCameras.length === 0) return null;

                        const alertStatus = room.currentPopulation !== undefined && room.redAlertCapacity !== undefined && room.currentPopulation >= room.redAlertCapacity 
                            ? 'red' 
                            : room.currentPopulation !== undefined && room.orangeAlertCapacity !== undefined && room.currentPopulation >= room.orangeAlertCapacity 
                                ? 'orange' 
                                : 'normal';

                        return (
                            <div key={room.id}>
                                <div className="flex items-center gap-6 mb-6">
                                    <div className="flex items-center gap-4">
                                        <h2 className="text-xl font-medium text-blue-400 text-[25px] uppercase tracking-widest px-2">
                                            {room.name ?? "Unnamed Room, Room ID : " + room.id}
                                        </h2>
                                        {alertStatus !== 'normal' && (
                                            <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${
                                                alertStatus === 'red' 
                                                ? 'bg-red-500/10 border-red-500/50 text-red-500' 
                                                : 'bg-orange-500/10 border-orange-500/50 text-orange-500'
                                            }`}>
                                                <span className={`w-2 h-2 rounded-full ${
                                                    alertStatus === 'red' ? 'bg-red-500 animate-pulse' : 'bg-orange-500'
                                                }`} />
                                                <span className="text-[10px] font-bold uppercase tracking-wider">
                                                    {alertStatus === 'red' ? 'Red Alert' : 'Orange Alert'}
                                                </span>
                                            </div>
                                        )}
                                        {room.currentPopulation !== undefined && (
                                            <span className="text-slate-500 text-sm font-mono bg-slate-800/50 px-2 py-0.5 rounded border border-slate-700">
                                                Pop: {room.currentPopulation}
                                            </span>
                                        )}
                                    </div>
                                    <div className="h-px flex-1 bg-slate-600"></div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                    {roomCameras.map(camera => (
                                        <CamCard
                                            key={camera.id}
                                            camera={camera}
                                            onClick={() => setSelectedCamera(camera)}
                                        />
                                    ))}
                                </div>
                            </div>
                        );
                    })}

                    {/* Unassigned Cameras */}
                    {unassignedCameras.length > 0 && (
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="h-px flex-1 bg-slate-800"></div>
                                <h2 className="text-xl font-medium text-slate-400 uppercase tracking-widest px-4">
                                    External / Unassigned
                                </h2>
                                <div className="h-px flex-1 bg-slate-800"></div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {unassignedCameras.map(camera => (
                                    <CamCard
                                        key={camera.id}
                                        camera={camera}
                                        onClick={() => setSelectedCamera(camera)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* No Cameras */}
                    {cameras.length === 0 && (
                        <div className="text-center py-24 bg-slate-900/30 rounded-2xl border border-slate-800 border-dashed">
                            <p className="text-slate-500 text-lg">
                                No cameras found in this blueprint.
                            </p>
                            <button
                                onClick={onEdit}
                                className="mt-4 text-blue-400 hover:text-blue-300 transition-colors"
                            >
                                Go to Editor to add cameras
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {selectedCamera && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4"
                    onClick={() => setSelectedCamera(null)}
                >
                    <div
                        className="bg-slate-900 rounded-2xl p-6 md:p-10 w-full max-w-6xl relative shadow-2xl border border-slate-800"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            onClick={() => setSelectedCamera(null)}
                            className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <h2 className="text-3xl font-light text-white mb-8">Camera Feed: {selectedCamera.id}</h2>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                            {/* Details Column (Spans 4/12) */}
                            <div className="lg:col-span-4 space-y-8 order-2 lg:order-1">
                                <div className="bg-slate-800/40 p-6 rounded-xl border border-slate-700/50">
                                    <div className="space-y-6">
                                        <div>
                                            <p className="mb-4 mt-4 text-white uppercase tracking-widest text-[10px] opacity-60">ID : {selectedCamera.id}</p>
                                            <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">Status</p>
                                            <div className="flex items-center gap-2">
                                                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                                                <p className="text-white font-medium">Online / Active</p>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">Location</p>
                                            <p className="text-white text-lg">
                                                {selectedCamera.roomId && roomMap[selectedCamera.roomId]?.name || "Unassigned External"}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">Rotation Angle</p>
                                            <p className="text-white font-mono text-lg">{selectedCamera.rotation}°</p>
                                        </div>
                                        {selectedCamera.rtspUrl && (
                                            <div>
                                                <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">RTSP Stream URL</p>
                                                <div className="bg-black/40 p-3 rounded border border-slate-700 flex items-center gap-2">
                                                    <code className="text-blue-400 text-xs break-all flex-1">{selectedCamera.rtspUrl}</code>
                                                    <button 
                                                        onClick={() => navigator.clipboard.writeText(selectedCamera.rtspUrl || '')}
                                                        className="text-slate-500 hover:text-white transition-colors"
                                                        title="Copy to clipboard"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Stream Column (Spans 8/12) */}
                            <div className="lg:col-span-8 order-1 lg:order-2">
                                <div className="w-full aspect-video bg-black rounded-xl border border-slate-800 relative overflow-hidden group shadow-inner">
                                    <div className="absolute inset-0 bg-linear-to-br from-blue-900/10 to-transparent"></div>

                                    {/* Stream UI Overlay */}
                                    <div className="absolute top-4 left-4 flex items-center gap-3 z-10">
                                        <div className="bg-red-600 px-2 py-0.5 rounded text-[10px] font-bold text-white tracking-tighter">REC</div>
                                        <div className="text-white/50 font-mono text-xs uppercase tracking-tighter">
                                            {new Date().toISOString()}
                                        </div>
                                    </div>

                                    <div className="relative w-full h-full flex items-center justify-center">
                                        <img
                                            src={selectedCamera.rtspUrl 
                                                ? `http://localhost:8000/api/stream?url=${encodeURIComponent(selectedCamera.rtspUrl)}&fps=15`
                                                : `http://localhost:8000/api/stream?fps=15`
                                            }
                                            alt={`Stream for ${selectedCamera.id}`}
                                            className="w-full h-full object-contain"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.style.display = 'none';
                                                const fallback = document.getElementById('stream-fallback');
                                                if (fallback) fallback.style.display = 'flex';
                                            }}
                                        />
                                        
                                        <div 
                                            id="stream-fallback" 
                                            className="hidden flex-col items-center justify-center h-full"
                                        >
                                            <div className="text-red-400 font-mono text-sm tracking-[0.2em] animate-pulse">
                                                STREAM UNAVAILABLE
                                            </div>
                                            <div className="mt-2 text-slate-600 text-xs font-mono uppercase">
                                                Check RTSP Kit status or URL
                                            </div>
                                        </div>

                                        <div className="absolute bottom-4 right-4 text-green-400 font-mono text-[10px] tracking-[0.2em] opacity-50">
                                            LIVE FEED SOURCE: {selectedCamera.id}
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PostDashboard;
