import * as THREE from 'three';
import { createRocketMaterials } from './proceduralMaterials';
import { ROCKET_SPEC } from '../data/rocketParts';

export interface RocketPartGroup {
  id: string;
  name: string;
  assembly: string;
  order: number;
  group: THREE.Group;
  initialY: number;
  explodedDeltaY: number;
  initialRadial?: number;
  explodedRadialDelta?: number;
  meshes: THREE.Mesh[];
  originalMaterials: (THREE.Material | THREE.Material[])[];
}

export interface BuiltRocketModel {
  rootGroup: THREE.Group;
  parts: Map<string, RocketPartGroup>;
  materials: ReturnType<typeof createRocketMaterials>;
  updateExplosion: (progress: number) => void;
  highlightPart: (partId: string | null) => void;
  updateHighlightAnimation: (time: number) => void;
  setWireframe: (enabled: boolean) => void;
  dispose: () => void;
}

/**
 * Scale factor: 1 mm = 0.0025 Three.js units.
 * Total length 2000 mm = 5.00 units in 3D.
 * Outer diameter 102 mm = 0.255 units (radius 0.1275 units).
 * Wall thickness 3 mm = 0.0075 units (inner radius 0.1200 units, ID 96 mm).
 * The 3D model matches the exact real-world 19.61:1 aspect ratio and 5.39:1 nose fineness ratio.
 */
export const SCALE = 0.0025;
export const mmToUnits = (mm: number) => mm * SCALE;

/**
 * Creates a watertight hollow cylindrical tube with true wall thickness.
 * Both outer and inner walls and top/bottom annular rims are visible in solid and wireframe mode.
 */
function createHollowTubeGeometry(
  outerRadius: number,
  innerRadius: number,
  length: number,
  radialSegments = 64
): THREE.BufferGeometry {
  const points: THREE.Vector2[] = [
    new THREE.Vector2(outerRadius, -length / 2),
    new THREE.Vector2(outerRadius, length / 2),
    new THREE.Vector2(innerRadius, length / 2),
    new THREE.Vector2(innerRadius, -length / 2),
    new THREE.Vector2(outerRadius, -length / 2),
  ];
  const geo = new THREE.LatheGeometry(points, radialSegments);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Builds the complete 3D LAGARAM-1 rocket model with exact Review 2 dimensions and hollow tubes.
 */
export function buildRocketModel(): BuiltRocketModel {
  const materials = createRocketMaterials();
  const rootGroup = new THREE.Group();
  rootGroup.name = 'LAGARAM-1 Root';

  const parts = new Map<string, RocketPartGroup>();

  // Airframe dimensions from ROCKET_SPEC
  const outerRadius = mmToUnits(ROCKET_SPEC.airframe.outerRadiusMm); // 0.1275 units (51 mm)
  const innerRadius = mmToUnits(ROCKET_SPEC.airframe.innerRadiusMm); // 0.1200 units (48 mm)
  const totalLength = mmToUnits(ROCKET_SPEC.airframe.totalLengthMm); // 5.00 units (2000 mm)

  // Rocket axial limits along Y: tail at -2.5, nose tip at +2.5
  const tailY = -totalLength / 2; // -2.50
  const noseTipY = totalLength / 2; // +2.50

  // ----------------------------------------------------
  // 1. BOOSTER SECTION (1200 mm to 2000 mm, length 800 mm)
  // Hollow tube (OD 102, ID 96, 3 mm wall) housing inner motor
  // ----------------------------------------------------
  const boosterGroup = new THREE.Group();
  boosterGroup.name = 'booster-section';

  const boosterLength = mmToUnits(ROCKET_SPEC.axialLayout.boosterSection.lengthMm); // 800 mm -> 2.00
  const boosterCenterY = tailY + boosterLength / 2; // -2.5 + 1.0 = -1.50

  const boosterGeo = createHollowTubeGeometry(outerRadius, innerRadius, boosterLength, 64);
  const boosterMesh = new THREE.Mesh(boosterGeo, materials.recoveryMaterial);
  boosterMesh.castShadow = true;
  boosterMesh.receiveShadow = true;
  boosterMesh.position.y = boosterCenterY;
  boosterMesh.userData = { partId: 'booster-section' };

  // Structural joint rings at section junctions
  const jointRingGeo = new THREE.TorusGeometry(outerRadius + 0.002, 0.003, 10, 64);
  jointRingGeo.rotateX(Math.PI / 2);
  const boosterRingTop = new THREE.Mesh(jointRingGeo, materials.bulkheadMaterial);
  boosterRingTop.position.y = boosterCenterY + boosterLength / 2 - 0.005;
  boosterRingTop.userData = { partId: 'booster-section' };

  const boosterRingBottom = new THREE.Mesh(jointRingGeo, materials.bulkheadMaterial);
  boosterRingBottom.position.y = boosterCenterY - boosterLength / 2 + 0.005;
  boosterRingBottom.userData = { partId: 'booster-section' };

  boosterGroup.add(boosterMesh, boosterRingTop, boosterRingBottom);
  rootGroup.add(boosterGroup);

  // ----------------------------------------------------
  // 2. INNER MOTOR (M1928, 1300 mm to 2000 mm, length 700 mm)
  // Separate internal component: 6061-T6 casing (98 mm OD, 4 mm wall),
  // 4-segment BATES grain, top flange, igniter/valve fittings, exhaust nozzle
  // ----------------------------------------------------
  const motorGroup = new THREE.Group();
  motorGroup.name = 'inner-motor';

  const motorLength = mmToUnits(ROCKET_SPEC.motor.casingLengthMm); // 700 mm -> 1.75
  const motorOuterRadius = mmToUnits(ROCKET_SPEC.motor.casingOuterDiameterMm / 2); // 49 mm -> 0.1225
  const motorInnerRadius = mmToUnits(ROCKET_SPEC.motor.casingInnerDiameterMm / 2); // 45 mm -> 0.1125
  const motorCenterY = tailY + motorLength / 2; // -2.5 + 0.875 = -1.625

  // Motor cylindrical pressure vessel body
  const motorCasingLength = motorLength * 0.80; // ~1.40 units
  const motorCasingCenterY = motorCenterY + motorLength * 0.08;
  const motorCasingGeo = createHollowTubeGeometry(motorOuterRadius, motorInnerRadius, motorCasingLength, 64);
  const motorCasingMesh = new THREE.Mesh(motorCasingGeo, materials.motorCasingMaterial);
  motorCasingMesh.castShadow = true;
  motorCasingMesh.receiveShadow = true;
  motorCasingMesh.position.y = motorCasingCenterY;
  motorCasingMesh.userData = { partId: 'inner-motor' };

  // Top stepped circular flange cap (8-bolt circular pattern)
  const flangeRadius = motorOuterRadius * 1.04;
  const flangeTopY = motorCasingCenterY + motorCasingLength / 2;
  const flangeGeo = new THREE.CylinderGeometry(flangeRadius, flangeRadius, 0.024, 64);
  const flangeMesh = new THREE.Mesh(flangeGeo, materials.motorCasingMaterial);
  flangeMesh.position.y = flangeTopY + 0.012;
  flangeMesh.userData = { partId: 'inner-motor' };

  // 8 bolt heads on top flange
  const boltHeadGeo = new THREE.CylinderGeometry(0.004, 0.004, 0.008, 6);
  const flangeBolts: THREE.Mesh[] = [];
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4;
    const bx = Math.cos(angle) * (flangeRadius - 0.008);
    const bz = Math.sin(angle) * (flangeRadius - 0.008);
    const bMesh = new THREE.Mesh(boltHeadGeo, materials.boltSteelMaterial);
    bMesh.position.set(bx, flangeTopY + 0.028, bz);
    bMesh.userData = { partId: 'inner-motor' };
    flangeBolts.push(bMesh);
  }

  // Top protruding fittings: spark-plug igniter & 90° pneumatic elbow
  const igniterStemGeo = new THREE.CylinderGeometry(0.004, 0.004, 0.035, 12);
  const igniterStem = new THREE.Mesh(igniterStemGeo, materials.sparkPlugCeramicMaterial);
  igniterStem.position.set(0.035, flangeTopY + 0.036, 0.035);
  igniterStem.userData = { partId: 'inner-motor' };

  const valveElbowGeo = new THREE.BoxGeometry(0.012, 0.012, 0.012);
  const valveElbow = new THREE.Mesh(valveElbowGeo, materials.fittingGunmetalMaterial);
  valveElbow.position.set(-0.04, flangeTopY + 0.026, -0.01);
  valveElbow.userData = { partId: 'inner-motor' };

  // Internal 4-segment BATES solid propellant grain inside motor casing (visible in wireframe/exploded)
  const grainSegmentHeight = (motorCasingLength * 0.88) / 4;
  const grainOuterRadius = motorInnerRadius * 0.94;
  const grainCoreRadius = motorInnerRadius * 0.32; // hollow central burn port
  const grainSegments: THREE.Mesh[] = [];

  for (let s = 0; s < 4; s++) {
    const sGeo = createHollowTubeGeometry(grainOuterRadius, grainCoreRadius, grainSegmentHeight * 0.92, 32);
    const sMesh = new THREE.Mesh(sGeo, materials.propellantGrainMaterial);
    const sy = motorCasingCenterY - (motorCasingLength * 0.40) + s * grainSegmentHeight + grainSegmentHeight * 0.5;
    sMesh.position.y = sy;
    sMesh.userData = { partId: 'inner-motor' };
    grainSegments.push(sMesh);
  }

  // Conical converging aft section & supersonic exhaust nozzle bell
  const throatRadius = motorOuterRadius * 0.38;
  const exitRadius = motorOuterRadius * 0.65;
  const nozzleTopY = motorCasingCenterY - motorCasingLength / 2;
  const nozzleBottomY = tailY - 0.04;

  const nozzlePoints: THREE.Vector2[] = [
    new THREE.Vector2(motorOuterRadius, nozzleTopY),
    new THREE.Vector2(throatRadius + 0.006, nozzleTopY - 0.08), // Converging
    new THREE.Vector2(throatRadius, nozzleTopY - 0.10), // Throat
    new THREE.Vector2(exitRadius, nozzleBottomY), // Conical expansion bell
    new THREE.Vector2(exitRadius - 0.008, nozzleBottomY), // Lip bottom
    new THREE.Vector2(throatRadius - 0.008, nozzleTopY - 0.10), // Inner throat
    new THREE.Vector2(motorInnerRadius, nozzleTopY), // Inner converge
    new THREE.Vector2(motorOuterRadius, nozzleTopY), // Close loop
  ];
  const nozzleGeo = new THREE.LatheGeometry(nozzlePoints, 64);
  nozzleGeo.computeVertexNormals();
  const nozzleMesh = new THREE.Mesh(nozzleGeo, materials.nozzleMaterial);
  nozzleMesh.castShadow = true;
  nozzleMesh.receiveShadow = true;
  nozzleMesh.userData = { partId: 'inner-motor' };

  // Graphite throat insert sleeve
  const throatInsertGeo = new THREE.CylinderGeometry(throatRadius - 0.007, throatRadius - 0.007, 0.03, 32, 1, true);
  const throatInsertMesh = new THREE.Mesh(throatInsertGeo, materials.graphiteThroatMaterial);
  throatInsertMesh.position.y = nozzleTopY - 0.10;
  throatInsertMesh.userData = { partId: 'inner-motor' };

  motorGroup.add(
    motorCasingMesh,
    flangeMesh,
    ...flangeBolts,
    igniterStem,
    valveElbow,
    ...grainSegments,
    nozzleMesh,
    throatInsertMesh
  );
  rootGroup.add(motorGroup);

  // ----------------------------------------------------
  // 3. STABILIZING FINS (x4 cruciform, G10 fiberglass)
  // Root chord 170 mm, tip chord 62 mm, semi-span 85 mm, thickness 6 mm
  // ----------------------------------------------------
  const finsGroup = new THREE.Group();
  finsGroup.name = 'fins';

  const finRootChord = mmToUnits(ROCKET_SPEC.fins.rootChordMm); // 170 mm -> 0.425
  const finTipChord = mmToUnits(ROCKET_SPEC.fins.tipChordMm); // 62 mm -> 0.155
  const finSemiSpan = mmToUnits(ROCKET_SPEC.fins.semiSpanMm); // 85 mm -> 0.2125
  const finThickness = mmToUnits(ROCKET_SPEC.fins.thicknessMm); // 6 mm -> 0.015
  const finSweep = finRootChord - finTipChord - 0.06; // Supersonic leading edge sweep

  // Construct trapezoidal fin shape in local (span X, chord Y) coordinates
  const finShape = new THREE.Shape();
  finShape.moveTo(0, 0); // Root trailing edge
  finShape.lineTo(0, finRootChord); // Root leading edge
  finShape.lineTo(finSemiSpan, finRootChord - finSweep); // Tip leading edge
  finShape.lineTo(finSemiSpan, finRootChord - finSweep - finTipChord); // Tip trailing edge
  finShape.closePath();

  const finExtrudeSettings = {
    steps: 1,
    depth: finThickness,
    bevelEnabled: true,
    bevelThickness: 0.003,
    bevelSize: 0.003,
    bevelOffset: -0.003,
    bevelSegments: 3,
  };

  const finGeo = new THREE.ExtrudeGeometry(finShape, finExtrudeSettings);
  finGeo.computeBoundingBox();
  const minX = finGeo.boundingBox!.min.x;
  const minY = finGeo.boundingBox!.min.y;
  const midZ = (finGeo.boundingBox!.min.z + finGeo.boundingBox!.max.z) / 2;
  finGeo.translate(-minX, -minY, -midZ);
  finGeo.computeVertexNormals();

  const finBaseY = tailY + 0.035; // Mounted near aft end of booster section
  const finMeshes: THREE.Mesh[] = [];

  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 2;
    const finMesh = new THREE.Mesh(finGeo, materials.finMaterial);
    finMesh.castShadow = true;
    finMesh.receiveShadow = true;
    finMesh.userData = { partId: 'fins' };

    const posX = Math.cos(angle) * outerRadius;
    const posZ = Math.sin(angle) * outerRadius;

    finMesh.position.set(posX, finBaseY, posZ);
    finMesh.rotation.set(0, -angle, 0);

    finMeshes.push(finMesh);
    finsGroup.add(finMesh);
  }

  rootGroup.add(finsGroup);

  // ----------------------------------------------------
  // 4. DROGUE BAY (800 mm to 1200 mm, length 400 mm)
  // Hollow composite cylinder + visual interstage bulkhead + drogue chute pack
  // ----------------------------------------------------
  const drogueGroup = new THREE.Group();
  drogueGroup.name = 'drogue-bay';

  const drogueLength = mmToUnits(ROCKET_SPEC.axialLayout.drogueBay.lengthMm); // 400 mm -> 1.00
  const drogueCenterY = tailY + boosterLength + drogueLength / 2; // -2.5 + 2.0 + 0.5 = 0.00

  const drogueGeo = createHollowTubeGeometry(outerRadius, innerRadius, drogueLength, 64);
  const drogueMesh = new THREE.Mesh(drogueGeo, materials.recoveryMaterial);
  drogueMesh.castShadow = true;
  drogueMesh.receiveShadow = true;
  drogueMesh.position.y = drogueCenterY;
  drogueMesh.userData = { partId: 'drogue-bay' };

  // Visual internal: 6061-T6 Interstage Bulkhead at lower boundary with eyebolt
  const bulkheadThickness = 0.015;
  const interstageBulkheadGeo = new THREE.CylinderGeometry(innerRadius - 0.001, innerRadius - 0.001, bulkheadThickness, 48);
  const interstageBulkheadMesh = new THREE.Mesh(interstageBulkheadGeo, materials.bulkheadMaterial);
  interstageBulkheadMesh.position.y = drogueCenterY - drogueLength / 2 + bulkheadThickness / 2;
  interstageBulkheadMesh.userData = { partId: 'drogue-bay' };

  // Forged eyebolt on bulkhead
  const eyeboltGeo = new THREE.TorusGeometry(0.008, 0.0025, 8, 24);
  const eyeboltMesh = new THREE.Mesh(eyeboltGeo, materials.boltSteelMaterial);
  eyeboltMesh.position.y = interstageBulkheadMesh.position.y + 0.014;
  eyeboltMesh.userData = { partId: 'drogue-bay' };

  // Internal drogue parachute pack model (visible when separated in exploded view)
  const drogueChutePackGeo = new THREE.CylinderGeometry(innerRadius * 0.75, innerRadius * 0.75, 0.16, 24);
  const drogueChutePack = new THREE.Mesh(drogueChutePackGeo, materials.drogueParachuteMaterial);
  drogueChutePack.position.y = drogueCenterY - 0.08;
  drogueChutePack.userData = { partId: 'drogue-bay' };

  // Static pressure ports (3 holes around perimeter)
  const staticPorts: THREE.Mesh[] = [];
  for (let i = 0; i < 3; i++) {
    const pAng = (i * Math.PI * 2) / 3;
    const pGeo = new THREE.CylinderGeometry(0.004, 0.004, 0.008, 12);
    pGeo.rotateZ(Math.PI / 2);
    const pMesh = new THREE.Mesh(pGeo, materials.bulkheadMaterial);
    pMesh.position.set(Math.cos(pAng) * outerRadius, drogueCenterY + 0.12, Math.sin(pAng) * outerRadius);
    pMesh.rotation.y = -pAng;
    pMesh.userData = { partId: 'drogue-bay' };
    staticPorts.push(pMesh);
  }

  drogueGroup.add(
    drogueMesh,
    interstageBulkheadMesh,
    eyeboltMesh,
    drogueChutePack,
    ...staticPorts
  );
  rootGroup.add(drogueGroup);

  // ----------------------------------------------------
  // 5. AVIONICS BAY (550 mm to 800 mm, length 250 mm)
  // Hollow RF-transparent composite tube + visual avionics bulkhead + flight computer sled
  // ----------------------------------------------------
  const avionicsGroup = new THREE.Group();
  avionicsGroup.name = 'avionics-bay';

  const avionicsLength = mmToUnits(ROCKET_SPEC.axialLayout.avionicsBay.lengthMm); // 250 mm -> 0.625
  const avionicsCenterY = tailY + boosterLength + drogueLength + avionicsLength / 2; // -2.5 + 2.0 + 1.0 + 0.3125 = +0.8125

  const avionicsGeo = createHollowTubeGeometry(outerRadius, innerRadius, avionicsLength, 64);
  const avionicsMesh = new THREE.Mesh(avionicsGeo, materials.payloadMaterial);
  avionicsMesh.castShadow = true;
  avionicsMesh.receiveShadow = true;
  avionicsMesh.position.y = avionicsCenterY;
  avionicsMesh.userData = { partId: 'avionics-bay' };

  // Visual internal: Avionics Bulkhead disc at base of avionics bay
  const avionicsBulkheadGeo = new THREE.CylinderGeometry(innerRadius - 0.001, innerRadius - 0.001, bulkheadThickness, 48);
  const avionicsBulkheadMesh = new THREE.Mesh(avionicsBulkheadGeo, materials.bulkheadMaterial);
  avionicsBulkheadMesh.position.y = avionicsCenterY - avionicsLength / 2 + bulkheadThickness / 2;
  avionicsBulkheadMesh.userData = { partId: 'avionics-bay' };

  // Internal electronics sled (dual flight computers, IMU, battery, telemetry antenna)
  const sledBoardGeo = new THREE.BoxGeometry(0.012, avionicsLength * 0.72, innerRadius * 1.35);
  const sledBoardMesh = new THREE.Mesh(sledBoardGeo, materials.avionicsCircuitMaterial);
  sledBoardMesh.position.y = avionicsCenterY;
  sledBoardMesh.userData = { partId: 'avionics-bay' };

  const imuChipGeo = new THREE.BoxGeometry(0.008, 0.035, 0.035);
  const imuChipMesh = new THREE.Mesh(imuChipGeo, materials.boltSteelMaterial);
  imuChipMesh.position.set(0.009, avionicsCenterY + 0.05, 0);
  imuChipMesh.userData = { partId: 'avionics-bay' };

  // Flush access hatch outline on bay surface
  const hatchOutlineGeo = new THREE.BoxGeometry(0.004, 0.12, 0.07);
  const hatchOutline = new THREE.Mesh(hatchOutlineGeo, materials.bulkheadMaterial);
  hatchOutline.position.set(outerRadius + 0.001, avionicsCenterY, 0);
  hatchOutline.userData = { partId: 'avionics-bay' };

  avionicsGroup.add(
    avionicsMesh,
    avionicsBulkheadMesh,
    sledBoardMesh,
    imuChipMesh,
    hatchOutline
  );
  rootGroup.add(avionicsGroup);

  // ----------------------------------------------------
  // 6. NOSE CONE (0 mm to 550 mm, length 550 mm)
  // Von Kármán aerodynamic profile, fineness ratio 5.39:1 (550 / 102)
  // Carbon Fibre Grey (#8B939B) with glossy clear-coat & aluminium pitot probe
  // Houses main parachute pack inside hollow cavity
  // ----------------------------------------------------
  const noseGroup = new THREE.Group();
  noseGroup.name = 'nose-cone';

  const noseLength = mmToUnits(ROCKET_SPEC.axialLayout.noseCone.lengthMm); // 550 mm -> 1.375
  const noseBaseY = avionicsCenterY + avionicsLength / 2; // +1.125
  const wallUnits = mmToUnits(ROCKET_SPEC.airframe.wallThicknessMm); // 3 mm -> 0.0075

  // Generate Von Kármán / LD-Haack supersonic series profile (outer and inner hollow shell)
  const noseSteps = 56;
  const noseOuterProfile: THREE.Vector2[] = [];
  const noseInnerProfile: THREE.Vector2[] = [];

  for (let i = 0; i <= noseSteps; i++) {
    const t = i / noseSteps; // 0 (tip) to 1 (base)
    const yRel = (1.0 - t) * noseLength; // Tip at noseLength, base at 0

    // Haack series / Von Kármán radius formula:
    // theta = acos(1 - 2*t)
    // r = (R / sqrt(pi)) * sqrt(theta - sin(2*theta)/2)
    const theta = Math.acos(Math.max(-1, Math.min(1, 1 - 2 * t)));
    const rNorm = Math.sqrt(Math.max(0, theta - Math.sin(2 * theta) / 2)) / Math.sqrt(Math.PI);
    const rOuter = Math.max(0.003, rNorm * outerRadius);
    const rInner = Math.max(0.001, rOuter - wallUnits);

    noseOuterProfile.push(new THREE.Vector2(rOuter, yRel));
    noseInnerProfile.push(new THREE.Vector2(rInner, yRel));
  }

  // Combine into a closed hollow shell curve:
  // outer tip -> outer base -> inner base -> inner tip
  const nosePoints: THREE.Vector2[] = [];
  // Outer profile from tip to base
  for (let i = 0; i <= noseSteps; i++) {
    nosePoints.push(noseOuterProfile[i]);
  }
  // Base annular wall rim
  nosePoints.push(new THREE.Vector2(innerRadius, 0));
  // Inner hollow cavity from base back up to tip
  for (let i = noseSteps; i >= 0; i--) {
    nosePoints.push(noseInnerProfile[i]);
  }
  // Close apex
  nosePoints.push(new THREE.Vector2(0.002, noseLength));

  const noseGeo = new THREE.LatheGeometry(nosePoints, 64);
  noseGeo.computeVertexNormals();
  const noseMesh = new THREE.Mesh(noseGeo, materials.noseConeMaterial);
  noseMesh.castShadow = true;
  noseMesh.receiveShadow = true;
  noseMesh.position.y = noseBaseY;
  noseMesh.userData = { partId: 'nose-cone' };

  // Light silver aluminium pitot air-data stagnation probe at nose apex
  const pitotLength = 0.14;
  const pitotBaseGeo = new THREE.CylinderGeometry(0.0035, 0.007, pitotLength * 0.6, 24);
  const pitotBase = new THREE.Mesh(pitotBaseGeo, materials.pitotTipMaterial);
  pitotBase.position.y = noseBaseY + noseLength + pitotLength * 0.3;
  pitotBase.userData = { partId: 'nose-cone' };

  const pitotNeedleGeo = new THREE.CylinderGeometry(0.0015, 0.0015, pitotLength * 0.4, 16);
  const pitotNeedle = new THREE.Mesh(pitotNeedleGeo, materials.pitotTipMaterial);
  pitotNeedle.position.y = noseBaseY + noseLength + pitotLength * 0.8;
  pitotNeedle.userData = { partId: 'nose-cone' };

  // Internal Main Parachute Pack (0.45 kg toroidal parachute + Kevlar shock bridle)
  // Visible inside hollow nose cone cavity, separating cleanly during exploded view
  const mainChutePackGeo = new THREE.TorusGeometry(innerRadius * 0.50, 0.024, 16, 32);
  mainChutePackGeo.rotateX(Math.PI / 2);
  const mainChutePack = new THREE.Mesh(mainChutePackGeo, materials.parachuteMaterial);
  mainChutePack.position.y = noseBaseY + noseLength * 0.28;
  mainChutePack.userData = { partId: 'nose-cone' };

  noseGroup.add(noseMesh, pitotBase, pitotNeedle, mainChutePack);
  rootGroup.add(noseGroup);

  // ----------------------------------------------------
  // REGISTER PART GROUPS & EXPLOSION KINEMATICS
  // ----------------------------------------------------
  const registerPart = (
    id: string,
    name: string,
    assembly: string,
    order: number,
    group: THREE.Group,
    explodedDeltaY: number,
    explodedRadialDelta = 0
  ) => {
    const meshes: THREE.Mesh[] = [];
    const originalMaterials: (THREE.Material | THREE.Material[])[] = [];

    group.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        meshes.push(obj);
        originalMaterials.push(obj.material);
      }
    });

    parts.set(id, {
      id,
      name,
      assembly,
      order,
      group,
      initialY: group.position.y,
      explodedDeltaY,
      explodedRadialDelta,
      meshes,
      originalMaterials,
    });
  };

  // Register all 6 major assemblies nose-to-tail
  registerPart('nose-cone', 'Nose Cone', 'Forward Aerodynamic Fairing', 1, noseGroup, 3.2, 0);
  registerPart('avionics-bay', 'Avionics Bay', 'Avionics & Payload Bay', 2, avionicsGroup, 1.8, 0);
  registerPart('drogue-bay', 'Drogue Bay', 'Recovery Subsystem', 3, drogueGroup, 0.8, 0);
  registerPart('booster-section', 'Booster Section', 'Airframe / Propulsion Bay', 4, boosterGroup, -0.2, 0);
  registerPart('inner-motor', 'Inner Motor (M1928)', 'Solid Rocket Motor', 5, motorGroup, -1.3, 0);
  registerPart('fins', 'Stabilizing Fins (x4)', 'Aerodynamic Empennage', 6, finsGroup, -0.6, 0.45);

  // Smooth explosion kinematics updater
  const updateExplosion = (progress: number) => {
    const ease = 1 - Math.pow(1 - progress, 3);

    parts.forEach((part) => {
      // Axial separation along Y
      part.group.position.y = part.initialY + part.explodedDeltaY * ease;

      // Radial displacement for stabilizing fins
      if (part.id === 'fins' && part.explodedRadialDelta) {
        const radDist = part.explodedRadialDelta * ease;
        for (let i = 0; i < finMeshes.length; i++) {
          const angle = (i * Math.PI) / 2;
          const baseFinX = Math.cos(angle) * outerRadius;
          const baseFinZ = Math.sin(angle) * outerRadius;

          finMeshes[i].position.x = baseFinX + Math.cos(angle) * radDist;
          finMeshes[i].position.z = baseFinZ + Math.sin(angle) * radDist;
        }
      }
    });
  };

  // Glowing neon cyan edge contour material for selected part
  const edgeGlowMat = new THREE.LineBasicMaterial({
    color: 0x00f0ff,
    transparent: true,
    opacity: 0.95,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const activeHighlightLines: { line: THREE.LineSegments; parent: THREE.Mesh }[] = [];
  let currentHighlightedId: string | null = null;
  const originalEmissiveMap = new Map<THREE.MeshStandardMaterial, { color: number; intensity: number }>();

  const highlightPart = (partId: string | null) => {
    // 1. Remove previous edge lines
    activeHighlightLines.forEach(({ line, parent }) => {
      parent.remove(line);
      line.geometry.dispose();
    });
    activeHighlightLines.length = 0;

    // 2. Restore previous materials
    originalEmissiveMap.forEach((orig, mat) => {
      mat.emissive.setHex(orig.color);
      mat.emissiveIntensity = orig.intensity;
    });
    originalEmissiveMap.clear();

    currentHighlightedId = partId;
    if (!partId) return;

    const selectedPart = parts.get(partId);
    if (!selectedPart) return;

    // 3. Attach precision edge contours directly as children of each mesh
    selectedPart.meshes.forEach((mesh) => {
      if (mesh.material instanceof THREE.MeshStandardMaterial) {
        if (!originalEmissiveMap.has(mesh.material)) {
          originalEmissiveMap.set(mesh.material, {
            color: mesh.material.emissive.getHex(),
            intensity: mesh.material.emissiveIntensity,
          });
        }
        mesh.material.emissive.setHex(0x00384d);
        mesh.material.emissiveIntensity = 0.95;
      }

      try {
        const edgesGeo = new THREE.EdgesGeometry(mesh.geometry, 28);
        const edgeLines = new THREE.LineSegments(edgesGeo, edgeGlowMat);
        edgeLines.raycast = () => {};
        edgeLines.renderOrder = 10;
        mesh.add(edgeLines);
        activeHighlightLines.push({ line: edgeLines, parent: mesh });
      } catch (e) {
        // Fallback for non-manifold meshes
      }
    });
  };

  const updateHighlightAnimation = (time: number) => {
    const pulse = 0.75 + Math.sin(time * 3.5) * 0.22;
    edgeGlowMat.opacity = pulse;

    if (currentHighlightedId) {
      originalEmissiveMap.forEach((_, mat) => {
        mat.emissiveIntensity = 0.70 + Math.sin(time * 3.5) * 0.30;
      });
    }
  };

  const setWireframe = (enabled: boolean) => {
    rootGroup.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => {
            if (m && 'wireframe' in m) {
              (m as THREE.MeshStandardMaterial).wireframe = enabled;
            }
          });
        } else if (obj.material && 'wireframe' in obj.material) {
          (obj.material as THREE.MeshStandardMaterial).wireframe = enabled;
        }
      }
    });
  };

  const dispose = () => {
    highlightPart(null);
    edgeGlowMat.dispose();
    rootGroup.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
      }
    });
  };

  return {
    rootGroup,
    parts,
    materials,
    updateExplosion,
    highlightPart,
    updateHighlightAnimation,
    setWireframe,
    dispose,
  };
}
