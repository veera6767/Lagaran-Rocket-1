import { GestureState, LandmarkPoint, GestureDetectionResult } from '../types/gesture';

/**
 * Loads MediaPipe Hands via CDN scripts dynamically if not already available in window
 */
export async function loadMediaPipeHands(): Promise<void> {
  if (typeof (window as unknown as { Hands?: unknown }).Hands !== 'undefined') {
    return;
  }

  // Helper to load external script
  const loadScript = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) {
        if ((existing as HTMLScriptElement).dataset.loaded === 'true') {
          resolve();
        } else {
          existing.addEventListener('load', () => resolve());
          existing.addEventListener('error', (e) => reject(e));
        }
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.crossOrigin = 'anonymous';
      script.async = true;
      script.onload = () => {
        script.dataset.loaded = 'true';
        resolve();
      };
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
      document.head.appendChild(script);
    });
  };

  // Load Hands and Camera Utils
  await Promise.all([
    loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js'),
    loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js'),
  ]);
}

/**
 * Computes 3D Euclidean distance between two landmark points
 */
function dist(a: LandmarkPoint, b: LandmarkPoint): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = (a.z - b.z) * 0.5; // Scale depth coordinate
  return Math.hypot(dx, dy, dz);
}

/**
 * Computes 2D Euclidean distance (in normalized screen space)
 */
export function dist2D(a: LandmarkPoint, b: LandmarkPoint): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/**
 * Calculates the palm centroid by averaging the wrist and the 4 MCP joints
 */
export function getPalmCentroid(landmarks: LandmarkPoint[]): LandmarkPoint {
  // Wrist (0), Index MCP (5), Middle MCP (9), Ring MCP (13), Pinky MCP (17)
  const indices = [0, 5, 9, 13, 17];
  let sumX = 0;
  let sumY = 0;
  let sumZ = 0;

  for (const idx of indices) {
    sumX += landmarks[idx].x;
    sumY += landmarks[idx].y;
    sumZ += landmarks[idx].z;
  }

  const count = indices.length;
  return {
    x: sumX / count,
    y: sumY / count,
    z: sumZ / count,
  };
}

/**
 * Classifies fingers and overall hand pose based on landmark distances from the palm centroid.
 *
 * Rule: A finger is extended if its fingertip is farther from the palm centroid than its PIP joint.
 */
export function classifyHandGesture(
  landmarks: LandmarkPoint[] | null | undefined,
  prevWristX: number | null,
  prevHandSize: number | null,
  baselineHandSize: number
): GestureDetectionResult {
  if (!landmarks || landmarks.length < 21) {
    return {
      state: 'NO HAND',
      extendedCount: 0,
      isIndexExtended: false,
      isMiddleExtended: false,
      isRingExtended: false,
      isPinkyExtended: false,
      isThumbExtended: false,
      wristX: 0.5,
      wristDeltaX: 0,
      apparentHandSize: baselineHandSize,
      sizeDelta: 0,
      landmarks: undefined,
    };
  }

  const palmCentroid = getPalmCentroid(landmarks);

  // Landmark Indices:
  // Thumb: Tip=4, IP=3, MCP=2
  // Index: Tip=8, PIP=6, MCP=5
  // Middle: Tip=12, PIP=10, MCP=9
  // Ring: Tip=16, PIP=14, MCP=13
  // Pinky: Tip=20, PIP=18, MCP=17
  const isThumbExtended = dist(landmarks[4], palmCentroid) > dist(landmarks[3], palmCentroid);
  const isIndexExtended = dist(landmarks[8], palmCentroid) > dist(landmarks[6], palmCentroid);
  const isMiddleExtended = dist(landmarks[12], palmCentroid) > dist(landmarks[10], palmCentroid);
  const isRingExtended = dist(landmarks[16], palmCentroid) > dist(landmarks[14], palmCentroid);
  const isPinkyExtended = dist(landmarks[20], palmCentroid) > dist(landmarks[18], palmCentroid);

  let extendedCount = 0;
  if (isThumbExtended) extendedCount++;
  if (isIndexExtended) extendedCount++;
  if (isMiddleExtended) extendedCount++;
  if (isRingExtended) extendedCount++;
  if (isPinkyExtended) extendedCount++;

  // Mirrored X for wrist (0 is left, 1 is right from user perspective in mirrored webcam)
  const mirroredWristX = 1.0 - landmarks[0].x;

  let wristDeltaX = 0;
  if (prevWristX !== null) {
    wristDeltaX = mirroredWristX - prevWristX;
  }

  // Apparent hand size: distance between wrist (0) and middle finger MCP (9)
  const apparentHandSize = dist2D(landmarks[0], landmarks[9]);

  let sizeDelta = 0;
  if (prevHandSize !== null) {
    sizeDelta = apparentHandSize - prevHandSize;
  }

  // Shape classification
  let state: GestureState = 'OTHER';

  // Fist: 0 fingers extended (or index, middle, ring, pinky are all curled)
  if (extendedCount === 0 || (!isIndexExtended && !isMiddleExtended && !isRingExtended && !isPinkyExtended)) {
    state = 'FIST';
  }
  // Peace sign: exactly index and middle extended, ring and pinky curled
  else if (isIndexExtended && isMiddleExtended && !isRingExtended && !isPinkyExtended) {
    state = 'PEACE';
  }
  // Open hand: 3 to 5 fingers extended
  else if (extendedCount >= 3) {
    state = 'OPEN HAND';
  }

  return {
    state,
    extendedCount,
    isIndexExtended,
    isMiddleExtended,
    isRingExtended,
    isPinkyExtended,
    isThumbExtended,
    wristX: mirroredWristX,
    wristDeltaX,
    apparentHandSize,
    sizeDelta,
    landmarks,
  };
}

/**
 * Samples average pixel brightness from an offscreen 2D canvas context (0 to 255)
 */
export function sampleFrameBrightness(
  ctx: CanvasRenderingContext2D,
  width = 320,
  height = 240
): number {
  try {
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    let sumLuma = 0;
    let sampleCount = 0;

    // Sample every 16th pixel for near-instant evaluation
    for (let i = 0; i < data.length; i += 64) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      // ITU-R BT.601 relative luminance
      sumLuma += 0.299 * r + 0.587 * g + 0.114 * b;
      sampleCount++;
    }

    return sampleCount > 0 ? sumLuma / sampleCount : 128;
  } catch {
    return 128;
  }
}
