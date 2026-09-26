import React, { useRef, useEffect } from 'react';
import { LandmarkPoint, GestureState } from '../../types/gesture';
import { Camera, RefreshCw, HelpCircle, X, AlertTriangle, Eye } from 'lucide-react';

interface WebcamPreviewHUDProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  gestureState: GestureState;
  extendedCount: number;
  holdProgress: number; // 0 to 1 for FIST / PEACE 300ms confirm window
  landmarks?: LandmarkPoint[];
  lowLightDetected?: boolean;
  onOpenLegend: () => void;
  onRecalibrate: () => void;
  onClose: () => void;
}

export const WebcamPreviewHUD: React.FC<WebcamPreviewHUDProps> = ({
  videoRef,
  gestureState,
  extendedCount,
  holdProgress,
  landmarks,
  lowLightDetected = false,
  onOpenLegend,
  onRecalibrate,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Render hand landmarks skeleton onto the canvas preview overlay
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (landmarks && landmarks.length >= 21) {
      const w = canvas.width;
      const h = canvas.height;

      // Connections between hand landmarks
      const connections = [
        // Palm base
        [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
        [0, 5], [5, 6], [6, 7], [7, 8], // Index
        [0, 9], [9, 10], [10, 11], [11, 12], // Middle
        [0, 13], [13, 14], [14, 15], [15, 16], // Ring
        [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
        [5, 9], [9, 13], [13, 17], // Palm bridge
      ];

      // Draw skeleton lines
      ctx.lineWidth = 2;
      ctx.strokeStyle = gestureState === 'OPEN HAND'
        ? 'rgba(0, 229, 255, 0.7)'
        : gestureState === 'FIST'
        ? 'rgba(255, 140, 0, 0.8)'
        : gestureState === 'PEACE'
        ? 'rgba(16, 185, 129, 0.8)'
        : 'rgba(148, 163, 184, 0.5)';

      ctx.beginPath();
      for (const [start, end] of connections) {
        // Mirrored X for visual alignment with user
        const x1 = (1.0 - landmarks[start].x) * w;
        const y1 = landmarks[start].y * h;
        const x2 = (1.0 - landmarks[end].x) * w;
        const y2 = landmarks[end].y * h;

        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
      }
      ctx.stroke();

      // Draw landmark points
      for (let i = 0; i < landmarks.length; i++) {
        const pt = landmarks[i];
        const x = (1.0 - pt.x) * w;
        const y = pt.y * h;

        ctx.beginPath();
        const isTip = [4, 8, 12, 16, 20].includes(i);
        const radius = isTip ? 3.5 : 2;
        ctx.arc(x, y, radius, 0, Math.PI * 2);

        if (isTip) {
          ctx.fillStyle = '#00E5FF';
          ctx.shadowColor = '#00E5FF';
          ctx.shadowBlur = 6;
        } else {
          ctx.fillStyle = '#FFFFFF';
          ctx.shadowBlur = 0;
        }
        ctx.fill();
      }
      ctx.shadowBlur = 0;
    }
  }, [landmarks, gestureState]);

  // Color & label based on current gesture state
  const getBadgeDetails = () => {
    switch (gestureState) {
      case 'OPEN HAND':
        return {
          label: 'Tracking: Open Hand',
          colorClass: 'text-cyan-300 border-cyan-400/40 bg-cyan-950/40 glow-cyan-text',
          dotClass: 'bg-cyan-400 shadow-[0_0_8px_#00E5FF]',
        };
      case 'FIST':
        return {
          label: holdProgress >= 1 ? 'Fist Triggered' : 'Fist Held',
          colorClass: 'text-amber-300 border-amber-400/40 bg-amber-950/40',
          dotClass: 'bg-amber-400 shadow-[0_0_8px_#F59E0B]',
        };
      case 'PEACE':
        return {
          label: holdProgress >= 1 ? 'Peace Triggered' : 'Peace Sign',
          colorClass: 'text-emerald-300 border-emerald-400/40 bg-emerald-950/40',
          dotClass: 'bg-emerald-400 shadow-[0_0_8px_#10B981]',
        };
      case 'OTHER':
        return {
          label: `Tracking (${extendedCount} fingers)`,
          colorClass: 'text-slate-300 border-slate-500/30 bg-slate-900/40',
          dotClass: 'bg-slate-400',
        };
      case 'NO HAND':
      default:
        return {
          label: 'No Hand Detected',
          colorClass: 'text-slate-400 border-slate-600/30 bg-black/40',
          dotClass: 'bg-slate-600',
        };
    }
  };

  const badge = getBadgeDetails();

  return (
    <div className="fixed bottom-24 right-4 z-40 w-44 sm:w-48 bg-[#05070d]/90 backdrop-blur-xl border border-cyan-500/30 rounded-xl shadow-[0_0_30px_rgba(0,229,255,0.12),0_15px_35px_rgba(0,0,0,0.9)] overflow-hidden font-tech select-none animate-fadeIn">
      {/* Corner HUD Accents */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-cyan-400 pointer-events-none rounded-tl-sm" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-cyan-400 pointer-events-none rounded-tr-sm" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-cyan-400 pointer-events-none rounded-bl-sm" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-cyan-400 pointer-events-none rounded-br-sm" />

      {/* Header bar */}
      <div className="px-2.5 py-1.5 bg-black/60 border-b border-cyan-500/20 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-cyan-300">
          <Camera className="w-3 h-3 text-[#00E5FF]" />
          <span>Hand HUD</span>
        </div>
        <div className="flex items-center gap-1 text-slate-400">
          <button
            type="button"
            onClick={onRecalibrate}
            title="Recalibrate Hand Tracking"
            className="p-1 hover:text-cyan-300 hover:bg-cyan-950/40 rounded transition-all cursor-pointer"
          >
            <RefreshCw className="w-2.5 h-2.5" />
          </button>
          <button
            type="button"
            onClick={onOpenLegend}
            title="Gesture Guide & Legend"
            className="p-1 hover:text-cyan-300 hover:bg-cyan-950/40 rounded transition-all cursor-pointer"
          >
            <HelpCircle className="w-2.5 h-2.5" />
          </button>
          <button
            type="button"
            onClick={onClose}
            title="Turn Off Gesture Control"
            className="p-1 hover:text-red-400 hover:bg-red-950/40 rounded transition-all cursor-pointer"
          >
            <X className="w-2.5 h-2.5" />
          </button>
        </div>
      </div>

      {/* Camera Video Thumbnail Feed (with Canvas Overlay) */}
      <div className="relative w-full aspect-[4/3] bg-black/80 overflow-hidden">
        {/* Mirrored video preview */}
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className="w-full h-full object-cover scale-x-[-1]"
        />

        {/* Real-time Hand Skeleton Overlay */}
        <canvas
          ref={canvasRef}
          width={160}
          height={120}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />

        {/* Scanline overlay effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent bg-[length:100%_4px] pointer-events-none" />

        {/* Hold Progress Bar for FIST or PEACE confirmation */}
        {holdProgress > 0 && holdProgress < 1 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/60">
            <div
              className={`h-full transition-all duration-75 ${
                gestureState === 'FIST' ? 'bg-amber-400' : 'bg-emerald-400'
              }`}
              style={{ width: `${Math.min(100, Math.round(holdProgress * 100))}%` }}
            />
          </div>
        )}
      </div>

      {/* Real-time Gesture State Badge */}
      <div className="p-2 bg-black/70 space-y-1">
        <div
          className={`flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-bold border transition-colors ${badge.colorClass}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${badge.dotClass}`} />
          <span className="truncate">{badge.label}</span>
        </div>

        {/* Low Lighting Warning hint */}
        {lowLightDetected && (
          <div className="flex items-center gap-1 text-[9px] text-amber-300/90 px-1">
            <AlertTriangle className="w-2.5 h-2.5 shrink-0 text-amber-400" />
            <span className="truncate">Low lighting: face a light source</span>
          </div>
        )}
      </div>
    </div>
  );
};
