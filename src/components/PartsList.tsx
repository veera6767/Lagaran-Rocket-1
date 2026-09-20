import React, { useState } from 'react';
import { Layers, ChevronDown, ChevronUp, Flame, Disc, Radio, Wind, Eye, Scale, ShieldAlert } from 'lucide-react';
import { ROCKET_PARTS, VEHICLE_TOTALS } from '../data/rocketParts';
import { RocketPartInfo } from '../types';

interface PartsListProps {
  selectedPartId: string | null;
  onSelectPart: (partId: string | null) => void;
  onFocusPreset?: (partId: string) => void;
  onOpenMassBreakdown?: () => void;
}

export const PartsList: React.FC<PartsListProps> = ({
  selectedPartId,
  onSelectPart,
  onFocusPreset,
  onOpenMassBreakdown,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [sortOrder, setSortOrder] = useState<'nose-to-tail' | 'tail-to-nose'>('nose-to-tail');

  const orderedParts = [...ROCKET_PARTS].sort((a, b) =>
    sortOrder === 'nose-to-tail' ? a.order - b.order : b.order - a.order
  );

  const getPartIcon = (id: string) => {
    switch (id) {
      case 'nose-cone':
        return <Wind className="w-3.5 h-3.5 text-[#8B939B]" />;
      case 'avionics-bay':
        return <Radio className="w-3.5 h-3.5 text-cyan-300" />;
      case 'drogue-bay':
        return <Layers className="w-3.5 h-3.5 text-cyan-400" />;
      case 'booster-section':
        return <Disc className="w-3.5 h-3.5 text-slate-300" />;
      case 'inner-motor':
        return <Flame className="w-3.5 h-3.5 text-[#FF5A1F]" />;
      case 'fins':
        return <Wind className="w-3.5 h-3.5 text-slate-300" />;
      default:
        return <Disc className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <aside className="pointer-events-auto w-full md:w-80 bg-[#05070d]/85 backdrop-blur-xl border border-cyan-500/25 rounded-xl shadow-[0_0_25px_rgba(0,229,255,0.06),0_15px_30px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col max-h-[calc(100vh-140px)] relative">
      {/* Decorative HUD Corner Bracket Highlights */}
      <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-cyan-400/60 pointer-events-none rounded-tl-sm" />
      <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-cyan-400/60 pointer-events-none rounded-tr-sm" />
      <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-cyan-400/60 pointer-events-none rounded-bl-sm" />
      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-cyan-400/60 pointer-events-none rounded-br-sm" />

      {/* Header */}
      <div className="p-3.5 border-b border-cyan-500/20 flex items-center justify-between bg-black/40">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#00E5FF] drop-shadow-[0_0_5px_rgba(0,229,255,0.8)]" />
          <h2 className="font-orbitron font-bold text-sm tracking-wider text-slate-100 uppercase glow-cyan-text">
            Rocket Structure
          </h2>
          <span className="text-[10px] font-tech text-cyan-400 bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-500/30">
            6 Sections
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setSortOrder(sortOrder === 'nose-to-tail' ? 'tail-to-nose' : 'nose-to-tail')}
            title="Toggle assembly order"
            className="text-[10px] font-tech text-slate-400 hover:text-cyan-300 px-2 py-0.5 rounded bg-black/40 hover:bg-cyan-950/30 border border-cyan-500/20 transition-all cursor-pointer"
          >
            {sortOrder === 'nose-to-tail' ? 'Nose → Tail' : 'Tail → Nose'}
          </button>
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Expand parts list' : 'Collapse parts list'}
            className="text-slate-400 hover:text-cyan-300 p-1 rounded hover:bg-cyan-950/30 cursor-pointer transition-colors"
          >
            {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="p-2 space-y-1.5 overflow-y-auto custom-scrollbar flex-1 text-xs">
          {/* Quick selection clear if active */}
          {selectedPartId && (
            <div className="px-2.5 py-1.5 mb-1 flex items-center justify-between text-[11px] font-tech text-slate-400 bg-black/50 rounded border border-cyan-500/20">
              <span className="flex items-center gap-1.5 text-cyan-300">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse" />
                Telemetry Lock Active
              </span>
              <button
                type="button"
                onClick={() => onSelectPart(null)}
                className="text-cyan-400 hover:text-cyan-200 underline cursor-pointer"
              >
                Clear Selection
              </button>
            </div>
          )}

          {orderedParts.map((part) => {
            const isSelected = selectedPartId === part.id;
            const isMotor = part.id === 'inner-motor';

            return (
              <div
                key={part.id}
                onClick={() => onSelectPart(isSelected ? null : part.id)}
                className={`group relative p-2.5 rounded-lg border transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_16px_rgba(0,229,255,0.35)]'
                    : 'bg-black/40 border-cyan-500/10 hover:bg-cyan-950/20 hover:border-cyan-500/30'
                }`}
              >
                {/* Active indicator bar */}
                {isSelected && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#00E5FF] rounded-r shadow-[0_0_8px_#00E5FF]" />
                )}

                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-tech text-[10px] text-cyan-400/70 w-5">
                      0{part.order}
                    </span>
                    <div className="p-1 rounded bg-black/60 border border-cyan-500/20">
                      {getPartIcon(part.id)}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                        <span className={isSelected ? 'text-white drop-shadow-[0_0_6px_rgba(0,229,255,0.6)]' : ''}>
                          {part.name}
                        </span>
                        {isSelected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-ping" />
                        )}
                      </div>
                      <div className="text-[10px] font-tech text-slate-400 flex items-center gap-1">
                        <span>{part.lengthMm} mm</span>
                        <span>•</span>
                        <span>{part.material.split('/')[0]}</span>
                        <span>•</span>
                        <span className="text-cyan-300/90 font-bold">{part.massKg.toFixed(2)} kg</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1">
                      {onFocusPreset && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onFocusPreset(part.id);
                          }}
                          className="p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-cyan-950/40 transition-colors"
                          title="Center camera on part"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <span className="text-[9px] font-tech px-1 rounded bg-black/40 text-slate-400 border border-cyan-500/10">
                      {part.startMm}–{part.endMm}mm
                    </span>
                  </div>
                </div>

                {/* Subparts pill badges if present */}
                {part.subParts && part.subParts.length > 0 && (
                  <div className="mt-2 pt-1.5 border-t border-cyan-500/10 flex flex-wrap gap-1">
                    {part.subParts.map((sub, sidx) => (
                      <span
                        key={sidx}
                        className="text-[9px] font-tech px-1.5 py-0.5 rounded bg-black/50 text-slate-300 border border-cyan-500/15"
                      >
                        {sub.name} {sub.massKg !== undefined ? `(${sub.massKg.toFixed(2)}kg)` : ''}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Mass Summary Footer Card */}
          <div className="mt-2 p-2.5 rounded-lg bg-black/50 border border-cyan-500/20 font-tech text-xs space-y-1">
            <div className="flex items-center justify-between text-slate-300 pb-1 border-b border-cyan-500/15">
              <span className="text-[10px] uppercase tracking-wider flex items-center gap-1">
                <Scale className="w-3 h-3 text-[#00E5FF]" />
                Total Wet Mass
              </span>
              <span className="font-bold text-[#00E5FF] glow-cyan-text">{VEHICLE_TOTALS.wetMassKg.toFixed(2)} kg</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Mass without Motor:</span>
              <span className="font-semibold text-slate-200">{VEHICLE_TOTALS.dryMassKg.toFixed(2)} kg</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Burnout Mass:</span>
              <span className="font-semibold text-slate-200">{VEHICLE_TOTALS.burnoutMassKg.toFixed(2)} kg</span>
            </div>
            <div className="text-[9px] text-slate-500 pt-0.5 italic">
              Includes 1.00 kg misc hardware / epoxy / paint
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
