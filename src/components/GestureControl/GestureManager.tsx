import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  GestureState,
  LandmarkPoint,
  GestureCameraInput,
  GestureCalibrationData,
  GestureDetectionResult,
} from '../../types/gesture';
import {
  loadMediaPipeHands,
  classifyHandGesture,
  sampleFrameBrightness,
} from '../../utils/gestureDetector';
import { WebcamPreviewHUD } from './WebcamPreviewHUD';
import { GestureLegendModal } from './GestureLegendModal';
import { CalibrationModal } from './CalibrationModal';

interface GestureManagerProps {
  isActive: boolean;
  onDeactivate: () => void;
  onExplodeChange: (isExploded: boolean, progress: number) => void;
  gestureInputRef: React.MutableRefObject<GestureCameraInput | null>;
  onError: (msg: string) => void;
}

export const GestureManager: React.FC<GestureManagerProps> = ({
  isActive,
  onDeactivate,
  onExplodeChange,
  gestureInputRef,
  onError,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const handsRef = useRef<any>(null);

  // Calibration state (session-only)
  const [calibrationData, setCalibrationData] = useState<GestureCalibrationData>({
    baselineHandSize: 0.18,
    isCalibrated: false,
    lowLightDetected: false,
  });

  const [isCalibrating, setIsCalibrating] = useState<boolean>(false);
  const [showLegend, setShowLegend] = useState<boolean>(false);

  // Live tracking telemetry for HUD
  const [currentGestureState, setCurrentGestureState] = useState<GestureState>('NO HAND');
  const [extendedCount, setExtendedCount] = useState<number>(0);
  const [landmarks, setLandmarks] = useState<LandmarkPoint[] | undefined>(undefined);
  const [holdProgress, setHoldProgress] = useState<number>(0);
  const [currentHandSize, setCurrentHandSize] = useState<number>(0.18);
  const [lowLightDetected, setLowLightDetected] = useState<boolean>(false);

  // References for continuous tracking state across decoupled loops
  const prevWristXRef = useRef<number | null>(null);
  const prevHandSizeRef = useRef<number | null>(null);
  const smoothedRotateRef = useRef<number>(0);
  const smoothedZoomRef = useRef<number>(0);

  // State machine for discrete trigger confirm window (~300ms) & re-arming
  const recentStatesRef = useRef<GestureState[]>([]);
  const fistStartTimeRef = useRef<number | null>(null);
  const peaceStartTimeRef = useRef<number | null>(null);
  const fistArmedRef = useRef<boolean>(true);
  const peaceArmedRef = useRef<boolean>(true);

  // Start webcam and load MediaPipe
  useEffect(() => {
    if (!isActive) {
      // Clean up if deactivated
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      if (handsRef.current) {
        try {
          handsRef.current.close();
        } catch {
          // ignore
        }
        handsRef.current = null;
      }
      if (gestureInputRef.current) {
        gestureInputRef.current.active = false;
        gestureInputRef.current.rotateDeltaX = 0;
        gestureInputRef.current.zoomDelta = 0;
      }
      setCurrentGestureState('NO HAND');
      setLandmarks(undefined);
      return;
    }

    let isMounted = true;
    let detectionAnimationId: number;

    const setupTracking = async () => {
      try {
        // 1. Check & Request Webcam access (320x240 downscaled ideal feed)
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Webcam media API not supported in this browser.');
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 320 },
            height: { ideal: 240 },
            facingMode: 'user',
          },
          audio: false,
        });

        if (!isMounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }

        // 2. Load MediaPipe Hands via CDN
        await loadMediaPipeHands();

        if (!isMounted) return;

        // 3. Initialize MediaPipe Hands model
        const HandsClass = (window as any).Hands;
        if (!HandsClass) {
          throw new Error('MediaPipe Hands library could not be loaded.');
        }

        const hands = new HandsClass({
          locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
        });

        // Set lite complexity (0) for lowest latency inference
        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 0,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        handsRef.current = hands;

        // Offscreen canvas (320x240) to guarantee downscaled feed to inference engine
        const offscreenCanvas = document.createElement('canvas');
        offscreenCanvas.width = 320;
        offscreenCanvas.height = 240;
        const offscreenCtx = offscreenCanvas.getContext('2d', { willReadFrequently: true });

        // Result handler
        hands.onResults((results: any) => {
          if (!isMounted) return;

          const rawLandmarks: LandmarkPoint[] | undefined =
            results.multiHandLandmarks && results.multiHandLandmarks[0];

          if (rawLandmarks && rawLandmarks.length >= 21) {
            setLandmarks(rawLandmarks);

            // Classify gesture
            const classification = classifyHandGesture(
              rawLandmarks,
              prevWristXRef.current,
              prevHandSizeRef.current,
              calibrationData.baselineHandSize
            );

            prevWristXRef.current = classification.wristX;
            prevHandSizeRef.current = classification.apparentHandSize;
            setCurrentHandSize(classification.apparentHandSize);
            setExtendedCount(classification.extendedCount);

            // Buffer last 3 frames for rolling majority check on discrete gestures (FIST & PEACE)
            const recent = recentStatesRef.current;
            recent.push(classification.state);
            if (recent.length > 3) recent.shift();

            // Majority vote for discrete state
            const stateCounts: Record<string, number> = {};
            for (const s of recent) {
              stateCounts[s] = (stateCounts[s] || 0) + 1;
            }
            let smoothedState: GestureState = classification.state;
            for (const [s, count] of Object.entries(stateCounts)) {
              if (count >= 2) {
                smoothedState = s as GestureState;
                break;
              }
            }

            setCurrentGestureState(smoothedState);

            const now = performance.now();

            // -------------------------------------------------------------
            // Discrete Gesture: FIST -> EXPLODE VIEW (~300ms confirm window)
            // -------------------------------------------------------------
            if (smoothedState === 'FIST') {
              if (fistArmedRef.current) {
                if (fistStartTimeRef.current === null) {
                  fistStartTimeRef.current = now;
                }
                const elapsed = now - fistStartTimeRef.current;
                const prog = Math.min(1.0, elapsed / 300);
                setHoldProgress(prog);

                if (elapsed >= 300) {
                  // Fire Explode
                  onExplodeChange(true, 1.0);
                  fistArmedRef.current = false; // Disarm until OPEN HAND or NO HAND
                  setHoldProgress(1.0);
                }
              }
            }
            // -------------------------------------------------------------
            // Discrete Gesture: PEACE -> COLLAPSE VIEW (~300ms confirm window)
            // -------------------------------------------------------------
            else if (smoothedState === 'PEACE') {
              if (peaceArmedRef.current) {
                if (peaceStartTimeRef.current === null) {
                  peaceStartTimeRef.current = now;
                }
                const elapsed = now - peaceStartTimeRef.current;
                const prog = Math.min(1.0, elapsed / 300);
                setHoldProgress(prog);

                if (elapsed >= 300) {
                  // Fire Collapse
                  onExplodeChange(false, 0.0);
                  peaceArmedRef.current = false; // Disarm until OPEN HAND or NO HAND
                  setHoldProgress(1.0);
                }
              }
            }
            // -------------------------------------------------------------
            // Re-arm state machine when hand returns to OPEN HAND
            // -------------------------------------------------------------
            else if (smoothedState === 'OPEN HAND') {
              fistArmedRef.current = true;
              peaceArmedRef.current = true;
              fistStartTimeRef.current = null;
              peaceStartTimeRef.current = null;
              setHoldProgress(0);
            } else {
              setHoldProgress(0);
            }

            // -------------------------------------------------------------
            // Continuous Navigation Mode (OPEN HAND)
            // -------------------------------------------------------------
            if (classification.state === 'OPEN HAND') {
              // 1. Azimuth Rotation: Proportional to wrist horizontal speed (deltaX)
              // Mirrored coordinate: moving hand to user's right produces deltaX > 0.
              // OrbitControls rotateLeft(angle): angle > 0 rotates camera counter-clockwise
              // which turns view to the right.
              let targetRotate = 0;
              if (Math.abs(classification.wristDeltaX) > 0.0015) {
                // Proportional speed
                targetRotate = classification.wristDeltaX * 4.8;
              }

              // 2. Depth Cue Zoom: Hand apparent size (wrist to middle MCP)
              // Hand closer to camera (sizeDelta > 0) -> Zoom in (negative camera distance delta)
              // Hand farther from camera (sizeDelta < 0) -> Zoom out (positive camera distance delta)
              let targetZoom = 0;
              const normalizedDelta = classification.sizeDelta / (calibrationData.baselineHandSize || 0.18);
              if (Math.abs(normalizedDelta) > 0.003) {
                targetZoom = -normalizedDelta * 2.2;
              }

              // Immediate per-frame lerp: current += (target - current) * 0.25 (responsive & smooth)
              smoothedRotateRef.current += (targetRotate - smoothedRotateRef.current) * 0.25;
              smoothedZoomRef.current += (targetZoom - smoothedZoomRef.current) * 0.25;

              if (gestureInputRef.current) {
                gestureInputRef.current.active = true;
                gestureInputRef.current.rotateDeltaX = smoothedRotateRef.current;
                gestureInputRef.current.zoomDelta = smoothedZoomRef.current;
              }
            } else {
              // Not open hand: decay velocities to 0 so camera stops naturally
              smoothedRotateRef.current *= 0.5;
              smoothedZoomRef.current *= 0.5;
              if (gestureInputRef.current) {
                gestureInputRef.current.rotateDeltaX = smoothedRotateRef.current;
                gestureInputRef.current.zoomDelta = smoothedZoomRef.current;
              }
            }
          } else {
            // NO HAND detected
            setLandmarks(undefined);
            setCurrentGestureState('NO HAND');
            prevWristXRef.current = null;
            prevHandSizeRef.current = null;
            fistArmedRef.current = true;
            peaceArmedRef.current = true;
            fistStartTimeRef.current = null;
            peaceStartTimeRef.current = null;
            setHoldProgress(0);
            smoothedRotateRef.current = 0;
            smoothedZoomRef.current = 0;

            if (gestureInputRef.current) {
              gestureInputRef.current.active = false;
              gestureInputRef.current.rotateDeltaX = 0;
              gestureInputRef.current.zoomDelta = 0;
            }
          }
        });

        // 4. Decoupled requestAnimationFrame loop for hand detection
        let isProcessing = false;
        let frameCount = 0;

        const processFrame = async () => {
          if (!isMounted || !videoRef.current || !handsRef.current) return;

          const video = videoRef.current;
          if (video.readyState >= 2 && !isProcessing && offscreenCtx) {
            isProcessing = true;
            try {
              offscreenCtx.drawImage(video, 0, 0, 320, 240);

              // Periodic brightness check every 45 frames (~1.5s)
              frameCount++;
              if (frameCount % 45 === 0) {
                const brightness = sampleFrameBrightness(offscreenCtx, 320, 240);
                const isLow = brightness < 38;
                setLowLightDetected(isLow);
              }

              await handsRef.current.send({ image: offscreenCanvas });
            } catch (err) {
              // Frame dropped or busy, continue loop
            } finally {
              isProcessing = false;
            }
          }

          detectionAnimationId = requestAnimationFrame(processFrame);
        };

        detectionAnimationId = requestAnimationFrame(processFrame);

        // First run check: prompt calibration & legend if not calibrated in this session
        if (!calibrationData.isCalibrated) {
          setIsCalibrating(true);
        }
      } catch (err: any) {
        console.error('Gesture Control Initialization Error:', err);
        const errorMsg =
          err?.name === 'NotAllowedError'
            ? 'Webcam permission was denied. Please allow camera access in browser settings.'
            : err?.message || 'Could not access webcam for gesture tracking.';
        onError(errorMsg);
        onDeactivate();
      }
    };

    setupTracking();

    return () => {
      isMounted = false;
      cancelAnimationFrame(detectionAnimationId);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (handsRef.current) {
        try {
          handsRef.current.close();
        } catch {
          // ignore
        }
        handsRef.current = null;
      }
      if (gestureInputRef.current) {
        gestureInputRef.current.active = false;
        gestureInputRef.current.rotateDeltaX = 0;
        gestureInputRef.current.zoomDelta = 0;
      }
    };
  }, [isActive, calibrationData.baselineHandSize, onDeactivate, onExplodeChange, onError]);

  // Handle calibration completion
  const handleCalibrationComplete = (data: GestureCalibrationData) => {
    setCalibrationData(data);
    setIsCalibrating(false);
    // Show one-time legend after first calibration
    setShowLegend(true);
  };

  if (!isActive) return null;

  return (
    <>
      {/* Real-time Glassmorphic Webcam HUD */}
      <WebcamPreviewHUD
        videoRef={videoRef}
        gestureState={currentGestureState}
        extendedCount={extendedCount}
        holdProgress={holdProgress}
        landmarks={landmarks}
        lowLightDetected={lowLightDetected}
        onOpenLegend={() => setShowLegend(true)}
        onRecalibrate={() => setIsCalibrating(true)}
        onClose={onDeactivate}
      />

      {/* Interactive Calibration Modal */}
      <CalibrationModal
        isOpen={isCalibrating}
        currentGestureState={currentGestureState}
        currentHandSize={currentHandSize}
        lowLightDetected={lowLightDetected}
        onComplete={handleCalibrationComplete}
        onCancel={() => {
          setIsCalibrating(false);
          setShowLegend(true);
        }}
      />

      {/* One-time / Re-openable Gesture Legend Guide */}
      <GestureLegendModal
        isOpen={showLegend}
        onClose={() => setShowLegend(false)}
      />
    </>
  );
};
