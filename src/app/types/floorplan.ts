export type Tool = 'select' | 'room' | 'door' | 'window' | 'camera' | 'wall' | 'pencil' | 'pan' | 'text';

export interface Point {
    x: number;
    y: number;
}

export interface Room {
    id: string;
    type: 'room';
    x: number;
    y: number;
    width: number;
    height: number;
    name?: string;
    color?: string;
    cameraIds?: string[];
    redAlertCapacity?: number;
    orangeAlertCapacity?: number;
    currentPopulation?: number;
}

export interface Door {
    id: string;
    type: 'door';
    x: number;
    y: number;
    rotation: number;
}

export interface Window {
    id: string;
    type: 'window';
    x: number;
    y: number;
    rotation: number;
}

export interface Camera {
    id: string;
    type: 'camera';
    x: number;
    y: number;
    rotation: number;
    roomId?: string;
    rtspUrl?: string;
}

export interface Wall {
    id: string;
    type: 'wall';
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    thickness: number;
    color?: string;
}

export interface PencilPath {
    id: string;
    type: 'pencil';
    points: Point[];
    color: string;
    lineWidth: number;
}

export interface TextBlock {
    id: string;
    type: 'text';
    x: number;
    y: number;
    text: string;
    fontSize?: number;
    color?: string;
    fontFamily?: string;
}

export type FloorPlanElement = Room | Door | Window | Camera | Wall | PencilPath | TextBlock;

export interface Diagram {
    id: string;
    name: string;
    elements: FloorPlanElement[];
    updatedAt: number;
}

export interface MarqueeSelection {
    startPoint: Point;
    currentPoint: Point;
    isActive: boolean;
}

export interface FloorPlanCanvasProps {
    selectedTool: Tool;
    elements: FloorPlanElement[];
    onElementsChange: (elements: FloorPlanElement[]) => void;
    selectedElementIds?: string[];
    onSelectedElementChange?: (ids: string[]) => void;
    zoom?: number;
    onZoomChange?: (zoom: number) => void;
}
