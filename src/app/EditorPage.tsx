import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { FloorPlanCanvas } from './components/FloorPlanCanvas';
import type { FloorPlanElement, Tool, Diagram, Room } from './types/floorplan';
import { Toolbar } from './components/Toolbar';
import { PropertiesPanel } from './components/PropertiesPanel';
import { MIN_ZOOM, MAX_ZOOM, ZOOM_STEP } from './utils/constants';

const DIAGRAMS_KEY = 'diagrams';

const EditorPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [selectedTool, setSelectedTool] = useState<Tool>('select');
    const [diagramName, setDiagramName] = useState<string>('Untitled Diagram');
    const [elements, setRawElements] = useState<FloorPlanElement[]>([]);
    const [selectedElementIds, setSelectedElementIds] = useState<string[]>([]);
    const [zoom, setZoom] = useState<number>(1);
    const [isLoaded, setIsLoaded] = useState(false);

    const calculateCameraRoomLinkage = (elements: FloorPlanElement[]): FloorPlanElement[] => {
        const rooms = elements.filter(el => el.type === 'room');
        const cameras = elements.filter(el => el.type === 'camera');

        return elements.map(el => {
            if (el.type === 'camera') {
                const camera = el;
                // Find all rooms that contain the camera
                const containingRooms = (rooms as Room[]).filter(r =>
                    camera.x >= r.x &&
                    camera.x <= r.x + r.width &&
                    camera.y >= r.y &&
                    camera.y <= r.y + r.height
                );

                // If nested, we want the smallest room (the most specific one)
                let smallestRoom: Room | null = null;
                if (containingRooms.length > 0) {
                    smallestRoom = containingRooms.reduce((prev, curr) => 
                        (curr.width * curr.height < prev.width * prev.height) ? curr : prev
                    );
                }

                return { ...camera, roomId: smallestRoom?.id };
            }
            if (el.type === 'room') {
                const room = el;
                const roomCameras = cameras.filter(c =>
                    c.x >= room.x &&
                    c.x <= room.x + room.width &&
                    c.y >= room.y &&
                    c.y <= room.y + room.height
                );
                return { ...room, cameraIds: roomCameras.map(c => c.id) };
            }
            return el;
        });
    };

    const setElements = (newElements: FloorPlanElement[] | ((prev: FloorPlanElement[]) => FloorPlanElement[])) => {
        if (typeof newElements === 'function') {
            setRawElements(prev => calculateCameraRoomLinkage(newElements(prev)));
        } else {
            setRawElements(calculateCameraRoomLinkage(newElements));
        }
    };

    // Load diagram on mount
    useEffect(() => {
        if (!id) return;

        const savedDiagrams: Diagram[] = JSON.parse(localStorage.getItem(DIAGRAMS_KEY) || '[]');
        const currentDiagram = savedDiagrams.find(d => d.id === id);

        if (currentDiagram) {
            console.log('--- Loaded Diagram JSON ---');
            console.log(JSON.stringify(currentDiagram, null, 2));
            console.log('---------------------------');
            setElements(currentDiagram.elements);
            setDiagramName(currentDiagram.name);
        } else if (id !== 'new') {
            // If it's not 'new' and not found, maybe redirect to dashboard
            navigate('/');
        }
        setIsLoaded(true);
    }, [id, navigate]);

    // Auto-save to localStorage whenever elements change
    useEffect(() => {
        if (!id || !isLoaded) return;

        const savedDiagrams: Diagram[] = JSON.parse(localStorage.getItem(DIAGRAMS_KEY) || '[]');
        const diagramIndex = savedDiagrams.findIndex(d => d.id === id);

        const updatedDiagram: Diagram = {
            id: id === 'new' ? Math.random().toString(36).substr(2, 9) : id,
            name: diagramName,
            elements: elements,
            updatedAt: Date.now(),
        };

        if (id === 'new') {
            savedDiagrams.push(updatedDiagram);
            // Replace 'new' with the actual ID in the URL without triggering a reload if possible
            // but for now let's just push and update
            localStorage.setItem(DIAGRAMS_KEY, JSON.stringify(savedDiagrams));
            
            console.log('--- Created New Diagram JSON ---');
            console.log(JSON.stringify(updatedDiagram, null, 2));
            console.log('--------------------------------');
            
            navigate(`/editor/${updatedDiagram.id}`, { replace: true });
        } else {
            if (diagramIndex > -1) {
                savedDiagrams[diagramIndex] = updatedDiagram;
            } else {
                savedDiagrams.push(updatedDiagram);
            }
            localStorage.setItem(DIAGRAMS_KEY, JSON.stringify(savedDiagrams));
            
            console.log('--- Updated Diagram JSON ---');
            console.log(JSON.stringify(updatedDiagram, null, 2));
            console.log('-----------------------------');
        }
    }, [elements, diagramName, id, isLoaded, navigate]);

    const selectedElement = selectedElementIds.length === 1
        ? elements.find((el) => el.id === selectedElementIds[0]) || null
        : null;

    const handleClear = () => {
        if (window.confirm('Are you sure you want to clear all elements?')) {
            setElements([]);
            setSelectedElementIds([]);
        }
    };

    const handleRotateSelected = () => {
        if (selectedElementIds.length === 0) return;

        setElements((prev) =>
            prev.map((el) => {
                if (selectedElementIds.includes(el.id) && 'rotation' in el) {
                    return {
                        ...el,
                        rotation: (el.rotation + 10) % 360,
                    };
                }
                return el;
            })
        );
    };

    const handleUpdateElement = (updatedElement: FloorPlanElement) => {
        setElements((prev) => prev.map((el) => (el.id === updatedElement.id ? updatedElement : el)));
    };

    const handleZoomIn = () => setZoom((prev) => Math.min(MAX_ZOOM, prev + ZOOM_STEP));
    const handleZoomOut = () => setZoom((prev) => Math.max(MIN_ZOOM, prev - ZOOM_STEP));
    const handleZoomReset = () => setZoom(1);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement) return;

            switch (e.key.toLowerCase()) {
                case 'v':
                    setSelectedTool('select');
                    break;
                case 'l':
                    setSelectedTool('wall');
                    break;
                case 'p':
                    setSelectedTool('pencil');
                    break;
                case 'r':
                    if (!e.metaKey && !e.ctrlKey) {
                        setSelectedTool('room');
                    }
                    break;
                case 'd':
                    setSelectedTool('door');
                    break;
                case 'w':
                    setSelectedTool('window');
                    break;
                case 'c':
                    setSelectedTool('camera');
                    break;
                case 'h':
                    setSelectedTool('pan');
                    break;
                case 't':
                    setSelectedTool('text');
                    break;
                case 'delete':
                case 'backspace':
                    if (selectedElementIds.length > 0) {
                        setElements((prev) => prev.filter((el) => !selectedElementIds.includes(el.id)));
                        setSelectedElementIds([]);
                    }
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [selectedElementIds]);

    const handleView = () => navigate(`/post/${id}`);

    return (
        <div className="h-screen flex flex-col bg-slate-950">
            {/* Header */}
            <div className="bg-slate-900 border-b border-slate-700 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => handleView()}
                            className="text-slate-400 hover:text-white transition-colors"
                            title="Back to Dashboard"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                        </button>
                        <div>
                            <input
                                type="text"
                                value={diagramName}
                                onChange={(e) => setDiagramName(e.target.value)}
                                className="bg-transparent text-2xl text-white border-none focus:outline-none focus:ring-0 w-auto"
                            />
                            <p className="text-sm text-slate-400">Blueprint Editor</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                        <div className="bg-blue-600/20 text-blue-400 px-3 py-1 rounded border border-blue-600/30">
                            {elements.length} element{elements.length !== 1 ? 's' : ''}
                        </div>
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <Toolbar
                selectedTool={selectedTool}
                onToolChange={setSelectedTool}
                onClear={handleClear}
                onRotateSelected={handleRotateSelected}
                hasElements={elements.length > 0}
                elements={elements}
                onLoadElements={setElements}
                zoom={zoom}
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onZoomReset={handleZoomReset}
            />

            {/* Main Content */}
            <div className="flex-1 relative overflow-hidden">
                {/* Canvas Area */}
                <div className={`absolute inset-0 ${selectedElement ? 'right-80' : 'right-0'} `}>
                    <FloorPlanCanvas
                        selectedTool={selectedTool}
                        elements={elements}
                        onElementsChange={setElements}
                        selectedElementIds={selectedElementIds}
                        onSelectedElementChange={setSelectedElementIds}
                        zoom={zoom}
                        onZoomChange={setZoom}
                    />

                </div>

                {/* Properties Panel */}
                {selectedElement && (
                    <div className="absolute top-0 right-0 bottom-0 w-80 bg-slate-950 border-l border-slate-700 p-4 overflow-y-auto animate-in slide-in-from-right duration-300">
                        <PropertiesPanel
                            selectedElement={selectedElement}
                            onUpdateElement={handleUpdateElement}
                        />
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="bg-slate-900 border-t border-slate-700 px-6 py-2 text-xs text-slate-500 flex items-center justify-between">
                <div>Blueprint Mode • Grid: 20px • Zoom: {Math.round(zoom * 100)}%</div>
                <div className="flex items-center gap-4">
                    <span>Click and drag to draw rooms</span>
                    <span>•</span>
                    <span>Click to place doors, windows, cameras</span>
                </div>
            </div>
        </div>
    );
}


export default EditorPage;