export interface RocketPartInfo {
  id: string;
  name: string;
  assembly: string;
  order: number; // 1 (bottom) to 8 (top)
  material: string;
  finish: string;
  massKg: number;
  lengthMm: number;
  diameterMm: number;
  description: string;
  technicalDetails: string[];
  specs: {
    label: string;
    value: string;
  }[];
  explodedYOffset: number; // Vertical separation offset
  explodedRadialOffset?: number; // Radial separation for fins
}

export type CameraPreset = 'hero' | 'engine' | 'recovery' | 'payload' | 'nose' | 'full';

export interface ViewerSettings {
  isExploded: boolean;
  explodeProgress: number; // 0.0 to 1.0
  autoRotate: boolean;
  wireframe: boolean;
  showStabilityMarkers: boolean; // Center of Gravity & Center of Pressure
}
