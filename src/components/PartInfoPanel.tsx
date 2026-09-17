import React from 'react';
import { X, Info, Shield, Wrench, CheckCircle2, ChevronRight, Gauge, Layers, Activity } from 'lucide-react';
import { ROCKET_PARTS, VEHICLE_SUMMARY, OPENROCKET_SIMULATION } from '../data/rocketParts';
import { RocketPartInfo, CameraPreset } from '../types';

interface PartInfoPanelProps {
  selectedPartId: string | null;
  onClose: () => void;
  onFocusCameraPreset: (preset: CameraPreset) => void;
}

export const PartInfoPanel: React.FC<PartInfoPanelProps> = ({
  selectedPartId,
  onClose,
  onFocusCameraPreset,
}) => {
  const selectedPart = ROCKET_PARTS.find((p) => p.id === selectedPartId);

  // Map part to appropriate camera preset
  const getCameraPresetForPart = (id: string): CameraPreset => {
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

  if (!selectedPart) {
    // Default vehicle engineering overview when no specific part is clicked
    return (
      <div className="pointer-events-auto w-full md:w-96 bg-[#05070d]/85 backdrop-blur-xl border border-cyan-500/25 rounded-xl shadow-[0_0_25px_rgba(0,229,255,0.06),0_15px_30px_rgba(0,0,0,0.85)] p-4 flex flex-col gap-3 relative max-h-[calc(100vh-140px)] overflow-y-auto custom-scrollbar">
        {/* Decorative corner ticks */}
        <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-cyan-400/60 pointer-events-none rounded-tl-sm" />
        <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-cyan-400/60 pointer-events-none rounded-tr-sm" />
        <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-cyan-400/60 pointer-events-none rounded-bl-sm" />
        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-cyan-400/60 pointer-events-none rounded-br-sm" />

        <div className="flex items-center justify-between pb-2 border-b border-cyan-500/20">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-[#00E5FF] drop-shadow-[0_0_4px_#00E5FF]" />
            <h3 className="font-orbitron font-bold text-sm tracking-wider text-slate-100 uppercase glow-cyan-text">
              Subsystem Inspector
            </h3>
          </div>
          <span className="text-[10px] font-tech text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/30">
            INTERACTIVE CAD
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed font-sans">
          Click any 3D section or choose from the parts list to inspect its alloy metallurgy, CNC surface finish, thermal tolerances, and flight role.
        </p>

        {/* Confirmed Dimensions & Mass Summary */}
        <div className="grid grid-cols-2 gap-2 text-xs font-tech">
          <div className="p-2.5 rounded-lg bg-black/50 border border-cyan-500/15 hover:border-cyan-400/30 transition-colors">
            <span className="text-[10px] text-slate-400 block mb-0.5 tracking-wider uppercase">Total Rocket Length</span>
            <span className="font-bold text-slate-100">{OPENROCKET_SIMULATION.totalLengthCm} cm ({OPENROCKET_SIMULATION.totalLengthM.toFixed(2)} m)</span>
          </div>
          <div className="p-2.5 rounded-lg bg-black/50 border border-cyan-500/15 hover:border-cyan-400/30 transition-colors">
            <span className="text-[10px] text-slate-400 block mb-0.5 tracking-wider uppercase">Max Body Diameter</span>
            <span className="font-bold text-slate-100">{OPENROCKET_SIMULATION.maxDiameterCm} cm ({OPENROCKET_SIMULATION.maxDiameterMm} mm)</span>
          </div>
          <div className="p-2.5 rounded-lg bg-black/50 border border-cyan-500/15 hover:border-cyan-400/30 transition-colors">
            <span className="text-[10px] text-slate-400 block mb-0.5 tracking-wider uppercase">Mass (No Motors)</span>
            <span className="font-bold text-slate-100">{OPENROCKET_SIMULATION.dryMassG.toLocaleString()} g ({OPENROCKET_SIMULATION.dryMassKg} kg)</span>
          </div>
          <div className="p-2.5 rounded-lg bg-black/50 border border-cyan-500/15 hover:border-cyan-400/30 transition-colors">
            <span className="text-[10px] text-slate-400 block mb-0.5 tracking-wider uppercase">Mass (With Motors)</span>
            <span className="font-bold text-[#00E5FF] glow-cyan-text">{OPENROCKET_SIMULATION.wetMassG.toLocaleString()} g ({OPENROCKET_SIMULATION.wetMassKg} kg)</span>
          </div>
        </div>

        {/* Flight Simulation Section Card */}
        <div className="p-3 rounded-lg bg-black/50 border border-cyan-500/20 text-xs space-y-2 relative">
          <div className="flex items-center justify-between pb-1.5 border-b border-cyan-500/15">
            <div className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-[#00E5FF] drop-shadow-[0_0_4px_#00E5FF]" />
              <span className="font-orbitron font-bold text-[11px] tracking-wider text-slate-100 uppercase glow-cyan-text">
                Flight Simulation
              </span>
            </div>
            <span className="text-[9px] font-tech text-cyan-400 bg-cyan-950/50 px-1.5 py-0.5 rounded border border-cyan-500/30 tracking-wider uppercase">
              OpenRocket Confirmed
            </span>
          </div>

          <div className="space-y-1.5 font-tech">
            <div className="flex items-center justify-between p-1.5 rounded bg-black/40 border border-cyan-500/10">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">Motor</span>
              <span className="font-bold text-[#FF5A1F] drop-shadow-[0_0_4px_rgba(255,90,31,0.4)]">
                {OPENROCKET_SIMULATION.motor}
              </span>
            </div>
            <div className="flex items-center justify-between p-1.5 rounded bg-black/40 border border-cyan-500/10">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">Apogee</span>
              <span className="font-bold text-[#00E5FF] drop-shadow-[0_0_4px_rgba(0,229,255,0.4)]">
                {OPENROCKET_SIMULATION.apogeeM.toLocaleString()} m
              </span>
            </div>
            <div className="flex items-center justify-between p-1.5 rounded bg-black/40 border border-cyan-500/10">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">Max Velocity</span>
              <span className="font-bold text-[#00E5FF] drop-shadow-[0_0_4px_rgba(0,229,255,0.4)]">
                {OPENROCKET_SIMULATION.maxVelocityMs} m/s ({OPENROCKET_SIMULATION.maxMachFormatted})
              </span>
            </div>
            <div className="flex items-center justify-between p-1.5 rounded bg-black/40 border border-cyan-500/10">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">Max Acceleration</span>
              <span className="font-bold text-slate-100">
                {OPENROCKET_SIMULATION.maxAccelerationMs2} m/s²
              </span>
            </div>
          </div>
        </div>

        {/* CG & CP Engineering Metrics */}
        <div className="p-2.5 rounded-lg bg-black/50 border border-cyan-500/15 text-xs font-tech space-y-1.5">
          <div className="flex items-center justify-between pb-1 border-b border-cyan-500/15">
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">Aero Stability (From Nose)</span>
            <span className="text-[10px] text-[#00E5FF] font-bold">MARGIN: +{OPENROCKET_SIMULATION.stabilityMarginCalibers} CAL</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#FFB300] shadow-[0_0_6px_#FFB300]" />
              CG:
            </span>
            <span className="font-bold text-[#FFB300]">{OPENROCKET_SIMULATION.cgCmFromNose} cm from nose</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#00E5FF] shadow-[0_0_6px_#00E5FF]" />
              CP:
            </span>
            <span className="font-bold text-[#00E5FF]">{OPENROCKET_SIMULATION.cpCmFromNose} cm from nose</span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-cyan-500/15">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">Stability Margin:</span>
            <span className="font-bold text-slate-200">
              {OPENROCKET_SIMULATION.stabilityMarginCalibers} calibers / {OPENROCKET_SIMULATION.stabilityMarginPercent}%
            </span>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-500/30 flex items-start gap-2.5 text-xs">
          <span className="w-2 h-2 rounded-full bg-[#00E5FF] mt-1 shrink-0 animate-pulse shadow-[0_0_6px_#00E5FF]" />
          <div className="text-slate-300 space-y-1">
            <strong className="text-[#00E5FF] font-semibold block font-orbitron text-[11px] tracking-wider uppercase">Exploded View Engine</strong>
            <p className="text-[11px] text-slate-400 leading-normal font-sans">
              Activate the <strong>Exploded View</strong> control below to observe the internal staging, bulkheads, recovery canister, and radial fin kinematics.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isEngineAssembly =
    selectedPart.id === 'nozzle' || selectedPart.id === 'motor-casing';

  return (
    <div className="pointer-events-auto w-full md:w-96 bg-[#05070d]/85 backdrop-blur-xl border border-cyan-500/25 rounded-xl shadow-[0_0_25px_rgba(0,229,255,0.06),0_15px_30px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col max-h-[calc(100vh-140px)] animate-fadeIn relative">
      {/* Decorative corner ticks */}
      <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-cyan-400/60 pointer-events-none rounded-tl-sm" />
      <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-cyan-400/60 pointer-events-none rounded-tr-sm" />
      <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-cyan-400/60 pointer-events-none rounded-bl-sm" />
      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-cyan-400/60 pointer-events-none rounded-br-sm" />

      {/* Header */}
      <div className="p-4 border-b border-cyan-500/20 bg-black/40 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-1.5 py-0.5 text-[9px] font-tech font-bold rounded bg-cyan-500/15 text-[#00E5FF] border border-cyan-400/30 uppercase tracking-wider">
              SECTION 0{selectedPart.order} OF 08
            </span>
            <span className="text-[10px] font-tech text-slate-400">
              ID: {selectedPart.id}
            </span>
          </div>
          <h3 className="font-orbitron font-bold text-lg tracking-wide text-slate-100 glow-cyan-text">
            {selectedPart.name}
          </h3>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-xs font-tech text-cyan-300">
              {selectedPart.assembly}
            </span>
            {isEngineAssembly && (
              <span className="text-[9px] font-tech px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                Propulsion System
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-cyan-950/40 border border-transparent hover:border-cyan-500/30 transition-all cursor-pointer"
          title="Close inspector"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 space-y-4 overflow-y-auto custom-scrollbar flex-1 text-xs">
        {/* Description */}
        <div>
          <h4 className="text-[10px] font-tech text-cyan-400/80 uppercase tracking-widest mb-1 flex items-center gap-1">
            <Info className="w-3 h-3 text-[#00E5FF]" />
            Engineering Description
          </h4>
          <p className="text-slate-200 leading-relaxed font-sans text-xs">
            {selectedPart.description}
          </p>
        </div>

        {/* Material & Finish Badge Grid */}
        <div className="p-3 rounded-lg bg-black/50 border border-cyan-500/20 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <span className="text-[11px] text-slate-400 font-tech uppercase tracking-wider">Material:</span>
            <span className="text-[11px] font-tech font-bold text-slate-100 text-right">
              {selectedPart.material}
            </span>
          </div>
          <div className="h-px bg-cyan-500/15" />
          <div className="flex items-start justify-between gap-2">
            <span className="text-[11px] text-slate-400 font-tech uppercase tracking-wider">Surface Finish:</span>
            <span className="text-[11px] font-tech font-medium text-slate-300 text-right">
              {selectedPart.finish}
            </span>
          </div>
          <div className="h-px bg-cyan-500/15" />
          <div className="grid grid-cols-3 gap-2 pt-1 text-center font-tech">
            <div className="p-1.5 bg-black/40 rounded border border-cyan-500/10">
              <span className="text-[9px] text-slate-400 block uppercase tracking-wider">Mass</span>
              <span className="text-xs font-bold text-[#00E5FF]">{selectedPart.massKg} kg</span>
            </div>
            <div className="p-1.5 bg-black/40 rounded border border-cyan-500/10">
              <span className="text-[9px] text-slate-400 block uppercase tracking-wider">Length</span>
              <span className="text-xs font-bold text-slate-100">{selectedPart.lengthMm} mm</span>
            </div>
            <div className="p-1.5 bg-black/40 rounded border border-cyan-500/10">
              <span className="text-[9px] text-slate-400 block uppercase tracking-wider">Diameter</span>
              <span className="text-xs font-bold text-slate-100">{selectedPart.diameterMm} mm</span>
            </div>
          </div>
        </div>

        {/* Specifications Table */}
        <div>
          <h4 className="text-[10px] font-tech text-cyan-400/80 uppercase tracking-widest mb-2 flex items-center gap-1">
            <Gauge className="w-3 h-3 text-[#00E5FF]" />
            Flight Operating Specifications
          </h4>
          <div className="grid grid-cols-2 gap-2 font-tech">
            {selectedPart.specs.map((spec, i) => (
              <div key={i} className="p-2 rounded bg-black/40 border border-cyan-500/15 hover:border-cyan-400/30 transition-colors">
                <span className="text-[9px] text-slate-400 block uppercase tracking-wider">{spec.label}</span>
                <span className="text-[11px] font-bold text-slate-100">{spec.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Technical Highlights */}
        <div>
          <h4 className="text-[10px] font-tech text-cyan-400/80 uppercase tracking-widest mb-2 flex items-center gap-1">
            <Wrench className="w-3 h-3 text-cyan-400" />
            CAD & Subsystem Details
          </h4>
          <ul className="space-y-1.5">
            {selectedPart.technicalDetails.map((detail, idx) => (
              <li key={idx} className="flex items-start gap-2 text-slate-300 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#00E5FF] shrink-0 mt-0.5" />
                <span>{detail}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action Button: Center Camera */}
        <button
          type="button"
          onClick={() => onFocusCameraPreset(getCameraPresetForPart(selectedPart.id))}
          className="w-full py-2.5 px-3 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-500/30 hover:border-cyan-400/60 text-cyan-200 hover:text-white text-xs font-tech font-bold tracking-wider shadow-[0_0_12px_rgba(0,229,255,0.15)] flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <span>Focus Camera on {selectedPart.name}</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#00E5FF]" />
        </button>
      </div>
    </div>
  );
};
