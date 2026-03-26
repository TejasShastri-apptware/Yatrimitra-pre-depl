import React, { useState } from 'react';
import { Download, Upload, Save, FolderOpen, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import type { FloorPlanElement, Diagram } from '../types/floorplan';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "./ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface SaveLoadPanelProps {
  elements: FloorPlanElement[];
  onLoadElements: (elements: FloorPlanElement[]) => void;
}

const DIAGRAMS_KEY = 'diagrams';

export function SaveLoadPanel({ elements, onLoadElements }: SaveLoadPanelProps) {
  const [diagramName, setDiagramName] = useState('');
  const [savedDiagrams, setSavedDiagrams] = useState<Diagram[]>(() => {
    const saved = localStorage.getItem(DIAGRAMS_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [isOpenSave, setIsOpenSave] = useState(false);
  const [isOpenLoad, setIsOpenLoad] = useState(false);

  // Refresh saved diagrams list when opening load dialog
  const refreshSavedDiagrams = () => {
    const saved = localStorage.getItem(DIAGRAMS_KEY);
    setSavedDiagrams(saved ? JSON.parse(saved) : []);
  };

  const handleSaveToBrowser = () => {
    if (!diagramName.trim()) {
      alert('Please enter a name for your diagram');
      return;
    }

    const newDiagram: Diagram = {
      id: Math.random().toString(36).substr(2, 9),
      name: diagramName.trim(),
      updatedAt: Date.now(),
      elements: elements,
    };

    const updated = [newDiagram, ...savedDiagrams];
    setSavedDiagrams(updated);
    localStorage.setItem(DIAGRAMS_KEY, JSON.stringify(updated));
    setDiagramName('');
    setIsOpenSave(false);
  };

  const handleLoadFromBrowser = (diagram: Diagram) => {
    if (window.confirm(`Load "${diagram.name}"? Current work will be replaced.`)) {
      onLoadElements(diagram.elements);
      setIsOpenLoad(false);
    }
  };

  const handleDeleteDiagram = (id: string, name: string) => {
    if (window.confirm(`Delete "${name}"?`)) {
      const updated = savedDiagrams.filter((d) => d.id !== id);
      setSavedDiagrams(updated);
      localStorage.setItem(DIAGRAMS_KEY, JSON.stringify(updated));
    }
  };

  const handleExportToFile = () => {
    const dataStr = JSON.stringify(
      {
        version: '1.0',
        name: diagramName || 'floorplan',
        created: new Date().toISOString(),
        elements: elements,
      },
      null,
      2
    );
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${diagramName || 'floorplan'}-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFromFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.elements && Array.isArray(data.elements)) {
          onLoadElements(data.elements);
        } else {
          alert('Invalid file format');
        }
      } catch (error) {
        alert('Error reading file');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  return (
    <>
      <DropdownMenu onOpenChange={(open) => { if (open) refreshSavedDiagrams(); }}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-10 text-slate-300 hover:text-white hover:bg-slate-800"
          >
            <FolderOpen className="h-4 w-4" />
            <span className="ml-2">File</span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-56 bg-slate-900 border-slate-700 text-slate-200">
          <DropdownMenuLabel className="text-slate-400">Project Management</DropdownMenuLabel>

          <DropdownMenuItem
            onSelect={() => setIsOpenSave(true)}
            className="hover:bg-slate-800 focus:bg-slate-800 text-slate-200"
          >
            <Save className="h-4 w-4 mr-2" />
            <span>Save as New Blueprint</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onSelect={() => { refreshSavedDiagrams(); setIsOpenLoad(true); }}
            className="hover:bg-slate-800 focus:bg-slate-800 text-slate-200"
          >
            <FolderOpen className="h-4 w-4 mr-2" />
            <span>Open Saved Blueprint</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="bg-slate-700" />

          <DropdownMenuLabel className="text-slate-400">Import / Export</DropdownMenuLabel>

          <DropdownMenuItem
            onSelect={handleExportToFile}
            disabled={elements.length === 0}
            className="hover:bg-slate-800 focus:bg-slate-800 text-slate-200"
          >
            <Download className="h-4 w-4 mr-2" />
            <span>Download .json file</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onSelect={() => document.getElementById("file-import-input")?.click()}
            className="hover:bg-slate-800 focus:bg-slate-800 text-slate-200"
          >
            <Upload className="h-4 w-4 mr-2" />
            <span>Import .json file</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Hidden File Input */}
      <input
        id="file-import-input"
        type="file"
        accept=".json"
        onChange={handleImportFromFile}
        className="hidden"
      />

      {/* Save Dialog */}
      <Dialog open={isOpenSave} onOpenChange={setIsOpenSave}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-light">Save New Blueprint</DialogTitle>
            <DialogDescription className="text-slate-400">
              This will create a new architectural blueprint in your browser storage.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-2">
            <Label htmlFor="diagram-name" className="text-slate-400">Blueprint Name</Label>
            <Input
              id="diagram-name"
              value={diagramName}
              onChange={(e) => setDiagramName(e.target.value)}
              placeholder="e.g. Ground Floor Plan"
              className="bg-slate-950 border-slate-700 text-white focus:ring-blue-500"
            />
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => setIsOpenSave(false)}
              className="text-slate-400 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveToBrowser}
              className="bg-blue-600 hover:bg-blue-500 text-white px-6"
            >
              Save Blueprint
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Load Dialog */}
      <Dialog open={isOpenLoad} onOpenChange={(open) => { setIsOpenLoad(open); if (open) refreshSavedDiagrams(); }}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-md shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-light">Open Blueprint</DialogTitle>
            <DialogDescription className="text-slate-400">
              Select a project to load into the editor.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 max-h-[400px] overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-slate-700">
            {savedDiagrams.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-xl">
                <p className="text-slate-500 italic">No blueprints found in storage.</p>
              </div>
            ) : (
              savedDiagrams.map((diagram) => (
                <div
                  key={diagram.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-slate-800 bg-slate-950/50 hover:bg-slate-800/50 hover:border-blue-500/30 transition-all group"
                >
                  <div className="flex flex-col overflow-hidden">
                    <span className="font-medium text-slate-200 truncate">{diagram.name}</span>
                    <span className="text-[10px] font-mono text-slate-500 uppercase mt-1">
                      Modified {new Date(diagram.updatedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                      onClick={() => handleLoadFromBrowser(diagram)}
                    >
                      Load
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-slate-600 hover:text-red-400 hover:bg-red-900/10 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDeleteDiagram(diagram.id, diagram.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <Button
              variant="ghost"
              onClick={() => setIsOpenLoad(false)}
              className="text-slate-400 hover:text-white"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}