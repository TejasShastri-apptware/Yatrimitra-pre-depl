/**
 * Drawing utility functions for rendering floor plan elements
 */

import {
    Room,
    Door,
    Window,
    Camera,
    Wall,
    PencilPath,
    TextBlock,
    Point,
} from '../types/floorplan';
import {
    GRID_SIZE,
    DOOR_SIZE,
    WINDOW_SIZE,
    CAMERA_SIZE,
    COLORS,
} from './constants';

export function drawGrid(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    panOffset: Point,
    zoom: number = 1
): void {
    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 1;

    const scaledGridSize = GRID_SIZE * zoom;
    const offsetX = panOffset.x % scaledGridSize;
    const offsetY = panOffset.y % scaledGridSize;

    for (let x = offsetX; x < width; x += scaledGridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }

    for (let y = offsetY; y < height; y += scaledGridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
}

export function drawRoom(
    ctx: CanvasRenderingContext2D,
    room: Room,
    panOffset: Point,
    isSelected: boolean,
    zoom: number = 1
): void {
    ctx.save();
    const strokeColor = isSelected ? COLORS.selected : (room.color || COLORS.room);
    ctx.strokeStyle = strokeColor;
    ctx.fillStyle = room.color ? `${room.color}1a` : COLORS.roomFill; // Add transparency to custom colors
    ctx.lineWidth = isSelected ? 3 : 2;

    const x = room.x * zoom + panOffset.x;
    const y = room.y * zoom + panOffset.y;
    const width = room.width * zoom;
    const height = room.height * zoom;

    ctx.fillRect(x, y, width, height);
    ctx.strokeRect(x, y, width, height);

    const centerX = x + width / 2;
    const centerY = y + height / 2;

    // Add room name in bright yellow if it exists
    if (room.name) {
        ctx.fillStyle = COLORS.roomName;
        ctx.font = `bold ${14 * zoom}px monospace`;
        ctx.textAlign = 'center';
        ctx.fillText(room.name, centerX, centerY - 10 * zoom);
    }

    // Add dimension labels
    ctx.fillStyle = COLORS.label;
    ctx.font = `${12 * zoom}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(
        `${Math.abs(Math.round(room.width / GRID_SIZE))}x${Math.abs(Math.round(room.height / GRID_SIZE))}`,
        centerX,
        room.name ? centerY + 10 * zoom : centerY
    );
    ctx.restore();
}

export function drawDoor(
    ctx: CanvasRenderingContext2D,
    door: Door,
    panOffset: Point,
    isSelected: boolean,
    zoom: number = 1
): void {
    ctx.save();
    ctx.translate(door.x * zoom + panOffset.x, door.y * zoom + panOffset.y);
    ctx.rotate((door.rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);

    // Door frame
    ctx.strokeStyle = isSelected ? COLORS.selected : COLORS.door;
    ctx.lineWidth = isSelected ? 3 : 2;
    ctx.beginPath();
    ctx.moveTo(-DOOR_SIZE / 2, 0);
    ctx.lineTo(DOOR_SIZE / 2, 0);
    ctx.stroke();

    // Door arc
    ctx.strokeStyle = isSelected ? 'rgba(96, 165, 250, 0.6)' : 'rgba(139, 92, 246, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(-DOOR_SIZE / 2, 0, DOOR_SIZE, 0, Math.PI / 2);
    ctx.stroke();

    // Selection circle
    if (isSelected) {
        ctx.fillStyle = COLORS.selected;
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();
}

export function drawWindow(
    ctx: CanvasRenderingContext2D,
    window: Window,
    panOffset: Point,
    isSelected: boolean,
    zoom: number = 1
): void {
    ctx.save();
    ctx.translate(window.x * zoom + panOffset.x, window.y * zoom + panOffset.y);
    ctx.rotate((window.rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);

    // Window frame
    ctx.strokeStyle = isSelected ? COLORS.selected : COLORS.window;
    ctx.lineWidth = isSelected ? 3 : 2;
    ctx.fillStyle = 'rgba(6, 182, 212, 0.2)';

    ctx.fillRect(-WINDOW_SIZE / 2, -3, WINDOW_SIZE, 6);
    ctx.strokeRect(-WINDOW_SIZE / 2, -3, WINDOW_SIZE, 6);

    // Window divider
    ctx.beginPath();
    ctx.moveTo(0, -3);
    ctx.lineTo(0, 3);
    ctx.stroke();

    // Selection circle
    if (isSelected) {
        ctx.fillStyle = COLORS.selected;
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();
}

export function drawCamera(
    ctx: CanvasRenderingContext2D,
    camera: Camera,
    panOffset: Point,
    isSelected: boolean,
    zoom: number = 1
): void {
    ctx.save();
    ctx.translate(camera.x * zoom + panOffset.x, camera.y * zoom + panOffset.y);
    ctx.rotate((camera.rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);

    // Camera view cone
    ctx.fillStyle = isSelected ? 'rgba(96, 165, 250, 0.15)' : 'rgba(34, 197, 94, 0.1)';
    ctx.strokeStyle = isSelected ? 'rgba(96, 165, 250, 0.4)' : 'rgba(34, 197, 94, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(60, -40);
    ctx.lineTo(60, 40);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Camera body
    ctx.fillStyle = isSelected ? COLORS.selected : COLORS.camera;
    ctx.beginPath();
    ctx.arc(0, 0, CAMERA_SIZE / 3, 0, Math.PI * 2);
    ctx.fill();

    // Camera lens
    ctx.fillStyle = COLORS.background;
    ctx.beginPath();
    ctx.arc(0, 0, CAMERA_SIZE / 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}


export function drawWall(
    ctx: CanvasRenderingContext2D,
    wall: Wall,
    panOffset: Point,
    isSelected: boolean,
    zoom: number = 1
): void {
    ctx.save();
    ctx.strokeStyle = isSelected ? COLORS.selected : (wall.color || COLORS.wall);
    ctx.lineWidth = wall.thickness;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(wall.x1 * zoom + panOffset.x, wall.y1 * zoom + panOffset.y);
    ctx.lineTo(wall.x2 * zoom + panOffset.x, wall.y2 * zoom + panOffset.y);
    ctx.stroke();

    // Draw endpoints for selected wall
    if (isSelected) {
        ctx.fillStyle = COLORS.selected;
        ctx.beginPath();
        ctx.arc(wall.x1 * zoom + panOffset.x, wall.y1 * zoom + panOffset.y, 4 * zoom, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(wall.x2 * zoom + panOffset.x, wall.y2 * zoom + panOffset.y, 4 * zoom, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
}


export function drawPencilPath(
    ctx: CanvasRenderingContext2D,
    path: PencilPath,
    panOffset: Point,
    isSelected: boolean,
    zoom: number = 1
): void {
    if (path.points.length < 2) return;

    ctx.save();
    ctx.strokeStyle = isSelected ? COLORS.selected : path.color;
    ctx.lineWidth = isSelected ? path.lineWidth + 1 : path.lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Add glow effect for selected paths
    if (isSelected) {
        ctx.shadowColor = COLORS.selected;
        ctx.shadowBlur = 8;
    }

    ctx.beginPath();
    ctx.moveTo(path.points[0].x * zoom + panOffset.x, path.points[0].y * zoom + panOffset.y);

    for (let i = 1; i < path.points.length; i++) {
        ctx.lineTo(path.points[i].x * zoom + panOffset.x, path.points[i].y * zoom + panOffset.y);
    }

    ctx.stroke();

    // Reset shadow
    if (isSelected) {
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
    }
    ctx.restore();
}

export function drawTextBlock(
    ctx: CanvasRenderingContext2D,
    textBlock: TextBlock,
    panOffset: Point,
    isSelected: boolean,
    zoom: number = 1
): void {
    ctx.save();
    const x = textBlock.x * zoom + panOffset.x;
    const y = textBlock.y * zoom + panOffset.y;
    const fontSize = (textBlock.fontSize || 16) * zoom;
    const text = textBlock.text || 'Text';

    ctx.font = `${fontSize}px ${textBlock.fontFamily || 'monospace'}`;
    ctx.fillStyle = isSelected ? COLORS.selected : (textBlock.color || '#ffffff');
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    // Draw text
    ctx.fillText(text, x, y);

    // Draw selection box if selected
    if (isSelected) {
        const metrics = ctx.measureText(text);
        ctx.strokeStyle = COLORS.selected;
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.strokeRect(x - 2, y - 2, metrics.width + 4, fontSize + 4);
        ctx.setLineDash([]);
    }
    ctx.restore();
}
