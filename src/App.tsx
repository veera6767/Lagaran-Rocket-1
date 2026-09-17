import React, { useState, useCallback, useEffect } from 'react';
import { RocketCanvas } from './components/RocketCanvas';
import { HudHeader } from './components/HudHeader';
import { PartsList } from './components/PartsList';
import { PartInfoPanel } from './components/PartInfoPanel';
import { ControlBar } from './components/ControlBar';
import { CameraPreset } from './types';
import { ROCKET_PARTS } from './data/rocketParts';
import { MousePointer, Eye, HelpCircle } from 'lucide-react';

const getPresetForPart = (id: string): CameraPreset => {
  switch (id) {
    case 'nozzle':
    case 'motor-casing':
    case 'fins':
      return 'engine';
    case 'bulkhead-lower':
    case 'recovery-bay':
      return 'recovery';
    case 'bulkhead-upper':
    case 'payload-bay':
      return 'payload';
    case 'nose-cone':
      return 'nose';
    default:
      return 'hero';
  }
};

export default function App() {
  const [selectedPartId, setSelectedPartId] = useState<string | null>(null);
  const [isExploded, setIsExploded] = useState<boolean>(false);
  const [explodeProgress, setExplodeProgress] = useState<number>(0.0);
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [wireframe, setWireframe] = useState<boolean>(false);
  const [showStabilityMarkers, setShowStabilityMarkers] = useState<boolean>(false);
  const [cameraPresetTrigger, setCameraPresetTrigger] = useState<{ preset: CameraPreset; id: number } | null>(null);
  const [resetCameraTrigger, setResetCameraTrigger] = useState<number>(0);

  // Active tab on mobile/compact screens ('parts' | 'info' | 'none')
  const [mobileTab, setMobileTab] = useState<'parts' | 'info' | 'none'>('none');

  const selectedPart = ROCKET_PARTS.find((p) => p.id === selectedPartId);

  // Handle Explode Toggle
  const handleToggleExplode = useCallback(() => {
    setIsExploded((prev) => {
      const next = !prev;
      setExplodeProgress(next ? 1.0 : 0.0);
      return next;
    });
  }, []);

  // Handle Explode Slider change
  const handleExplodeProgressChange = useCallback((val: number) => {
    setExplodeProgress(val);
    setIsExploded(val > 0.05);
  }, []);

  // Handle Camera Presets
  const handleSelectPreset = useCallback((preset: CameraPreset) => {
    setCameraPresetTrigger({ preset, id: Date.now() });
  }, []);

  // Handle Reset Camera
  const handleResetCamera = useCallback(() => {
    setResetCameraTrigger(Date.now());
  }, []);

  // Select part and automatically open info panel on small screens
  const handleSelectPart = useCallback((partId: string | null) => {
    setSelectedPartId(partId);
    if (partId && window.innerWidth < 768) {
      setMobileTab('info');
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleToggleExplode();
      } else if (e.key === 'r' || e.key === 'R') {
        handleResetCamera();
      } else if (e.key === 'a' || e.key === 'A') {
        setAutoRotate((prev) => !prev);
      } else if (e.key === 'w' || e.key === 'W') {
        setWireframe((prev) => !prev);
      } else if (e.key === 's' || e.key === 'S') {
        setShowStabilityMarkers((prev) => !prev);
      } else if (e.key === '1') {
        handleSelectPreset('hero');
      } else if (e.key === '2') {
        handleSelectPreset('full');
      } else if (e.key === '3') {
        handleSelectPreset('engine');
      } else if (e.key === '4') {
        handleSelectPreset('payload');
      } else if (e.key === '5') {
        handleSelectPreset('nose');
      } else if (e.key === 'Escape') {
        setSelectedPartId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleToggleExplode, handleResetCamera, handleSelectPreset]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#050608] text-slate-100 font-sans select-none">
      {/* 3D Three.js Canvas Layer */}
      <RocketCanvas
        selectedPartId={selectedPartId}
        onSelectPart={handleSelectPart}
        isExploded={isExploded}
        explodeProgress={explodeProgress}
        onExplodeProgressChange={setExplodeProgress}
        autoRotate={autoRotate}
        wireframe={wireframe}
        showStabilityMarkers={showStabilityMarkers}
        cameraPresetTrigger={cameraPresetTrigger}
        resetCameraTrigger={resetCameraTrigger}
      />

      {/* Atmospheric Space Vignette */}
      <div className="pointer-events-none absolute inset-0 bg-radial-[circle_at_center,transparent_45%,rgba(2,4,7,0.85)_100%]" />

      {/* Floating UI HUD Layout */}
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-3 md:p-5">
        {/* Top Header HUD */}
        <HudHeader exploded={isExploded} selectedPartName={selectedPart ? selectedPart.name : null} />

        {/* Center Lateral Floating Panels (Desktop & Tablet) */}
        <div className="pointer-events-none flex-1 flex justify-between items-start my-3 gap-4 min-h-0 overflow-hidden">
          {/* Left Panel: Parts Stack Hierarchy */}
          <div className="hidden md:block pointer-events-auto shrink-0 max-h-full">
            <PartsList
              selectedPartId={selectedPartId}
              onSelectPart={handleSelectPart}
              onFocusPreset={(partId) => handleSelectPreset(getPresetForPart(partId))}
            />
          </div>

          {/* Interaction Instruction Pill (Desktop center top) */}
          <div className="hidden lg:flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-cyan-500/25 text-[11px] font-tech text-slate-300 shadow-[0_0_15px_rgba(0,229,255,0.1)] mx-auto">
            <span className="flex items-center gap-1.5 text-cyan-200">
              <MousePointer className="w-3.5 h-3.5 text-[#00E5FF] drop-shadow-[0_0_4px_#00E5FF]" />
              Drag to Orbit
            </span>
            <span className="text-cyan-500/40">•</span>
            <span>Scroll to Zoom</span>
            <span className="text-cyan-500/40">•</span>
            <span className="text-[#00E5FF] glow-cyan-text">Click Section to Inspect</span>
          </div>

          {/* Right Panel: Subsystem Engineering Inspector */}
          <div className="hidden md:block pointer-events-auto shrink-0 max-h-full">
            <PartInfoPanel
              selectedPartId={selectedPartId}
              onClose={() => setSelectedPartId(null)}
              onFocusCameraPreset={handleSelectPreset}
            />
          </div>
        </div>

        {/* Mobile Floating Drawer Switchers */}
        <div className="md:hidden pointer-events-auto flex items-center justify-center gap-2 mb-2 font-tech">
          <button
            type="button"
            onClick={() => setMobileTab(mobileTab === 'parts' ? 'none' : 'parts')}
            className={`px-3 py-1.5 rounded-lg text-xs border transition-all cursor-pointer ${
              mobileTab === 'parts'
                ? 'bg-cyan-500 text-black font-bold border-cyan-300 shadow-[0_0_15px_rgba(0,229,255,0.5)]'
                : 'bg-[#05070d]/90 text-slate-300 border-cyan-500/25 hover:border-cyan-400/50'
            }`}
          >
            Rocket Structure (8)
          </button>
          <button
            type="button"
            onClick={() => setMobileTab(mobileTab === 'info' ? 'none' : 'info')}
            className={`px-3 py-1.5 rounded-lg text-xs border transition-all cursor-pointer ${
              mobileTab === 'info'
                ? 'bg-cyan-500 text-black font-bold border-cyan-300 shadow-[0_0_15px_rgba(0,229,255,0.5)]'
                : 'bg-[#05070d]/90 text-slate-300 border-cyan-500/25 hover:border-cyan-400/50'
            }`}
          >
            Engineering Specs
          </button>
        </div>

        {/* Mobile Modal Drawer Content */}
        {mobileTab === 'parts' && (
          <div className="md:hidden pointer-events-auto mb-2 max-h-[50vh] overflow-y-auto">
            <PartsList
              selectedPartId={selectedPartId}
              onSelectPart={(id) => {
                handleSelectPart(id);
                setMobileTab('info');
              }}
            />
          </div>
        )}

        {mobileTab === 'info' && (
          <div className="md:hidden pointer-events-auto mb-2 max-h-[50vh] overflow-y-auto">
            <PartInfoPanel
              selectedPartId={selectedPartId}
              onClose={() => {
                setSelectedPartId(null);
                setMobileTab('none');
              }}
              onFocusCameraPreset={handleSelectPreset}
            />
          </div>
        )}

        {/* Bottom Control Bar */}
        <ControlBar
          isExploded={isExploded}
          explodeProgress={explodeProgress}
          onToggleExplode={handleToggleExplode}
          onExplodeProgressChange={handleExplodeProgressChange}
          autoRotate={autoRotate}
          onToggleAutoRotate={() => setAutoRotate((prev) => !prev)}
          onResetCamera={handleResetCamera}
          onSelectPreset={handleSelectPreset}
          wireframe={wireframe}
          onToggleWireframe={() => setWireframe((prev) => !prev)}
          showStabilityMarkers={showStabilityMarkers}
          onToggleStabilityMarkers={() => setShowStabilityMarkers((prev) => !prev)}
        />
      </div>
    </div>
  );
}
