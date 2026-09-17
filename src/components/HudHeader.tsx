import React from 'react';
import { Rocket, Activity, Zap } from 'lucide-react';
import { VEHICLE_SUMMARY } from '../data/rocketParts';

interface HudHeaderProps {
  exploded: boolean;
  selectedPartName?: string | null;
}

export const HudHeader: React.FC<HudHeaderProps> = ({ exploded, selectedPartName }) => {
  return (
    <header className="pointer-events-auto flex flex-col md:flex-row md:items-center justify-between gap-3 p-3.5 md:p-4 bg-[#05070d]/85 backdrop-blur-xl border border-cyan-500/25 rounded-xl shadow-[0_0_25px_rgba(0,229,255,0.06),0_15px_30px_rgba(0,0,0,0.85)] relative">
      {/* Decorative HUD Corner Bracket Highlights */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-400/60 pointer-events-none rounded-tl-sm" />
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-400/60 pointer-events-none rounded-tr-sm" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-400/60 pointer-events-none rounded-bl-sm" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-400/60 pointer-events-none rounded-br-sm" />

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-cyan-950/40 border border-cyan-400/40 flex items-center justify-center text-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.3)] shrink-0">
          <Rocket className="w-5 h-5 drop-shadow-[0_0_6px_rgba(0,229,255,0.8)]" />
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-orbitron font-extrabold text-lg md:text-2xl tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-cyan-400 glow-cyan-text uppercase">
              {VEHICLE_SUMMARY.designation}
            </span>
            <span className="px-2 py-0.5 text-[10px] font-tech font-bold tracking-widest uppercase rounded bg-cyan-500/10 text-[#00E5FF] border border-cyan-400/30 shadow-[0_0_8px_rgba(0,229,255,0.2)]">
              HUD CALLSIGN
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-tech text-[#00E5FF] bg-cyan-950/30 rounded border border-cyan-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse shadow-[0_0_6px_#00E5FF]" />
              ONLINE 60FPS
            </span>
          </div>
          <p className="text-xs text-slate-400 font-sans tracking-wide">
            Suborbital Aerodynamic Vehicle • Single-Stage Solid Rocket Engineering Inspector
          </p>
        </div>
      </div>

      {/* Flight Telemetry Ribbon */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 text-xs font-tech">
        <div className="px-2.5 py-1.5 rounded-lg bg-black/50 border border-cyan-500/15 hover:border-cyan-400/40 transition-colors flex flex-col shrink-0">
          <span className="text-[10px] text-slate-400 tracking-wider uppercase">Total Length</span>
          <span className="font-bold text-slate-100">{VEHICLE_SUMMARY.totalLengthM.toFixed(2)} m</span>
        </div>
        <div className="px-2.5 py-1.5 rounded-lg bg-black/50 border border-cyan-500/15 hover:border-cyan-400/40 transition-colors flex flex-col shrink-0">
          <span className="text-[10px] text-slate-400 tracking-wider uppercase">Airframe Dia</span>
          <span className="font-bold text-slate-100">{VEHICLE_SUMMARY.diameterMm} mm</span>
        </div>
        <div className="px-2.5 py-1.5 rounded-lg bg-black/50 border border-cyan-500/15 hover:border-cyan-400/40 transition-colors flex flex-col shrink-0">
          <span className="text-[10px] text-slate-400 tracking-wider uppercase">Wet Mass</span>
          <span className="font-bold text-[#00E5FF] drop-shadow-[0_0_4px_rgba(0,229,255,0.4)]">{VEHICLE_SUMMARY.wetMassKg.toFixed(2)} kg</span>
        </div>
        <div className="px-2.5 py-1.5 rounded-lg bg-black/50 border border-cyan-500/15 hover:border-cyan-400/40 transition-colors flex flex-col shrink-0">
          <span className="text-[10px] text-slate-400 tracking-wider uppercase">Max Velocity</span>
          <span className="font-bold text-[#00E5FF] drop-shadow-[0_0_4px_rgba(0,229,255,0.4)]">
            {VEHICLE_SUMMARY.maxVelocityMs} m/s ({VEHICLE_SUMMARY.maxMach})
          </span>
        </div>
        <div className="px-2.5 py-1.5 rounded-lg bg-black/50 border border-cyan-500/15 hover:border-cyan-400/40 transition-colors flex flex-col shrink-0">
          <span className="text-[10px] text-slate-400 tracking-wider uppercase">Target Apogee</span>
          <span className="font-bold text-slate-100">{VEHICLE_SUMMARY.maxApogeeM.toLocaleString()} m</span>
        </div>
        <div className="px-2.5 py-1.5 rounded-lg bg-black/50 border border-cyan-500/15 hover:border-cyan-400/40 transition-colors flex flex-col shrink-0">
          <span className="text-[10px] text-slate-400 tracking-wider uppercase">View Mode</span>
          <span className={`font-bold ${exploded ? 'text-[#FF5A1F] drop-shadow-[0_0_5px_rgba(255,90,31,0.5)]' : 'text-[#00E5FF]'}`}>
            {exploded ? 'Exploded' : 'Stacked'}
          </span>
        </div>
        {selectedPartName && (
          <div className="px-2.5 py-1.5 rounded-lg bg-cyan-950/40 border border-cyan-400/50 flex flex-col shrink-0 shadow-[0_0_12px_rgba(0,229,255,0.25)]">
            <span className="text-[10px] text-cyan-300 tracking-wider uppercase">Active Target</span>
            <span className="font-bold text-white flex items-center gap-1.5 glow-cyan-text">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse" />
              {selectedPartName}
            </span>
          </div>
        )}
      </div>
    </header>
  );
};
