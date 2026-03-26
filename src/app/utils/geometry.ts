// geometry utility functions for the Floor Plan Designer

import { Point } from '../types/floorplan';
import { GRID_SIZE } from './constants';

// snap to grid
export function snapToGrid(point: Point): Point {
    return {
        x: Math.round(point.x / GRID_SIZE) * GRID_SIZE,
        y: Math.round(point.y / GRID_SIZE) * GRID_SIZE,
    };
}

// point to line distance calculation
export function pointToLineDistance(
    point: Point,
    lineStart: Point,
    lineEnd: Point
): number {
    const A = point.x - lineStart.x;
    const B = point.y - lineStart.y;
    const C = lineEnd.x - lineStart.x;
    const D = lineEnd.y - lineStart.y;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    const param = lenSq !== 0 ? dot / lenSq : -1;

    let xx, yy;

    if (param < 0) {
        xx = lineStart.x;
        yy = lineStart.y;
    } else if (param > 1) {
        xx = lineEnd.x;
        yy = lineEnd.y;
    } else {
        xx = lineStart.x + param * C;
        yy = lineStart.y + param * D;
    }

    const dx = point.x - xx;
    const dy = point.y - yy;

    return Math.sqrt(dx * dx + dy * dy);
}

// point in rectangle check
export function isPointInRect(
    point: Point,
    rect: { x: number; y: number; width: number; height: number }
): boolean {
    return (
        point.x >= rect.x &&
        point.x <= rect.x + rect.width &&
        point.y >= rect.y &&
        point.y <= rect.y + rect.height
    );
}

// point near line check
export function isPointNearLine(
    point: Point,
    lineStart: Point,
    lineEnd: Point,
    threshold: number
): boolean {
    return pointToLineDistance(point, lineStart, lineEnd) < threshold;
}

// point near path check
export function isPointNearPath(
    point: Point,
    path: Point[],
    threshold: number
): boolean {
    for (let i = 0; i < path.length - 1; i++) {
        if (isPointNearLine(point, path[i], path[i + 1], threshold)) {
            return true;
        }
    }
    return false;
}


// distance calculation
export function distance(p1: Point, p2: Point): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
}

// rectangle normalization
export function normalizeRect(start: Point, end: Point): { x: number; y: number; width: number; height: number } {
    const x = Math.min(start.x, end.x);
    const y = Math.min(start.y, end.y);
    const width = Math.abs(end.x - start.x);
    const height = Math.abs(end.y - start.y);
    return { x, y, width, height };
}

// rectangle intersection check
export function doRectsIntersect(
    rect1: { x: number; y: number; width: number; height: number },
    rect2: { x: number; y: number; width: number; height: number }
): boolean {
    return !(
        rect1.x + rect1.width < rect2.x ||
        rect2.x + rect2.width < rect1.x ||
        rect1.y + rect1.height < rect2.y ||
        rect2.y + rect2.height < rect1.y
    );
}
