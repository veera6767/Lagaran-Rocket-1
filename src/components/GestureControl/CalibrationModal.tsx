import React, { useState, useEffect, useRef } from 'react';
import { GestureState, GestureCalibrationData } from '../../types/gesture';
import { CheckCircle2, AlertTriangle, ArrowRight, X, ShieldCheck } from 'lucide-react';

interface CalibrationModalProps {
  isOpen: boolean;
  currentGestureState: GestureState;
  currentHandSize: number;
  lowLightDetected?: boolean;
  onComplete: (data: GestureCalibrationData) => void;
  onCancel: () => void;
}

export const CalibrationModal: React.FC<CalibrationModalProps> = ({
  isOpen,
  currentGestureState,
  currentHandSize,
  lowLightDetected = false,
  onComplete,
  onCancel,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [progress, setProgress] = useState<number>(0);
  const recordedSizesRef = useRef<number[]>([]);

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setProgress(0);
      recordedSizesRef.current = [];
    }
  }, [isOpen]);

  // Step 1: Hold Open Hand for ~2 seconds (records baseline apparent hand size)
  useEffect(() => {
    if (!isOpen || step !== 1) return;

    let timer: number;
    const interval = 50; // 50ms ticks
    const targetDuration = 2000; // 2 seconds

    timer = window.setInterval(() => {
      if (currentGestureState === 'OPEN HAND') {
        if (currentHandSize > 0.05) {
          recordedSizesRef.current.push(currentHandSize);
        }
        setProgress((prev) => {
          const next = prev + interval / targetDuration;
          if (next >= 1) {
            clearInterval(timer);
            setStep(2);
            return 0;
          }
          return next;
        });
      } else {
        // Slowly decay progress if hand drops
        setProgress((prev) => Math.max(0, prev - 0.04));
      }
    }, interval);

    return () => clearInterval(timer);
  }, [isOpen, step, currentGestureState, currentHandSize]);

  // Step 2: Hold Fist for ~2 seconds
  useEffect(() => {
    if (!isOpen || step !== 2) return;

    let timer: number;
    const interval = 50;
    const targetDuration = 2000;

    timer = window.setInterval(() => {
      if (currentGestureState === 'FIST') {
        setProgress((prev) => {
          const next = prev + interval / targetDuration;
          if (next >= 1) {
            clearInterval(timer);
            setStep(3);
            return 0;
          }
          return next;
        });
      } else {
        setProgress((prev) => Math.max(0, prev - 0.04));
      }
    }, interval);

    return () => clearInterval(timer);
  }, [isOpen, step, currentGestureState]);

  // Step 3: Hold Peace Sign for ~2 seconds
  useEffect(() => {
    if (!isOpen || step !== 3) return;

    let timer: number;
    const interval = 50;
    const targetDuration = 2000;

    timer = window.setInterval(() => {
      if (currentGestureState === 'PEACE') {
        setProgress((prev) => {
          const next = prev + interval / targetDuration;
          if (next >= 1) {
            clearInterval(timer);
            setStep(4);
            return 1;
          }
          return next;
        });
      } else {
        setProgress((prev) => Math.max(0, prev - 0.04));
      }
    }, interval);

    return () => clearInterval(timer);
  }, [isOpen, step, currentGestureState]);

  // Handle completion
  const handleFinish = () => {
    const sizes = recordedSizesRef.current;
    const baseline =
      sizes.length > 5
        ? sizes.reduce((a, b) => a + b, 0) / sizes.length
        : 0.18; // Sensible default fallback

    onComplete({
      baselineHandSize: baseline,
      isCalibrated: true,
      lowLightDetected,
    });
  };

  // Quick skip with defaults
  const handleSkip = () => {
    onComplete({
      baselineHandSize: 0.18,
      isCalibrated: true,
      lowLightDetected,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn select-none pointer-events-auto">
      <div className="w-full max-w-md bg-[#05070d]/95 border border-cyan-500/35 rounded-2xl shadow-[0_0_40px_rgba(0,229,255,0.2),0_20px_50px_rgba(0,0,0,0.95)] p-6 relative font-tech text-slate-100 overflow-hidden">
        {/* Corner HUD Accents */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-400 pointer-events-none rounded-tl-sm" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-400 pointer-events-none rounded-tr-sm" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-400 pointer-events-none rounded-bl-sm" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-400 pointer-events-none rounded-br-sm" />

        {/* Modal Top */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-cyan-500/20">
          <div>
            <h3 className="font-orbitron font-bold text-sm tracking-wider text-cyan-200 uppercase">
              Sensor Calibration (6s)
            </h3>
            <p className="text-[10px] text-slate-400">
              Personalizing camera zoom sensitivity & gesture thresholds
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-1 text-slate-400 hover:text-white rounded transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Indicator Badges */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          <div
            className={`p-2 rounded-lg border text-center transition-all ${
              step === 1
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-[0_0_10px_rgba(0,229,255,0.3)]'
                : step > 1
                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                : 'bg-black/40 border-slate-700/40 text-slate-500'
            }`}
          >
            <span className="text-[10px] uppercase font-bold block">1. Open Hand</span>
            <span className="text-[9px] opacity-75">Base Distance</span>
          </div>

          <div
            className={`p-2 rounded-lg border text-center transition-all ${
              step === 2
                ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                : step > 2
                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                : 'bg-black/40 border-slate-700/40 text-slate-500'
            }`}
          >
            <span className="text-[10px] uppercase font-bold block">2. Fist</span>
            <span className="text-[9px] opacity-75">Explode Test</span>
          </div>

          <div
            className={`p-2 rounded-lg border text-center transition-all ${
              step === 3
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                : step > 3
                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                : 'bg-black/40 border-slate-700/40 text-slate-500'
            }`}
          >
            <span className="text-[10px] uppercase font-bold block">3. Peace</span>
            <span className="text-[9px] opacity-75">Collapse Test</span>
          </div>
        </div>

        {/* Dynamic Center Card based on step */}
        {step === 1 && (
          <div className="text-center py-4 space-y-3">
            <div className="text-4xl animate-bounce">🖐️</div>
            <div>
              <h4 className="font-orbitron font-bold text-base text-[#00E5FF]">
                Hold Open Hand Steady
              </h4>
              <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto">
                Hold your open hand still at a comfortable natural distance from the webcam for 2 seconds.
              </p>
            </div>
            {/* Circular Progress Bar */}
            <div className="w-full bg-black/60 rounded-full h-2.5 overflow-hidden border border-cyan-500/30 mt-3">
              <div
                className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full transition-all duration-75 shadow-[0_0_10px_#00E5FF]"
                style={{ width: `${Math.round(progress * 100)}%` }}
              />
            </div>
            <div className="text-[11px] text-cyan-300">
              {currentGestureState === 'OPEN HAND'
                ? `Recording baseline: ${Math.round(progress * 100)}%`
                : 'Show Open Hand to continue...'}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="text-center py-4 space-y-3">
            <div className="text-4xl animate-bounce">✊</div>
            <div>
              <h4 className="font-orbitron font-bold text-base text-amber-300">
                Make a Fist
              </h4>
              <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto">
                Close your hand into a fist and hold steady for 2 seconds to verify the explosion trigger.
              </p>
            </div>
            <div className="w-full bg-black/60 rounded-full h-2.5 overflow-hidden border border-amber-500/30 mt-3">
              <div
                className="bg-gradient-to-r from-amber-400 to-orange-500 h-full transition-all duration-75 shadow-[0_0_10px_#F59E0B]"
                style={{ width: `${Math.round(progress * 100)}%` }}
              />
            </div>
            <div className="text-[11px] text-amber-300">
              {currentGestureState === 'FIST'
                ? `Verifying fist: ${Math.round(progress * 100)}%`
                : 'Make a fist to continue...'}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="text-center py-4 space-y-3">
            <div className="text-4xl animate-bounce">✌️</div>
            <div>
              <h4 className="font-orbitron font-bold text-base text-emerald-300">
                Show Peace Sign
              </h4>
              <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto">
                Extend your index and middle fingers (peace sign ✌️) for 2 seconds to verify collapse trigger.
              </p>
            </div>
            <div className="w-full bg-black/60 rounded-full h-2.5 overflow-hidden border border-emerald-500/30 mt-3">
              <div
                className="bg-gradient-to-r from-emerald-400 to-teal-500 h-full transition-all duration-75 shadow-[0_0_10px_#10B981]"
                style={{ width: `${Math.round(progress * 100)}%` }}
              />
            </div>
            <div className="text-[11px] text-emerald-300">
              {currentGestureState === 'PEACE'
                ? `Verifying peace sign: ${Math.round(progress * 100)}%`
                : 'Show peace sign to continue...'}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="text-center py-4 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-950/60 border border-emerald-400/60 text-emerald-400 flex items-center justify-center mx-auto text-2xl shadow-[0_0_20px_rgba(16,185,129,0.5)]">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-orbitron font-bold text-base text-emerald-300">
                Calibration Verified!
              </h4>
              <p className="text-xs text-slate-300 mt-1">
                Your hand geometry and environmental lighting have been calibrated.
              </p>
            </div>
          </div>
        )}

        {/* Ambient lighting warning if detected */}
        {lowLightDetected && (
          <div className="mt-3 p-2.5 rounded-lg bg-amber-950/30 border border-amber-500/30 flex items-center gap-2 text-xs text-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Low lighting detected: face a lamp or window for maximum responsiveness.</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 mt-4 border-t border-cyan-500/20">
          <button
            type="button"
            onClick={handleSkip}
            className="text-xs text-slate-400 hover:text-slate-200 underline cursor-pointer"
          >
            Skip Calibration (Use Defaults)
          </button>

          {step === 4 ? (
            <button
              type="button"
              onClick={handleFinish}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-emerald-400 to-teal-400 text-black font-orbitron font-bold text-xs uppercase tracking-wider cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.6)]"
            >
              Start Inspection
            </button>
          ) : (
            <div className="text-[11px] text-cyan-400/60 font-mono">
              Step {step} of 3
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
