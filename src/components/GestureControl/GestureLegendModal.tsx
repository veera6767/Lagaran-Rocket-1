import React from 'react';
import { X, Hand, Sparkles, Move, ZoomIn, Box, HelpCircle } from 'lucide-react';

interface GestureLegendModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GestureLegendModal: React.FC<GestureLegendModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn select-none pointer-events-auto">
      <div className="w-full max-w-md bg-[#05070d]/95 border border-cyan-500/35 rounded-2xl shadow-[0_0_40px_rgba(0,229,255,0.2),0_20px_50px_rgba(0,0,0,0.95)] p-5 relative font-tech text-slate-100 overflow-hidden">
        {/* Corner HUD Accents */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-400 pointer-events-none rounded-tl-sm" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-400 pointer-events-none rounded-tr-sm" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-400 pointer-events-none rounded-bl-sm" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-400 pointer-events-none rounded-br-sm" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-cyan-500/20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/50 border border-cyan-400/50 flex items-center justify-center text-[#00E5FF] shadow-[0_0_12px_rgba(0,229,255,0.3)]">
              <Hand className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-orbitron font-bold text-sm tracking-wider text-cyan-200 uppercase">
                Gesture Flight Control
              </h3>
              <p className="text-[10px] text-slate-400">Low-latency hand tracking via webcam</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white hover:bg-cyan-950/30 rounded transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Legend Gestures Cards */}
        <div className="space-y-3 mb-5">
          {/* 1. Open Hand */}
          <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/25 flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-black/60 border border-cyan-400/40 flex items-center justify-center text-2xl shrink-0">
              🖐️
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-orbitron font-bold text-xs text-[#00E5FF]">OPEN HAND</span>
                <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-cyan-500/10 border border-cyan-400/30 text-cyan-300">
                  Continuous Mode
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-snug">
                <strong>Move Horizontally:</strong> Move hand left/right to continuously rotate the rocket.
              </p>
              <p className="text-xs text-slate-300 leading-snug">
                <strong>Depth Zoom:</strong> Move hand closer to camera to zoom in; move hand farther to zoom out.
              </p>
              <p className="text-[10px] text-cyan-400/70 italic">
                * Hold hand still to stop all camera movement.
              </p>
            </div>
          </div>

          {/* 2. Fist */}
          <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/25 flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-black/60 border border-amber-400/40 flex items-center justify-center text-2xl shrink-0">
              ✊
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-orbitron font-bold text-xs text-amber-300">FIST</span>
                <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-amber-500/10 border border-amber-400/30 text-amber-300">
                  Hold 300ms
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-snug">
                Close your hand into a fist to smoothly trigger the <strong>Exploded View</strong>.
              </p>
            </div>
          </div>

          {/* 3. Peace Sign */}
          <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/25 flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-black/60 border border-emerald-400/40 flex items-center justify-center text-2xl shrink-0">
              ✌️
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-orbitron font-bold text-xs text-emerald-300">PEACE SIGN</span>
                <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-emerald-500/10 border border-emerald-400/30 text-emerald-300">
                  Hold 300ms
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-snug">
                Extend index and middle fingers to smoothly <strong>Collapse</strong> back to the assembled rocket.
              </p>
            </div>
          </div>
        </div>

        {/* Footer info & Dismiss */}
        <div className="flex items-center justify-between pt-2 border-t border-cyan-500/15">
          <span className="text-[10px] text-slate-400">Mouse & keyboard remain active at all times.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-orbitron font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_15px_rgba(0,229,255,0.4)]"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
