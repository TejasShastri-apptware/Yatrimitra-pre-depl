
import { FloorPlanElement, Point, Room, Camera } from '../types/floorplan';
import { isPointInRect, isPointNearLine, isPointNearPath } from './geometry';

// ─── helpers ────────────────────────────────────────────────────────────────

function roomArea(room: Room): number {
    return Math.abs(room.width) * Math.abs(room.height);
}

function isElementAtPoint(
    element: FloorPlanElement,
    point: Point,
    panOffset: Point,
    zoom: number
): boolean {
    if (element.type === 'room') {
        return isPointInRect(point, {
            x: element.x * zoom + panOffset.x,
            y: element.y * zoom + panOffset.y,
            width: element.width * zoom,
            height: element.height * zoom,
        });
    } else if (element.type === 'camera') {
        const dx = point.x - (element.x * zoom + panOffset.x);
        const dy = point.y - (element.y * zoom + panOffset.y);
        return Math.sqrt(dx * dx + dy * dy) < 20 * zoom;
    } else if (element.type === 'wall') {
        const x1 = element.x1 * zoom + panOffset.x;
        const y1 = element.y1 * zoom + panOffset.y;
        const x2 = element.x2 * zoom + panOffset.x;
        const y2 = element.y2 * zoom + panOffset.y;
        return isPointNearLine(point, { x: x1, y: y1 }, { x: x2, y: y2 }, element.thickness / 2 + 5);
    } else if (element.type === 'pencil') {
        const offsetPoints = element.points.map((p) => ({
            x: p.x * zoom + panOffset.x,
            y: p.y * zoom + panOffset.y,
        }));
        return isPointNearPath(point, offsetPoints, element.lineWidth + 5);
    } else if (element.type === 'text') {
        const fontSize = (element.fontSize || 16) * zoom;
        const text = element.text || 'Text';
        const textWidth = text.length * fontSize * 0.6;
        return isPointInRect(point, {
            x: element.x * zoom + panOffset.x,
            y: element.y * zoom + panOffset.y,
            width: textWidth,
            height: fontSize,
        });
    } else {
        // door, window
        const dx = point.x - (element.x * zoom + panOffset.x);
        const dy = point.y - (element.y * zoom + panOffset.y);
        return Math.sqrt(dx * dx + dy * dy) < 20 * zoom;
    }
}

// ─── public API ──────────────────────────────────────────────────────────────

/**
 * Returns ALL elements that contain `point`, sorted by selection priority:
 *   1. Cameras (point-based, most specific)
 *   2. Rooms ordered by ascending area (smallest room = deepest nesting = highest priority)
 *   3. Everything else (walls, doors, windows, text, pencil) in reverse render order
 */
export function findAllElementsAtPoint(
    point: Point,
    elements: FloorPlanElement[],
    panOffset: Point,
    zoom: number = 1
): FloorPlanElement[] {
    const candidates = elements.filter((el) => isElementAtPoint(el, point, panOffset, zoom));

    const cameras = candidates.filter((el): el is Camera => el.type === 'camera');
    const rooms = candidates
        .filter((el): el is Room => el.type === 'room')
        .sort((a, b) => roomArea(a) - roomArea(b)); // smallest first
    const others = candidates
        .filter((el) => el.type !== 'camera' && el.type !== 'room')
        .reverse(); // last-added on top

    return [...cameras, ...rooms, ...others];
}

/**
 * Returns the element to select at `point`.
 * Pass `cycleIndex` (default 0) to step through overlapping elements.
 * The caller is responsible for persisting and incrementing cycleIndex.
 */
export function findElementAtPoint(
    point: Point,
    elements: FloorPlanElement[],
    panOffset: Point,
    zoom: number = 1,
    cycleIndex: number = 0
): FloorPlanElement | null {
    const candidates = findAllElementsAtPoint(point, elements, panOffset, zoom);
    if (candidates.length === 0) return null;
    return candidates[cycleIndex % candidates.length];
}

// ─── marquee ─────────────────────────────────────────────────────────────────

export function findElementsInMarquee(
    marqueeRect: { x: number; y: number; width: number; height: number },
    elements: FloorPlanElement[],
    panOffset: Point,
    zoom: number = 1
): FloorPlanElement[] {
    return elements.filter((element) => {
        if (element.type === 'room') {
            const elementRect = {
                x: element.x * zoom + panOffset.x,
                y: element.y * zoom + panOffset.y,
                width: element.width * zoom,
                height: element.height * zoom,
            };
            return (
                isPointInRect({ x: elementRect.x, y: elementRect.y }, marqueeRect) ||
                isPointInRect({ x: elementRect.x + elementRect.width, y: elementRect.y }, marqueeRect) ||
                isPointInRect({ x: elementRect.x, y: elementRect.y + elementRect.height }, marqueeRect) ||
                isPointInRect({ x: elementRect.x + elementRect.width, y: elementRect.y + elementRect.height }, marqueeRect) ||
                isPointInRect({ x: marqueeRect.x, y: marqueeRect.y }, elementRect) ||
                isPointInRect({ x: marqueeRect.x + marqueeRect.width, y: marqueeRect.y }, elementRect) ||
                isPointInRect({ x: marqueeRect.x, y: marqueeRect.y + marqueeRect.height }, elementRect) ||
                isPointInRect({ x: marqueeRect.x + marqueeRect.width, y: marqueeRect.y + marqueeRect.height }, elementRect)
            );
        } else if (element.type === 'wall') {
            const x1 = element.x1 * zoom + panOffset.x;
            const y1 = element.y1 * zoom + panOffset.y;
            const x2 = element.x2 * zoom + panOffset.x;
            const y2 = element.y2 * zoom + panOffset.y;
            return isPointInRect({ x: x1, y: y1 }, marqueeRect) || isPointInRect({ x: x2, y: y2 }, marqueeRect);
        } else if (element.type === 'pencil') {
            return element.points.some((p) =>
                isPointInRect({ x: p.x * zoom + panOffset.x, y: p.y * zoom + panOffset.y }, marqueeRect)
            );
        } else if (element.type === 'text') {
            return isPointInRect(
                { x: element.x * zoom + panOffset.x, y: element.y * zoom + panOffset.y },
                marqueeRect
            );
        } else {
            // camera, door, window
            return isPointInRect(
                { x: element.x * zoom + panOffset.x, y: element.y * zoom + panOffset.y },
                marqueeRect
            );
        }
    });
}
