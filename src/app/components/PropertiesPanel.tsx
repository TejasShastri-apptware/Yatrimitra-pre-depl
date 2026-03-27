import React from 'react';
import type { FloorPlanElement } from '../types/floorplan';
import { Card } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { COLORS } from '../utils/constants';

interface PropertiesPanelProps {
  selectedElement: FloorPlanElement | null;
  onUpdateElement: (element: FloorPlanElement) => void;
}

export function PropertiesPanel({ selectedElement, onUpdateElement }: PropertiesPanelProps) {
  if (!selectedElement) {
    return null;
  }

  const handleChange = (field: string, value: number) => {
    onUpdateElement({
      ...selectedElement,
      [field]: value,
    });
  };

  return (
    <Card className="w-64 bg-slate-900 border-slate-700 p-4">
      <h3 className="text-white mb-4 border-b border-slate-700 pb-2">
        {selectedElement.type.charAt(0).toUpperCase() + selectedElement.type.slice(1)} Properties
      </h3>

      <div className="space-y-4">
        {selectedElement.type !== 'wall' && selectedElement.type !== 'pencil' && 'x' in selectedElement && (
          <>
            <div>
              <Label className="text-slate-300 text-xs mb-1">X Position</Label>
              <Input
                type="number"
                value={Math.round(selectedElement.x)}
                onChange={(e) => handleChange('x', Number(e.target.value))}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>

            <div>
              <Label className="text-slate-300 text-xs mb-1">Y Position</Label>
              <Input
                type="number"
                value={Math.round(selectedElement.y)}
                onChange={(e) => handleChange('y', Number(e.target.value))}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
          </>
        )}

        {selectedElement.type === 'room' && (
          <>
            <div>
              <Label className="text-slate-300 text-xs mb-1">Room Name</Label>
              <Input
                type="text"
                value={selectedElement.name || ''}
                onChange={(e) => onUpdateElement({ ...selectedElement, name: e.target.value })}
                placeholder="e.g., Living Room"
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              />
            </div>

            <div>
              <Label className="text-slate-300 text-xs mb-1">Width</Label>
              <Input
                type="number"
                value={Math.round(selectedElement.width)}
                onChange={(e) => handleChange('width', Number(e.target.value))}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>

            <div>
              <Label className="text-slate-300 text-xs mb-1">Height</Label>
              <Input
                type="number"
                value={Math.round(selectedElement.height)}
                onChange={(e) => handleChange('height', Number(e.target.value))}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>

            <div>
              <Label className="text-slate-300 text-xs mb-1">Color</Label>
              <Input
                type="color"
                value={selectedElement.color || COLORS.room}
                onChange={(e) => onUpdateElement({ ...selectedElement, color: e.target.value })}
                className="bg-slate-800 border-slate-700 h-10"
              />
            </div>

            <div className="pt-2 border-t border-slate-700 mt-4">
              <Label className="text-blue-400 text-[10px] uppercase font-bold mb-2 block">Zone Analytics</Label>
              <div className="space-y-3">
                <div>
                  <Label className="text-slate-400 text-xs mb-1">Red-Alert Capacity</Label>
                  <Input
                    type="number"
                    value={selectedElement.redAlertCapacity || ''}
                    onChange={(e) => onUpdateElement({ ...selectedElement, redAlertCapacity: Number(e.target.value) })}
                    placeholder="Threshold for red alert"
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <Label className="text-slate-400 text-xs mb-1">Orange-Alert Capacity</Label>
                  <Input
                    type="number"
                    value={selectedElement.orangeAlertCapacity || ''}
                    onChange={(e) => onUpdateElement({ ...selectedElement, orangeAlertCapacity: Number(e.target.value) })}
                    placeholder="Threshold for orange alert"
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <Label className="text-slate-400 text-xs mb-1">Current Population</Label>
                  <Input
                    type="number"
                    value={selectedElement.currentPopulation || ''}
                    onChange={(e) => onUpdateElement({ ...selectedElement, currentPopulation: Number(e.target.value) })}
                    placeholder="Current count"
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {selectedElement.type === 'wall' && (
          <>
            <div>
              <Label className="text-slate-300 text-xs mb-1">Thickness</Label>
              <Input
                type="number"
                value={Math.round(selectedElement.thickness)}
                onChange={(e) => handleChange('thickness', Number(e.target.value))}
                className="bg-slate-800 border-slate-700 text-white"
                min={1}
                max={20}
              />
            </div>

            <div>
              <Label className="text-slate-300 text-xs mb-1">Color</Label>
              <Input
                type="color"
                value={selectedElement.color || COLORS.wall}
                onChange={(e) => onUpdateElement({ ...selectedElement, color: e.target.value })}
                className="bg-slate-800 border-slate-700 h-10"
              />
            </div>
          </>
        )}

        {selectedElement.type === 'text' && (
          <>
            <div>
              <Label className="text-slate-300 text-xs mb-1">Text Content</Label>
              <Input
                type="text"
                value={selectedElement.text}
                onChange={(e) => onUpdateElement({ ...selectedElement, text: e.target.value })}
                placeholder="Enter text..."
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              />
            </div>

            <div>
              <Label className="text-slate-300 text-xs mb-1">Font Size</Label>
              <Input
                type="number"
                value={selectedElement.fontSize || 16}
                onChange={(e) => handleChange('fontSize', Number(e.target.value))}
                className="bg-slate-800 border-slate-700 text-white"
                min={8}
                max={72}
              />
            </div>

            <div>
              <Label className="text-slate-300 text-xs mb-1">Color</Label>
              <Input
                type="color"
                value={selectedElement.color || '#ffffff'}
                onChange={(e) => onUpdateElement({ ...selectedElement, color: e.target.value })}
                className="bg-slate-800 border-slate-700 h-10"
              />
            </div>
          </>
        )}

        {selectedElement.type === 'pencil' && (
          <>
            <div>
              <Label className="text-slate-300 text-xs mb-1">Line Width</Label>
              <Input
                type="number"
                value={Math.round(selectedElement.lineWidth)}
                onChange={(e) => handleChange('lineWidth', Number(e.target.value))}
                className="bg-slate-800 border-slate-700 text-white"
                min={1}
                max={10}
              />
            </div>
            <div>
              <Label className="text-slate-300 text-xs mb-1">Color</Label>
              <Input
                type="color"
                value={selectedElement.color}
                onChange={(e) => onUpdateElement({ ...selectedElement, color: e.target.value })}
                className="bg-slate-800 border-slate-700 h-10"
              />
            </div>
          </>
        )}

        {(selectedElement.type === 'door' ||
          selectedElement.type === 'window') && (
            <div>
              <Label className="text-slate-300 text-xs mb-1">Rotation (degrees)</Label>
              <Input
                type="number"
                value={Math.round(selectedElement.rotation)}
                onChange={(e) => handleChange('rotation', Number(e.target.value))}
                className="bg-slate-800 border-slate-700 text-white"
                step={45}
              />
            </div>
          )}

          {selectedElement.type === 'camera' && (
            <>
            
            <div>
      <Label className="text-slate-300 text-xs mb-1">Room ID</Label>
      <Input
        type="text"
        value={selectedElement.roomId}
        onChange={(e) =>
          onUpdateElement({ ...selectedElement, roomId: e.target.value })
        }
        className="bg-slate-800 border-slate-700 text-white"
      />
    </div>

    <div>
      <Label className="text-slate-300 text-xs mb-1">Rotation (degrees)</Label>
      <Input
        type="number"
        value={Math.round(selectedElement.rotation)}
        onChange={(e) =>
          handleChange('rotation', Number(e.target.value))
        }
        className="bg-slate-800 border-slate-700 text-white"
        step={45}
      />
    </div>

    <div>
      <Label className="text-slate-300 text-xs mb-1">RTSP URL</Label>
      <Input
        type="text"
        value={selectedElement.rtspUrl || ''}
        onChange={(e) =>
          onUpdateElement({ ...selectedElement, rtspUrl: e.target.value })
        }
        placeholder="rtsp://..."
        className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
      />
      <p className="text-[10px] text-slate-500 mt-1">
        Use <span className="text-blue-400">rtsp://rtsp-server:8554/mystream</span> for the internal test stream.
      </p>
    </div>
    </>
          )}

        <div className="pt-2 border-t border-slate-700">
          <div className="text-xs text-slate-400">
            <p>
              <span className="text-slate-500">Type:</span>{' '}
              {selectedElement.type.charAt(0).toUpperCase() + selectedElement.type.slice(1)}
            </p>
            <p className="mt-1">
              <span className="text-slate-500">ID:</span> {selectedElement.id.slice(0, 8)}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
