import React, { useRef, useEffect, useState } from 'react';

// Import types
import type {
  Tool,
  Point,
  Room,
  Wall,
  PencilPath,
  FloorPlanElement,
  FloorPlanCanvasProps,
  MarqueeSelection,
} from '../types/floorplan';

export type {
  Tool,
  Point,
  Room,
  Door,
  Window,
  Camera,
  Wall,
  PencilPath,
  FloorPlanElement,
} from '../types/floorplan';

// Import utilities
import { snapToGrid, distance, normalizeRect } from '../utils/geometry';
import {
  drawGrid,
  drawRoom,
  drawDoor,
  drawWindow,
  drawCamera,
  drawWall,
  drawPencilPath,
  drawTextBlock,
} from '../utils/drawing';
import { findElementAtPoint, findAllElementsAtPoint, findElementsInMarquee } from '../utils/selection';
import {
  GRID_SIZE,
  DEFAULT_WALL_THICKNESS,
  DEFAULT_PENCIL_COLOR,
  DEFAULT_PENCIL_LINE_WIDTH,
  COLORS,
  MIN_ZOOM,
  MAX_ZOOM,
  ZOOM_STEP,
  MARQUEE_LINE_WIDTH,
} from '../utils/constants';

export function FloorPlanCanvas({
  selectedTool,
  elements,
  onElementsChange,
  selectedElementIds = [],
  onSelectedElementChange,
  zoom = 1,
  onZoomChange,
}: FloorPlanCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [currentPoint, setCurrentPoint] = useState<Point | null>(null);
  const [pencilPoints, setPencilPoints] = useState<Point[]>([]);
  const [selectedElements, setSelectedElements] = useState<string[]>(selectedElementIds);
  const [marqueeSelection, setMarqueeSelection] = useState<MarqueeSelection | null>(null);
  const [panOffset, setPanOffset] = useState<Point>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<Point | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPoint, setDragStartPoint] = useState<Point | null>(null);
  const [draggedElementsStartPos, setDraggedElementsStartPos] = useState<Map<string, any>>(new Map());

  // Click-cycling state for overlapping elements (rooms inside rooms, cameras inside rooms)
  const cycleIndexRef = useRef<number>(0);
  const lastClickPointRef = useRef<Point | null>(null);
  const CYCLE_RADIUS = 8; // px — clicks within this radius reuse the cycle

  // Main rendering effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Clear canvas
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    drawGrid(ctx, canvas.width, canvas.height, panOffset, zoom);

    // Draw all elements in layered order:
    //   1. Rooms (largest → smallest, so nested rooms are visually on top)
    //   2. Walls, pencil, text, doors, windows
    //   3. Cameras always on top
    const rooms = elements
      .filter((el) => el.type === 'room')
      .sort((a, b) => {
        const areaA = a.type === 'room' ? Math.abs(a.width) * Math.abs(a.height) : 0;
        const areaB = b.type === 'room' ? Math.abs(b.width) * Math.abs(b.height) : 0;
        return areaB - areaA; // largest first
      });
    const midLayer = elements.filter((el) => el.type !== 'room' && el.type !== 'camera');
    const cameras = elements.filter((el) => el.type === 'camera');
    const drawOrder = [...rooms, ...midLayer, ...cameras];

    drawOrder.forEach((element) => {
      const isSelected = selectedElements.includes(element.id);

      switch (element.type) {
        case 'room':
          drawRoom(ctx, element, panOffset, isSelected, zoom);
          break;
        case 'door':
          drawDoor(ctx, element, panOffset, isSelected, zoom);
          break;
        case 'window':
          drawWindow(ctx, element, panOffset, isSelected, zoom);
          break;
        case 'camera':
          drawCamera(ctx, element, panOffset, isSelected, zoom);
          break;
        case 'wall':
          drawWall(ctx, element, panOffset, isSelected, zoom);
          break;
        case 'pencil':
          drawPencilPath(ctx, element, panOffset, isSelected, zoom);
          break;
        case 'text':
          drawTextBlock(ctx, element, panOffset, isSelected, zoom);
          break;
      }
    });

    // Draw preview while drawing
    if (isDrawing && startPoint && currentPoint) {
      if (selectedTool === 'room') {
        const width = currentPoint.x - startPoint.x;
        const height = currentPoint.y - startPoint.y;

        ctx.strokeStyle = COLORS.selected;
        ctx.fillStyle = 'rgba(96, 165, 250, 0.1)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        // Apply pan offset and zoom to convert world coordinates to screen coordinates
        ctx.strokeRect(startPoint.x * zoom + panOffset.x, startPoint.y * zoom + panOffset.y, width * zoom, height * zoom);
        ctx.fillRect(startPoint.x * zoom + panOffset.x, startPoint.y * zoom + panOffset.y, width * zoom, height * zoom);
        ctx.setLineDash([]);
      } else if (selectedTool === 'wall') {
        ctx.strokeStyle = COLORS.wall;
        ctx.lineWidth = DEFAULT_WALL_THICKNESS;
        ctx.lineCap = 'round';
        ctx.globalAlpha = 0.7;
        ctx.setLineDash([5, 5]);

        ctx.beginPath();
        // Apply pan offset and zoom to convert world coordinates to screen coordinates
        ctx.moveTo(startPoint.x * zoom + panOffset.x, startPoint.y * zoom + panOffset.y);
        ctx.lineTo(currentPoint.x * zoom + panOffset.x, currentPoint.y * zoom + panOffset.y);
        ctx.stroke();

        ctx.setLineDash([]);
        ctx.globalAlpha = 1;
      }
    }

    // Draw pencil preview
    if (isDrawing && selectedTool === 'pencil' && pencilPoints.length > 1) {
      ctx.strokeStyle = COLORS.pencil;
      ctx.lineWidth = DEFAULT_PENCIL_LINE_WIDTH;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalAlpha = 0.8;

      ctx.beginPath();
      // Apply pan offset and zoom to convert world coordinates to screen coordinates
      ctx.moveTo(pencilPoints[0].x * zoom + panOffset.x, pencilPoints[0].y * zoom + panOffset.y);

      for (let i = 1; i < pencilPoints.length; i++) {
        ctx.lineTo(pencilPoints[i].x * zoom + panOffset.x, pencilPoints[i].y * zoom + panOffset.y);
      }

      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // Draw marquee selection box
    if (marqueeSelection?.isActive && marqueeSelection.startPoint && marqueeSelection.currentPoint) {
      const marqueeRect = normalizeRect(marqueeSelection.startPoint, marqueeSelection.currentPoint);

      ctx.strokeStyle = COLORS.marqueeStroke;
      ctx.fillStyle = COLORS.marqueeFill;
      ctx.lineWidth = MARQUEE_LINE_WIDTH;
      ctx.setLineDash([5, 5]);

      // Draw in screen coordinates (already includes pan and zoom)
      ctx.strokeRect(marqueeRect.x, marqueeRect.y, marqueeRect.width, marqueeRect.height);
      ctx.fillRect(marqueeRect.x, marqueeRect.y, marqueeRect.width, marqueeRect.height);

      ctx.setLineDash([]);
    }
  }, [elements, selectedElements, isDrawing, startPoint, currentPoint, selectedTool, panOffset, pencilPoints, zoom, marqueeSelection]);

  const getCanvasPoint = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getCanvasPoint(e);

    if (selectedTool === 'pan' || e.button === 1 || (e.button === 0 && e.altKey)) {
      setIsPanning(true);
      setPanStart(point);
      return;
    }

    if (selectedTool === 'select') {
      const candidates = findAllElementsAtPoint(point, elements, panOffset, zoom);

      if (candidates.length > 0) {
        // ── Determine which candidate to select ──────────────────────────────
        const last = lastClickPointRef.current;
        const isSameSpot =
          last !== null &&
          Math.sqrt((point.x - last.x) ** 2 + (point.y - last.y) ** 2) <= CYCLE_RADIUS;

        if (isSameSpot) {
          // Repeated click at same spot: advance cycle (skip on Shift)
          if (!e.shiftKey) cycleIndexRef.current = (cycleIndexRef.current + 1) % candidates.length;
        } else {
          // New location: reset cycle
          cycleIndexRef.current = 0;
          lastClickPointRef.current = point;
        }

        const clicked = candidates[cycleIndexRef.current];

        // ── Apply selection ───────────────────────────────────────────────────
        if (e.shiftKey) {
          // Shift+click: toggle element in selection (no cycling)
          if (selectedElements.includes(clicked.id)) {
            const newSelection = selectedElements.filter(id => id !== clicked.id);
            setSelectedElements(newSelection);
            onSelectedElementChange?.(newSelection);
          } else {
            const newSelection = [...selectedElements, clicked.id];
            setSelectedElements(newSelection);
            onSelectedElementChange?.(newSelection);
          }
        } else {
          if (!selectedElements.includes(clicked.id)) {
            setSelectedElements([clicked.id]);
            onSelectedElementChange?.([clicked.id]);
          }
        }

        // ── Start drag for selected elements ─────────────────────────────────
        setIsDragging(true);
        setDragStartPoint(point);

        const elementsToStore = selectedElements.includes(clicked.id) ? selectedElements : [clicked.id];
        const posMap = new Map();

        elementsToStore.forEach(id => {
          const el = elements.find(e => e.id === id);
          if (!el) return;

          if (el.type === 'room' || el.type === 'text') {
            posMap.set(id, { x: el.x, y: el.y });
          } else if (el.type === 'wall') {
            posMap.set(id, { x1: el.x1, y1: el.y1, x2: el.x2, y2: el.y2 });
          } else if (el.type === 'pencil') {
            posMap.set(id, { points: [...el.points] });
          } else {
            posMap.set(id, { x: el.x, y: el.y });
          }
        });

        setDraggedElementsStartPos(posMap);
      } else {
        // Clicking on empty space — reset cycle and start marquee
        cycleIndexRef.current = 0;
        lastClickPointRef.current = null;

        if (!e.shiftKey) {
          setSelectedElements([]);
          onSelectedElementChange?.([]);
        }

        setMarqueeSelection({
          startPoint: point,
          currentPoint: point,
          isActive: true,
        });
      }
      return;
    }

    if (selectedTool === 'room') {
      const snapped = snapToGrid({ x: (point.x - panOffset.x) / zoom, y: (point.y - panOffset.y) / zoom });
      setIsDrawing(true);
      setStartPoint(snapped);
      setCurrentPoint(snapped);
    } else if (selectedTool === 'wall') {
      const snapped = snapToGrid({ x: (point.x - panOffset.x) / zoom, y: (point.y - panOffset.y) / zoom });
      setIsDrawing(true);
      setStartPoint(snapped);
      setCurrentPoint(snapped);
    } else if (selectedTool === 'pencil') {
      const unsnapped = { x: (point.x - panOffset.x) / zoom, y: (point.y - panOffset.y) / zoom };
      setIsDrawing(true);
      setStartPoint(unsnapped);
      setCurrentPoint(unsnapped);
      setPencilPoints([unsnapped]);
    } else if (selectedTool === 'door' || selectedTool === 'window' || selectedTool === 'camera') {
      const snapped = snapToGrid({ x: (point.x - panOffset.x) / zoom, y: (point.y - panOffset.y) / zoom });
      const newElement: FloorPlanElement =
        selectedTool === 'door'
          ? { id: Date.now().toString(), type: 'door', x: snapped.x, y: snapped.y, rotation: 0 }
          : selectedTool === 'window'
            ? { id: Date.now().toString(), type: 'window', x: snapped.x, y: snapped.y, rotation: 0 }
            : { id: Date.now().toString(), type: 'camera', x: snapped.x, y: snapped.y, rotation: 0 };

      onElementsChange([...elements, newElement]);
    } else if (selectedTool === 'text') {
      const snapped = snapToGrid({ x: (point.x - panOffset.x) / zoom, y: (point.y - panOffset.y) / zoom });
      const newText: FloorPlanElement = {
        id: Date.now().toString(),
        type: 'text',
        x: snapped.x,
        y: snapped.y,
        text: 'New Text',
        fontSize: 16,
        color: '#ffffff'
      };
      onElementsChange([...elements, newText]);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getCanvasPoint(e);

    if (isPanning && panStart) {
      setPanOffset({
        x: panOffset.x + (point.x - panStart.x),
        y: panOffset.y + (point.y - panStart.y),
      });
      setPanStart(point);
      return;
    }

    // Handle marquee selection tracking
    if (marqueeSelection?.isActive) {
      setMarqueeSelection({
        ...marqueeSelection,
        currentPoint: point,
      });
      return;
    }

    // Handle dragging selected elements
    if (isDragging && dragStartPoint && draggedElementsStartPos.size > 0) {
      const deltaX = (point.x - dragStartPoint.x) / zoom;
      const deltaY = (point.y - dragStartPoint.y) / zoom;

      const updatedElements = elements.map((el) => {
        const startPos = draggedElementsStartPos.get(el.id);
        if (!startPos) return el;

        if (el.type === 'room' || el.type === 'text') {
          return { ...el, x: startPos.x + deltaX, y: startPos.y + deltaY };
        } else if (el.type === 'wall') {
          return {
            ...el,
            x1: startPos.x1 + deltaX,
            y1: startPos.y1 + deltaY,
            x2: startPos.x2 + deltaX,
            y2: startPos.y2 + deltaY,
          };
        } else if (el.type === 'pencil') {
          return {
            ...el,
            points: startPos.points.map((p: Point) => ({
              x: p.x + deltaX,
              y: p.y + deltaY,
            })),
          };
        } else {
          // Door, Window, Camera
          return { ...el, x: startPos.x + deltaX, y: startPos.y + deltaY };
        }
      });

      onElementsChange(updatedElements);
      return;
    }

    if (isDrawing && startPoint) {
      if (selectedTool === 'room' || selectedTool === 'wall') {
        const snapped = snapToGrid({ x: (point.x - panOffset.x) / zoom, y: (point.y - panOffset.y) / zoom });
        setCurrentPoint(snapped);
      } else if (selectedTool === 'pencil') {
        const unsnapped = { x: (point.x - panOffset.x) / zoom, y: (point.y - panOffset.y) / zoom };
        setPencilPoints((prev) => [...prev, unsnapped]);
        setCurrentPoint(unsnapped);
      }
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning) {
      setIsPanning(false);
      setPanStart(null);
      return;
    }

    // Finalize marquee selection
    if (marqueeSelection?.isActive) {
      const marqueeRect = normalizeRect(marqueeSelection.startPoint, marqueeSelection.currentPoint);

      // Only select if marquee has some size
      if (marqueeRect.width > 5 || marqueeRect.height > 5) {
        const elementsInMarquee = findElementsInMarquee(marqueeRect, elements, panOffset, zoom);
        const selectedIds = elementsInMarquee.map(el => el.id);

        if (e.shiftKey) {
          // Add to existing selection
          const newSelection = [...new Set([...selectedElements, ...selectedIds])];
          setSelectedElements(newSelection);
          onSelectedElementChange?.(newSelection);
        } else {
          // Replace selection
          setSelectedElements(selectedIds);
          onSelectedElementChange?.(selectedIds);
        }
      }

      setMarqueeSelection(null);
      return;
    }

    if (isDragging) {
      setIsDragging(false);
      setDragStartPoint(null);
      setDraggedElementsStartPos(new Map());
      return;
    }

    if (isDrawing && startPoint && currentPoint) {
      if (selectedTool === 'room') {
        const width = currentPoint.x - startPoint.x;
        const height = currentPoint.y - startPoint.y;

        if (Math.abs(width) > GRID_SIZE && Math.abs(height) > GRID_SIZE) {
          const newRoom: Room = {
            id: Date.now().toString(),
            type: 'room',
            x: width > 0 ? startPoint.x : startPoint.x + width,
            y: height > 0 ? startPoint.y : startPoint.y + height,
            width: Math.abs(width),
            height: Math.abs(height),
          };

          onElementsChange([...elements, newRoom]);
        }
      } else if (selectedTool === 'wall') {
        const length = distance(startPoint, currentPoint);

        if (length > GRID_SIZE) {
          const newWall: Wall = {
            id: Date.now().toString(),
            type: 'wall',
            x1: startPoint.x,
            y1: startPoint.y,
            x2: currentPoint.x,
            y2: currentPoint.y,
            thickness: DEFAULT_WALL_THICKNESS,
          };

          onElementsChange([...elements, newWall]);
        }
      }
    }

    if (isDrawing && selectedTool === 'pencil' && pencilPoints.length > 2) {
      const newPath: PencilPath = {
        id: Date.now().toString(),
        type: 'pencil',
        points: pencilPoints,
        color: DEFAULT_PENCIL_COLOR,
        lineWidth: DEFAULT_PENCIL_LINE_WIDTH,
      };

      onElementsChange([...elements, newPath]);
    }

    // Reset drawing state
    setIsDrawing(false);
    setStartPoint(null);
    setCurrentPoint(null);
    setPencilPoints([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (selectedElements.length > 0) {
        onElementsChange(elements.filter((el) => !selectedElements.includes(el.id)));
        setSelectedElements([]);
        onSelectedElementChange?.([]);
      }
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
    const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom + delta));
    onZoomChange?.(newZoom);
  };

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full cursor-crosshair"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      style={{ cursor: selectedTool === 'pan' || isPanning ? 'grab' : 'crosshair' }}
    />
  );
}