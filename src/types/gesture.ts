export type GestureState = 'NO HAND' | 'OPEN HAND' | 'FIST' | 'PEACE' | 'OTHER';

export interface LandmarkPoint {
  x: number;
  y: number;
  z: number;
}

export interface GestureDetectionResult {
  state: GestureState;
  extendedCount: number;
  isIndexExtended: boolean;
  isMiddleExtended: boolean;
  isRingExtended: boolean;
  isPinkyExtended: boolean;
  isThumbExtended: boolean;
  wristX: number;
  wristDeltaX: number;
  apparentHandSize: number;
  sizeDelta: number;
  landmarks?: LandmarkPoint[];
  brightness?: number;
}

export interface GestureCameraInput {
  rotateDeltaX: number;
  zoomDelta: number;
  active: boolean;
}

export interface GestureCalibrationData {
  baselineHandSize: number;
  isCalibrated: boolean;
  lowLightDetected?: boolean;
}
