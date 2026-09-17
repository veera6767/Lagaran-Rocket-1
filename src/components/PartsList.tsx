import React, { useState } from 'react';
import { Layers, ChevronDown, ChevronUp, Cpu, Flame, Disc, Radio, Wind, Sparkles, Eye } from 'lucide-react';
import { ROCKET_PARTS } from '../data/rocketParts';
import { RocketPartInfo } from '../types';

interface PartsListProps {
  selectedPartId: string | null;
  onSelectPart: (partId: string | null) => void;
  onFocusPreset?: (partId: string) => void;
}

export const PartsList: React.FC<PartsListProps> = ({
  selectedPartId,
  onSelectPart,
  onFocusPreset,
}) => {
  const [collapsed, setCollapsed] = useState(false);

  // Group parts: note nozzle (1) & motor casing (2) as "Engine / Motor Assembly"
  // Let's reverse for visual top-to-bottom stack in UI (or bottom-to-top toggle)
  // Stacked bottom to top as defined:
  // 1: Nozzle
  // 2: Motor casing
  // 3: Fins
  // 4: Bulkhead 1
  // 5: Recovery section
  // 6: Bulkhead 2
  // 7: Payload bay
  // 8: Nose cone
  const [sortOrder, setSortOrder] = useState<'top-down' | 'bottom-up'>('top-down');

  const orderedParts = [...ROCKET_PARTS].sort((a, b) =>
    sortOrder === 'top-down' ? b.order - a.order : a.order - b.order
  );

  const getPartIcon = (id: string) => {
    switch (id) {
      case 'nose-cone':
        return <Wind className="w-3.5 h-3.5 text-[#4FD9C7]" />;
      case 'payload-bay':
        return <Radio className="w-3.5 h-3.5 text-slate-300" />;
      case 'bulkhead-upper':
      case 'bulkhead-lower':
        return <Disc className="w-3.5 h-3.5 text-slate-400" />;
      case 'recovery-bay':
        return <Layers className="w-3.5 h-3.5 text-[#4FD9C7]" />;
      case 'fins':
        return <Wind className="w-3.5 h-3.5 text-slate-300" />;
      case 'motor-casing':
      case 'nozzle':
        return <Flame className="w-3.5 h-3.5 text-[#FF5A1F]" />;
      default:
        return <Cpu className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <aside className="pointer-events-auto w-full md:w-80 bg-[#05070d]/85 backdrop-blur-xl border border-cyan-500/25 rounded-xl shadow-[0_0_25px_rgba(0,229,255,0.06),0_15px_30px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col max-h-[calc(100vh-140px)] relative">
      {/* Header */}
      <div className="p-3.5 border-b border-cyan-500/20 flex items-center justify-between bg-black/40">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#00E5FF] drop-shadow-[0_0_5px_rgba(0,229,255,0.8)]" />
          <h2 className="font-orbitron font-bold text-sm tracking-wider text-slate-100 uppercase glow-cyan-text">
            Rocket Structure
          </h2>
          <span className="text-[10px] font-tech text-cyan-400 bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-500/30">
            8 Sections
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setSortOrder(sortOrder === 'top-down' ? 'bottom-up' : 'top-down')}
            title="Toggle stack order"
            className="text-[10px] font-tech text-slate-400 hover:text-cyan-300 px-2 py-0.5 rounded bg-black/40 hover:bg-cyan-950/30 border border-cyan-500/20 transition-all cursor-pointer"
          >
            {sortOrder === 'top-down' ? 'Nose → Engine' : 'Engine → Nose'}
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
            const isEngineAssembly =
              part.id === 'nozzle' || part.id === 'motor-casing';

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
                        <span>{part.material.split('/')[0]}</span>
                        <span>•</span>
                        <span className="text-cyan-300/90">{part.massKg} kg</span>
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
                            onSelectPart(part.id);
                            onFocusPreset(part.id);
                          }}
                          title={`Focus camera on ${part.name}`}
                          className="p-1 rounded text-slate-400 hover:text-[#00E5FF] hover:bg-cyan-950/40 border border-transparent hover:border-cyan-500/30 transition-all cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {isEngineAssembly && (
                        <span className="text-[9px] font-tech px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                          Propulsion
                        </span>
                      )}
                      {part.id === 'fins' && (
                        <span className="text-[9px] font-tech px-1.5 py-0.5 rounded bg-cyan-500/15 text-[#00E5FF] border border-cyan-400/30">
                          Radial Deploy
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Engine / Motor Assembly Special Highlight Box */}
          <div className="mt-2 p-2.5 rounded-lg bg-black/40 border border-dashed border-amber-500/30 text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5 font-orbitron font-bold text-[11px] text-amber-300 uppercase tracking-wider mb-1">
              <Flame className="w-3.5 h-3.5 text-[#FF5A1F]" />
              Engine / Motor Assembly Note
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400 font-sans">
              The <strong>Motor Casing</strong> (6.15 kg 6061-T6 aluminium chamber) and supersonic <strong>Nozzle</strong> (0.80 kg aluminium with graphite throat insert) form the integrated single-stage propulsion stack delivering 12.4 kN·s total impulse and 3.6 kN peak thrust.
            </p>
          </div>
        </div>
      )}
    </aside>
  );
};
