import React, { useState } from 'react';
import {
  X,
  Flame,
  Activity,
  Wind,
  Gauge,
  CheckCircle2,
  AlertTriangle,
  Award,
  Zap,
  Layers,
  FileSpreadsheet,
} from 'lucide-react';
import { ROCKET_SPEC, VEHICLE_TOTALS } from '../data/rocketParts';

interface MissionAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MissionAnalysisModal: React.FC<MissionAnalysisModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'cea' | 'motor' | 'flt' | 'flutter' | 'rail'>('all');

  if (!isOpen) return null;

  const { nasaCea, motor, flightSimulation, stability, finFlutter, railExitVelocity, project } = ROCKET_SPEC;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn select-none pointer-events-auto">
      {/* Modal Container */}
      <div className="w-full max-w-4xl bg-[#05070d]/95 border border-cyan-500/30 rounded-2xl shadow-[0_0_40px_rgba(0,229,255,0.15),0_20px_50px_rgba(0,0,0,0.95)] flex flex-col max-h-[90vh] overflow-hidden relative font-sans text-slate-100">
        {/* HUD Corner Accents */}
        <div className="absolute top-0 left-0 w-3.5 h-3.5 border-t-2 border-l-2 border-cyan-400 pointer-events-none rounded-tl-sm" />
        <div className="absolute top-0 right-0 w-3.5 h-3.5 border-t-2 border-r-2 border-cyan-400 pointer-events-none rounded-tr-sm" />
        <div className="absolute bottom-0 left-0 w-3.5 h-3.5 border-b-2 border-l-2 border-cyan-400 pointer-events-none rounded-bl-sm" />
        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 border-b-2 border-r-2 border-cyan-400 pointer-events-none rounded-br-sm" />

        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 border-b border-cyan-500/20 bg-black/60 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-950/40 border border-cyan-400/50 flex items-center justify-center text-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.4)] shrink-0">
              <FileSpreadsheet className="w-5 h-5 drop-shadow-[0_0_6px_rgba(0,229,255,0.8)]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-orbitron font-extrabold text-base sm:text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-white to-cyan-400 glow-cyan-text uppercase">
                  Mission Analysis & Verification
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-tech font-bold uppercase rounded bg-emerald-500/15 text-emerald-400 border border-emerald-400/30">
                  {project.sourceTag}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-tech tracking-wide">
                Single source of truth engineering telemetry • {project.reviewPhase} verification
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-cyan-950/40 border border-transparent hover:border-cyan-500/30 transition-all cursor-pointer"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-Tabs Bar */}
        <div className="flex items-center gap-1.5 p-2.5 bg-black/40 border-b border-cyan-500/15 overflow-x-auto custom-scrollbar font-tech text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-cyan-500 text-black font-bold border-cyan-300 shadow-[0_0_12px_rgba(0,229,255,0.4)]'
                : 'bg-black/40 text-slate-300 border-cyan-500/15 hover:border-cyan-400/40'
            }`}
          >
            All Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cea')}
            className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'cea'
                ? 'bg-cyan-500 text-black font-bold border-cyan-300 shadow-[0_0_12px_rgba(0,229,255,0.4)]'
                : 'bg-black/40 text-slate-300 border-cyan-500/15 hover:border-cyan-400/40'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>NASA CEA</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('motor')}
            className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'motor'
                ? 'bg-cyan-500 text-black font-bold border-cyan-300 shadow-[0_0_12px_rgba(0,229,255,0.4)]'
                : 'bg-black/40 text-slate-300 border-cyan-500/15 hover:border-cyan-400/40'
            }`}
          >
            <Gauge className="w-3.5 h-3.5" />
            <span>OpenMotor (M1928)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('flt')}
            className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'flt'
                ? 'bg-cyan-500 text-black font-bold border-cyan-300 shadow-[0_0_12px_rgba(0,229,255,0.4)]'
                : 'bg-black/40 text-slate-300 border-cyan-500/15 hover:border-cyan-400/40'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Flight Sim (OR vs RASAero)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('flutter')}
            className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'flutter'
                ? 'bg-cyan-500 text-black font-bold border-cyan-300 shadow-[0_0_12px_rgba(0,229,255,0.4)]'
                : 'bg-black/40 text-slate-300 border-cyan-500/15 hover:border-cyan-400/40'
            }`}
          >
            <Wind className="w-3.5 h-3.5" />
            <span>Fin Flutter & Stability</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('rail')}
            className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'rail'
                ? 'bg-cyan-500 text-black font-bold border-cyan-300 shadow-[0_0_12px_rgba(0,229,255,0.4)]'
                : 'bg-black/40 text-slate-300 border-cyan-500/15 hover:border-cyan-400/40'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Rail Exit Velocity</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar space-y-6 flex-1 text-xs">
          {/* =========================================================================
              CARD A: NASA CEA (Propulsion)
             ========================================================================= */}
          {(activeTab === 'all' || activeTab === 'cea') && (
            <section className="p-4 rounded-xl bg-black/50 border border-cyan-500/20 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-cyan-500/15">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-[#FF5A1F] drop-shadow-[0_0_5px_#FF5A1F]" />
                  <h3 className="font-orbitron font-bold text-sm tracking-wider text-slate-100 uppercase glow-cyan-text">
                    a) Propulsion Thermochemistry — NASA CEA
                  </h3>
                </div>
                <span className="text-[10px] font-tech text-amber-300 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30">
                  {nasaCea.propellant}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-tech">
                <div className="p-2 rounded bg-black/40 border border-cyan-500/10">
                  <span className="text-[10px] text-slate-400 block uppercase">Chamber Temp (Tc)</span>
                  <span className="text-sm font-bold text-[#FF5A1F]">{nasaCea.chamberTempK.toLocaleString()} K</span>
                </div>
                <div className="p-2 rounded bg-black/40 border border-cyan-500/10">
                  <span className="text-[10px] text-slate-400 block uppercase">Throat Temp (Tt)</span>
                  <span className="text-sm font-bold text-amber-300">{nasaCea.throatTempK.toLocaleString()} K</span>
                </div>
                <div className="p-2 rounded bg-black/40 border border-cyan-500/10">
                  <span className="text-[10px] text-slate-400 block uppercase">Exit Temp (Te)</span>
                  <span className="text-sm font-bold text-slate-100">{nasaCea.exitTempK.toLocaleString()} K</span>
                </div>
                <div className="p-2 rounded bg-black/40 border border-cyan-500/10">
                  <span className="text-[10px] text-slate-400 block uppercase">Chamber Press. (Pc)</span>
                  <span className="text-sm font-bold text-slate-100">{nasaCea.chamberPressureBar} bar</span>
                </div>

                <div className="p-2 rounded bg-black/40 border border-cyan-500/10">
                  <span className="text-[10px] text-slate-400 block uppercase">Exit Pressure (Pe)</span>
                  <span className="text-sm font-bold text-slate-100">{nasaCea.exitPressureBar} bar</span>
                </div>
                <div className="p-2 rounded bg-black/40 border border-cyan-500/10">
                  <span className="text-[10px] text-slate-400 block uppercase">Exit Mach (Me)</span>
                  <span className="text-sm font-bold text-[#00E5FF]">{nasaCea.exitMach}</span>
                </div>
                <div className="p-2 rounded bg-black/40 border border-cyan-500/10">
                  <span className="text-[10px] text-slate-400 block uppercase">Thrust Coeff (Cf)</span>
                  <span className="text-sm font-bold text-slate-100">{nasaCea.thrustCoefficient}</span>
                </div>
                <div className="p-2 rounded bg-black/40 border border-cyan-500/10">
                  <span className="text-[10px] text-slate-400 block uppercase">Char. Velocity (c*)</span>
                  <span className="text-sm font-bold text-slate-100">{nasaCea.cStarMs} m/s</span>
                </div>

                <div className="p-2 rounded bg-black/40 border border-cyan-500/10 col-span-2">
                  <span className="text-[10px] text-slate-400 block uppercase">Theoretical Specific Impulse (Isp)</span>
                  <span className="text-sm font-bold text-slate-100">{nasaCea.theoreticalIspS} s</span>
                </div>
                <div className="p-2 rounded bg-black/40 border border-cyan-500/10 col-span-2">
                  <span className="text-[10px] text-slate-400 block uppercase">Delivered Specific Impulse (η = 0.87)</span>
                  <span className="text-sm font-bold text-[#00E5FF] glow-cyan-text">~{nasaCea.deliveredIspS} s</span>
                </div>
              </div>

              {/* Exhaust Species */}
              <div className="p-2.5 rounded bg-black/40 border border-cyan-500/15">
                <span className="text-[10px] text-slate-400 font-tech block mb-1 uppercase tracking-wider">
                  Main Exhaust Chemical Species:
                </span>
                <div className="flex flex-wrap gap-2 font-tech">
                  {nasaCea.exhaustSpecies.map((s, idx) => (
                    <span key={idx} className="px-2 py-1 rounded bg-cyan-950/40 border border-cyan-500/25 text-cyan-200 text-xs">
                      {s.species}: <strong>{s.percentage}</strong>
                    </span>
                  ))}
                </div>
              </div>

              {/* Thermal Note */}
              <div className="p-2.5 rounded bg-amber-950/30 border border-amber-500/30 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-200/90 font-sans leading-relaxed">
                  <strong>Thermal Protection Advisory:</strong> {nasaCea.thermalNote}
                </p>
              </div>
            </section>
          )}

          {/* =========================================================================
              CARD B: MOTOR DATA — OpenMotor
             ========================================================================= */}
          {(activeTab === 'all' || activeTab === 'motor') && (
            <section className="p-4 rounded-xl bg-black/50 border border-cyan-500/20 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-cyan-500/15">
                <div className="flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-[#00E5FF]" />
                  <h3 className="font-orbitron font-bold text-sm tracking-wider text-slate-100 uppercase glow-cyan-text">
                    b) Solid Rocket Motor — OpenMotor ({motor.designation})
                  </h3>
                </div>
                <span className="text-[10px] font-tech text-cyan-300 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/30">
                  {motor.badge}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-tech">
                <div className="p-2 rounded bg-black/40 border border-cyan-500/10">
                  <span className="text-[10px] text-slate-400 block uppercase">Total Impulse</span>
                  <span className="text-sm font-bold text-[#00E5FF]">{motor.totalImpulseNs.toLocaleString()} N·s</span>
                </div>
                <div className="p-2 rounded bg-black/40 border border-cyan-500/10">
                  <span className="text-[10px] text-slate-400 block uppercase">Average Thrust</span>
                  <span className="text-sm font-bold text-slate-100">{motor.averageThrustN.toLocaleString()} N</span>
                </div>
                <div className="p-2 rounded bg-black/40 border border-cyan-500/10">
                  <span className="text-[10px] text-slate-400 block uppercase">Burn Time</span>
                  <span className="text-sm font-bold text-slate-100">{motor.burnTimeS} s</span>
                </div>
                <div className="p-2 rounded bg-black/40 border border-cyan-500/10">
                  <span className="text-[10px] text-slate-400 block uppercase">Delivered Isp</span>
                  <span className="text-sm font-bold text-slate-100">{motor.deliveredIspS} s</span>
                </div>

                <div className="p-2 rounded bg-black/40 border border-cyan-500/10">
                  <span className="text-[10px] text-slate-400 block uppercase">Avg Chamber Press.</span>
                  <span className="text-sm font-bold text-slate-100">{motor.avgChamberPressurePsi} psi</span>
                </div>
                <div className="p-2 rounded bg-black/40 border border-cyan-500/10">
                  <span className="text-[10px] text-slate-400 block uppercase">Peak Chamber Press.</span>
                  <span className="text-sm font-bold text-amber-300">{motor.peakChamberPressurePsi} psi</span>
                </div>
                <div className="p-2 rounded bg-black/40 border border-cyan-500/10">
                  <span className="text-[10px] text-slate-400 block uppercase">Hoop Stress</span>
                  <span className="text-sm font-bold text-slate-100">{motor.hoopStressMpa} MPa</span>
                </div>
                <div className="p-2 rounded bg-black/40 border border-cyan-500/10">
                  <span className="text-[10px] text-slate-400 block uppercase">Safety Factor</span>
                  <span className="text-sm font-bold text-emerald-400">{motor.factorOfSafety}</span>
                </div>
              </div>

              {/* Grain & Burn Rate Parameters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-tech">
                <div className="p-2.5 rounded bg-black/40 border border-cyan-500/15">
                  <span className="text-[10px] text-slate-400 block uppercase">Grain Configuration</span>
                  <span className="font-bold text-slate-100 text-xs">{motor.grainConfig}</span>
                </div>
                <div className="p-2.5 rounded bg-black/40 border border-cyan-500/15">
                  <span className="text-[10px] text-slate-400 block uppercase">Saint-Robert Burn-Rate Law (r = a · P^n)</span>
                  <span className="font-bold text-cyan-300 text-xs">a = {motor.burnRateCoeffA}, n = {motor.burnRateExponentN}</span>
                </div>
                <div className="p-2.5 rounded bg-black/40 border border-cyan-500/15">
                  <span className="text-[10px] text-slate-400 block uppercase">Motor Casing Dimensions</span>
                  <span className="font-bold text-slate-100 text-xs">
                    {motor.casingMaterial} • {motor.casingOuterDiameterMm} mm OD • {motor.casingWallThicknessMm} mm wall (increased from 3 mm)
                  </span>
                </div>
                <div className="p-2.5 rounded bg-black/40 border border-cyan-500/15">
                  <span className="text-[10px] text-slate-400 block uppercase">Propellant & Empty Masses</span>
                  <span className="font-bold text-slate-100 text-xs">
                    Casing: {motor.casingMassKg} kg • Propellant: {motor.propellantMassKg} kg • Total: {motor.totalMotorMassKg} kg
                  </span>
                </div>
              </div>
            </section>
          )}

          {/* =========================================================================
              CARD C: FLIGHT SIMULATION (OpenRocket vs RASAero II Side by Side)
             ========================================================================= */}
          {(activeTab === 'all' || activeTab === 'flt') && (
            <section className="p-4 rounded-xl bg-black/50 border border-cyan-500/20 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-cyan-500/15">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#00E5FF]" />
                  <h3 className="font-orbitron font-bold text-sm tracking-wider text-slate-100 uppercase glow-cyan-text">
                    c) Flight Simulation Comparison (Side by Side)
                  </h3>
                </div>
                <span className="text-[10px] font-tech text-cyan-300 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/30">
                  OpenRocket vs RASAero II
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-tech text-xs">
                  <thead>
                    <tr className="border-b border-cyan-500/20 text-slate-400 text-[11px] bg-black/60">
                      <th className="p-2.5">Parameter</th>
                      <th className="p-2.5 text-cyan-300">OpenRocket</th>
                      <th className="p-2.5 text-emerald-300">RASAero II</th>
                      <th className="p-2.5 text-slate-400">Engineering Delta</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    <tr>
                      <td className="p-2.5 font-bold text-slate-300">Apogee</td>
                      <td className="p-2.5 font-bold text-[#00E5FF]">{flightSimulation.openRocket.apogeeM.toLocaleString()} m</td>
                      <td className="p-2.5 font-bold text-emerald-300">{flightSimulation.rasAeroII.apogeeM.toLocaleString()} m</td>
                      <td className="p-2.5 text-slate-400">-713 m (-13.7% due to compressibility)</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-slate-300">Max Velocity</td>
                      <td className="p-2.5 font-bold text-[#00E5FF]">{flightSimulation.openRocket.maxVelocityMs} m/s</td>
                      <td className="p-2.5 font-bold text-emerald-300">{flightSimulation.rasAeroII.maxVelocityMs} m/s</td>
                      <td className="p-2.5 text-slate-400">-2.5 m/s (-0.5% agreement)</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-slate-300">Max Mach Number</td>
                      <td className="p-2.5 font-bold text-[#00E5FF]">Mach {flightSimulation.openRocket.maxMach}</td>
                      <td className="p-2.5 font-bold text-emerald-300">Mach {flightSimulation.rasAeroII.maxMach}</td>
                      <td className="p-2.5 text-slate-400">Transonic supersonic peak</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-slate-300">Time to Apogee</td>
                      <td className="p-2.5 font-bold text-slate-100">{flightSimulation.openRocket.timeToApogeeS} s</td>
                      <td className="p-2.5 font-bold text-slate-100">{flightSimulation.rasAeroII.timeToApogeeS} s</td>
                      <td className="p-2.5 text-slate-400">-2.3 s</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-slate-300">Max Acceleration</td>
                      <td className="p-2.5 font-bold text-slate-100">{flightSimulation.openRocket.maxAccelerationMs2} m/s² (OpenRocket)</td>
                      <td className="p-2.5 text-slate-500 italic">Not in review</td>
                      <td className="p-2.5 text-slate-400">OpenRocket run only</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-slate-300">Peak Aerodynamic Drag</td>
                      <td className="p-2.5 text-slate-500 italic">Not in review</td>
                      <td className="p-2.5 font-bold text-emerald-300">{flightSimulation.rasAeroII.peakDragLb}</td>
                      <td className="p-2.5 text-slate-400">RASAero II modified Barrowman model</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-slate-300">Peak Drag Coeff (CD)</td>
                      <td className="p-2.5 text-slate-500 italic">Not in review</td>
                      <td className="p-2.5 font-bold text-emerald-300">{flightSimulation.rasAeroII.peakCd}</td>
                      <td className="p-2.5 text-slate-400">Transonic wave drag rise</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="p-2.5 rounded bg-cyan-950/30 border border-cyan-500/25 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#00E5FF] shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                  <strong>Aerodynamic Prediction Rule:</strong> {flightSimulation.supersonicNote}
                </p>
              </div>
            </section>
          )}

          {/* =========================================================================
              CARD D: STABILITY & FIN FLUTTER
             ========================================================================= */}
          {(activeTab === 'all' || activeTab === 'flutter') && (
            <section className="p-4 rounded-xl bg-black/50 border border-cyan-500/20 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-cyan-500/15">
                <div className="flex items-center gap-2">
                  <Wind className="w-4 h-4 text-cyan-300" />
                  <h3 className="font-orbitron font-bold text-sm tracking-wider text-slate-100 uppercase glow-cyan-text">
                    d) Aerodynamic Stability & Fin Flutter Analysis
                  </h3>
                </div>
                <span className="text-[10px] font-tech text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                  {finFlutter.standard} Confirmed
                </span>
              </div>

              {/* Stability Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-tech">
                <div className="p-2.5 rounded bg-black/40 border border-cyan-500/15">
                  <span className="text-[10px] text-slate-400 block uppercase">Center of Gravity (CG)</span>
                  <span className="text-sm font-bold text-[#FFB300]">{stability.cgMmFromNose} mm from nose tip</span>
                </div>
                <div className="p-2.5 rounded bg-black/40 border border-cyan-500/15">
                  <span className="text-[10px] text-slate-400 block uppercase">Center of Pressure (CP)</span>
                  <span className="text-sm font-bold text-[#00E5FF]">{stability.cpMmFromNose} mm from nose tip</span>
                </div>
                <div className="p-2.5 rounded bg-black/40 border border-cyan-500/15">
                  <span className="text-[10px] text-slate-400 block uppercase">Stability Caliber Margin</span>
                  <span className="text-sm font-bold text-emerald-400">
                    +{stability.marginCalibersOpenRocket} cal (OR) / ~{stability.marginCalibersHandCalc} cal
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Target band: {stability.targetBandCalibers}</span>
                </div>
              </div>

              {/* Fin Flutter Card */}
              <div className="p-3 rounded-lg bg-black/40 border border-cyan-500/15 font-tech space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">
                    Fin Flutter Specification ({finFlutter.standard})
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] border border-emerald-500/40 font-bold">
                    Safety Margin: {finFlutter.safetyMargin}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2 rounded bg-black/50 border border-cyan-500/10">
                    <span className="text-[10px] text-slate-400 block uppercase">Fin Material</span>
                    <span className="font-bold text-slate-100">{finFlutter.material}</span>
                  </div>
                  <div className="p-2 rounded bg-black/50 border border-cyan-500/10">
                    <span className="text-[10px] text-slate-400 block uppercase">Shear Modulus (G)</span>
                    <span className="font-bold text-slate-100">{finFlutter.shearModulusGpa} GPa</span>
                  </div>
                  <div className="p-2 rounded bg-black/50 border border-cyan-500/10">
                    <span className="text-[10px] text-slate-400 block uppercase">Flutter Velocity (Vf)</span>
                    <span className="font-bold text-emerald-400">{finFlutter.flutterVelocityMs} m/s</span>
                  </div>
                  <div className="p-2 rounded bg-black/50 border border-cyan-500/10">
                    <span className="text-[10px] text-slate-400 block uppercase">Max Rocket Velocity</span>
                    <span className="font-bold text-[#00E5FF]">{finFlutter.maxSpeedMs} m/s</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-300 font-sans italic pt-1 border-t border-cyan-500/10">
                  {finFlutter.rule}
                </p>
              </div>
            </section>
          )}

          {/* =========================================================================
              CARD E: RAIL EXIT VELOCITY TABLE
             ========================================================================= */}
          {(activeTab === 'all' || activeTab === 'rail') && (
            <section className="p-4 rounded-xl bg-black/50 border border-cyan-500/20 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-cyan-500/15">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <h3 className="font-orbitron font-bold text-sm tracking-wider text-slate-100 uppercase glow-cyan-text">
                    e) Launch Rail Exit Velocity (Minimum Required: {railExitVelocity.minRequiredMs} m/s)
                  </h3>
                </div>
                <span className="text-[10px] font-tech text-slate-400 bg-black/40 px-2 py-0.5 rounded border border-cyan-500/20">
                  Threshold: 15.0 m/s
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 font-tech">
                {railExitVelocity.railLengths.map((rail, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border flex flex-col justify-between gap-2 ${
                      rail.safe
                        ? 'bg-emerald-950/20 border-emerald-500/30'
                        : 'bg-red-950/30 border-red-500/40'
                    }`}
                  >
                    <div>
                      <span className="text-[11px] text-slate-400 block uppercase tracking-wider">{rail.length}</span>
                      <span className={`text-lg font-bold ${rail.safe ? 'text-emerald-300' : 'text-red-400'}`}>
                        {rail.velocityMs} m/s
                      </span>
                    </div>

                    <span
                      className={`px-2 py-1 rounded text-center text-[10px] font-bold uppercase border ${
                        rail.safe
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-red-500/25 text-red-300 border-red-500/50 animate-pulse'
                      }`}
                    >
                      {rail.status}
                    </span>
                  </div>
                ))}
              </div>

              <p className="text-[11px] text-slate-400 font-sans leading-relaxed pt-1">
                A minimum rail departure velocity of 15.0 m/s is mandatory to guarantee aerodynamic fin restoring moments against low-altitude crosswinds prior to free flight.
              </p>
            </section>
          )}
        </div>

        {/* Section 9: Footer Credits */}
        <div className="p-3 sm:p-4 border-t border-cyan-500/20 bg-black/70 flex flex-col sm:flex-row items-center justify-between gap-2 font-tech text-[11px] text-slate-400">
          <div className="text-center sm:text-left">
            <span className="text-cyan-300 font-bold block sm:inline">{project.academicContext}. </span>
            <span>{project.fullTitle}</span>
          </div>
          <div className="text-center sm:text-right shrink-0">
            <span className="text-slate-300">Team: <strong>{project.team}</strong></span>
            <span className="mx-1 text-cyan-500">•</span>
            <span className="text-slate-300">Guide: <strong>{project.guide}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
