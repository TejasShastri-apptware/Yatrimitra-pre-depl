export const GRID_SIZE = 20;
export const DOOR_SIZE = 40;
export const WINDOW_SIZE = 40;
export const CAMERA_SIZE = 30;
export const DEFAULT_WALL_THICKNESS = 2;
export const DEFAULT_PENCIL_LINE_WIDTH = 2;
export const DEFAULT_PENCIL_COLOR = '#60a5fa';

export const MIN_ZOOM = 0.25;
export const MAX_ZOOM = 3;
export const ZOOM_STEP = 0.1;

export const COLORS = {
    background: '#0a1929',
    grid: '#1e3a5f',
    room: '#3b82f6',
    roomFill: 'rgba(59, 130, 246, 0.1)',
    door: '#8b5cf6',
    window: '#06b6d4',
    camera: '#22c55e',
    wall: '#64748b',
    pencil: '#60a5fa',
    selected: '#60a5fa',
    label: '#93c5fd',
    roomName: '#fde047', // Bright yellow for room names
    marqueeStroke: '#60a5fa',
    marqueeFill: 'rgba(96, 165, 250, 0.15)',
} as const;

export const MARQUEE_LINE_WIDTH = 2;
