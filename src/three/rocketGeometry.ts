import * as THREE from 'three';
import { createRocketMaterials } from './proceduralMaterials';

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
 * Creates the complete 3D sounding rocket model with 8 stacked components.
 */
export function buildRocketModel(): BuiltRocketModel {
  const materials = createRocketMaterials();
  const rootGroup = new THREE.Group();
  rootGroup.name = 'LAGARAM-1 Root';

  const parts = new Map<string, RocketPartGroup>();
  const radius = 0.45; // Base radius of rocket airframe cylinder (0.9m dia scaled)

  // Highlight material (safety orange glowing rim / emissive)
  const highlightMat = new THREE.MeshStandardMaterial({
    color: 0xff6224,
    emissive: 0xaa3300,
    emissiveIntensity: 0.6,
    metalness: 0.8,
    roughness: 0.25,
  });

  // ----------------------------------------------------
  const motorRadius = radius * (98 / 102); // 0.432: 98 mm OD relative to 102 mm airframe
  const throatR = 0.16;
  const exitR = 0.285;

  // ----------------------------------------------------
  // 1. NOZZLE (Lathe-turned stainless steel conical bell)
  // Flows continuously from converging section above it
  // ----------------------------------------------------
  const nozzleGroup = new THREE.Group();
  nozzleGroup.name = 'nozzle';

  // Construct watertight conical supersonic nozzle with hollow cavity and throat insert
  const nozzlePoints: THREE.Vector2[] = [];
  // Y coordinates relative to assembled rocket space (spans from Y = -1.45 down to -1.93)
  const nTopY = -1.45;
  const nBottomY = -1.93;
  const nThroatR = throatR;
  const nExitR = exitR;

  // Outer profile from throat down to exit rim
  nozzlePoints.push(new THREE.Vector2(nThroatR + 0.016, nTopY));            // Top retention collar
  nozzlePoints.push(new THREE.Vector2(nThroatR + 0.016, nTopY - 0.025));    // Collar shoulder
  nozzlePoints.push(new THREE.Vector2(nThroatR, nTopY - 0.035));            // Outer throat junction
  nozzlePoints.push(new THREE.Vector2(nExitR, nBottomY + 0.015));           // Conical expansion bell
  nozzlePoints.push(new THREE.Vector2(nExitR + 0.008, nBottomY));           // Outer exit lip
  nozzlePoints.push(new THREE.Vector2(nExitR - 0.022, nBottomY));           // Exit lip rim bottom
  // Inner hollow cavity from exit back up to throat
  nozzlePoints.push(new THREE.Vector2(nExitR - 0.024, nBottomY + 0.02));    // Inner bell exit
  nozzlePoints.push(new THREE.Vector2(nThroatR - 0.024, nTopY - 0.035));    // Inner throat core
  nozzlePoints.push(new THREE.Vector2(nThroatR - 0.024, nTopY));            // Inner top bore
  nozzlePoints.push(new THREE.Vector2(nThroatR + 0.016, nTopY));            // Close loop

  const nozzleGeo = new THREE.LatheGeometry(nozzlePoints, 64);
  nozzleGeo.computeVertexNormals();
  const nozzleMesh = new THREE.Mesh(nozzleGeo, materials.nozzleMaterial);
  nozzleMesh.castShadow = true;
  nozzleMesh.receiveShadow = true;
  nozzleMesh.userData = { partId: 'nozzle' };

  // High-density isostatic graphite throat insert sleeve inside the expansion throat
  const graphiteThroatGeo = new THREE.CylinderGeometry(nThroatR - 0.023, nThroatR - 0.023, 0.065, 32, 1, true);
  const graphiteThroat = new THREE.Mesh(graphiteThroatGeo, materials.graphiteThroatMaterial);
  graphiteThroat.position.y = nTopY - 0.035;
  graphiteThroat.userData = { partId: 'nozzle' };

  // Exterior CNC machined lip band at bottom exit rim
  const exitLipGeo = new THREE.TorusGeometry(nExitR + 0.004, 0.006, 12, 64);
  exitLipGeo.rotateX(Math.PI / 2);
  const exitLipMesh = new THREE.Mesh(exitLipGeo, materials.nozzleMaterial);
  exitLipMesh.position.y = nBottomY + 0.006;
  exitLipMesh.userData = { partId: 'nozzle' };

  // Fine CNC lathe-turned detail grooves around nozzle bell
  const bellRingGeo1 = new THREE.TorusGeometry(0.20, 0.005, 10, 48);
  bellRingGeo1.rotateX(Math.PI / 2);
  const bellRing1 = new THREE.Mesh(bellRingGeo1, materials.nozzleMaterial);
  bellRing1.position.y = nTopY - 0.15;
  bellRing1.userData = { partId: 'nozzle' };

  const bellRingGeo2 = new THREE.TorusGeometry(0.25, 0.005, 10, 48);
  bellRingGeo2.rotateX(Math.PI / 2);
  const bellRing2 = new THREE.Mesh(bellRingGeo2, materials.nozzleMaterial);
  bellRing2.position.y = nTopY - 0.32;
  bellRing2.userData = { partId: 'nozzle' };

  nozzleGroup.add(nozzleMesh, graphiteThroat, exitLipMesh, bellRing1, bellRing2);
  rootGroup.add(nozzleGroup);

  // ----------------------------------------------------
  // 2. MOTOR CASING (Machined Stainless Steel Motor Chamber)
  // Rebuilt per hardware reference: Flange + Bolt Circle +
  // Protruding Fittings + Cylindrical Body + Tapered Cone
  // ----------------------------------------------------
  const motorGroup = new THREE.Group();
  motorGroup.name = 'motor-casing';

  // 2a. Main Straight Cylindrical Chamber Wall (98 mm OD, 4 mm wall spec)
  // Spans from Y = -1.05 to +0.435 (length = 1.485)
  const cylLength = 1.485;
  const cylCenterY = (-1.05 + 0.435) / 2; // -0.3075
  const motorCylinderGeo = new THREE.CylinderGeometry(motorRadius, motorRadius, cylLength, 64, 16);
  const motorMesh = new THREE.Mesh(motorCylinderGeo, materials.motorCasingMaterial);
  motorMesh.castShadow = true;
  motorMesh.receiveShadow = true;
  motorMesh.userData = { partId: 'motor-casing' };
  motorMesh.position.y = cylCenterY;

  // Fine CNC lathe turning grooves across cylindrical casing body
  const casingRingOffsets = [-0.85, -0.55, -0.25, 0.05, 0.35];
  const casingRings: THREE.Mesh[] = [];
  casingRingOffsets.forEach((ry) => {
    const rGeo = new THREE.TorusGeometry(motorRadius + 0.003, 0.005, 10, 64);
    rGeo.rotateX(Math.PI / 2);
    const rMesh = new THREE.Mesh(rGeo, materials.motorCasingMaterial);
    rMesh.position.y = ry;
    rMesh.userData = { partId: 'motor-casing' };
    casingRings.push(rMesh);
  });

  // 2b. Tapered Converging Section (Conical taper from 98 mm OD down to throat)
  // Spans from Y = -1.05 down to Y = -1.45 (height = 0.40)
  const convHeight = 0.40;
  const convCenterY = -1.25;
  const convergingGeo = new THREE.CylinderGeometry(motorRadius, throatR, convHeight, 64, 8);
  const convergingMesh = new THREE.Mesh(convergingGeo, materials.motorCasingMaterial);
  convergingMesh.castShadow = true;
  convergingMesh.receiveShadow = true;
  convergingMesh.userData = { partId: 'motor-casing' };
  convergingMesh.position.y = convCenterY;

  // Throat mating collar at base of converging section (Y = -1.438)
  const throatCollarGeo = new THREE.CylinderGeometry(throatR + 0.016, throatR + 0.016, 0.026, 64);
  const throatCollar = new THREE.Mesh(throatCollarGeo, materials.motorCasingMaterial);
  throatCollar.position.y = -1.438;
  throatCollar.userData = { partId: 'motor-casing' };

  // 2c. Top Flange (Stepped circular flange cap at the top of casing body)
  // Spans from Y = +0.435 to +0.505 (flange top face at +0.505)
  const lowerFlangeGeo = new THREE.CylinderGeometry(motorRadius * 1.07, motorRadius * 1.07, 0.026, 64);
  const lowerFlange = new THREE.Mesh(lowerFlangeGeo, materials.motorCasingMaterial);
  lowerFlange.position.y = 0.448;
  lowerFlange.userData = { partId: 'motor-casing' };

  // Clamping groove indentation between flange tiers
  const grooveGeo = new THREE.CylinderGeometry(motorRadius * 1.03, motorRadius * 1.03, 0.008, 64);
  const grooveMesh = new THREE.Mesh(grooveGeo, materials.motorCasingMaterial);
  grooveMesh.position.y = 0.465;
  grooveMesh.userData = { partId: 'motor-casing' };

  // Upper heavy clamping flange disc
  const upperFlangeGeo = new THREE.CylinderGeometry(motorRadius * 1.16, motorRadius * 1.16, 0.038, 64);
  const upperFlange = new THREE.Mesh(upperFlangeGeo, materials.motorCasingMaterial);
  upperFlange.position.y = 0.486;
  upperFlange.userData = { partId: 'motor-casing' };

  // Flange top plate with chamfered rim
  const topPlateGeo = new THREE.CylinderGeometry(motorRadius * 1.14, motorRadius * 1.16, 0.010, 64);
  const topPlate = new THREE.Mesh(topPlateGeo, materials.motorCasingMaterial);
  topPlate.position.y = 0.505;
  topPlate.userData = { partId: 'motor-casing' };

  // 2d. Visible Bolt-Circle Pattern on Top Flange (8 precision hex bolt heads & washers)
  const boltCircleRadius = motorRadius * 1.06; // ~0.458
  const flangeBolts: THREE.Mesh[] = [];
  const boltHeadGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.022, 6);
  const washerGeo = new THREE.CylinderGeometry(0.020, 0.020, 0.005, 16);

  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4;
    const bx = Math.cos(angle) * boltCircleRadius;
    const bz = Math.sin(angle) * boltCircleRadius;

    // Hex bolt head
    const bMesh = new THREE.Mesh(boltHeadGeo, materials.boltSteelMaterial);
    bMesh.position.set(bx, 0.521, bz);
    bMesh.rotation.y = angle + Math.PI / 6;
    bMesh.userData = { partId: 'motor-casing' };
    flangeBolts.push(bMesh);

    // Washer disc
    const wMesh = new THREE.Mesh(washerGeo, materials.boltSteelMaterial);
    wMesh.position.set(bx, 0.5075, bz);
    wMesh.userData = { partId: 'motor-casing' };
    flangeBolts.push(wMesh);
  }

  // 2e. Top-Mounted Fittings Protruding Upward (Asymmetric & Greebled)
  // Fitting 1: Igniter / Spark-Plug-Style Fitting (Off-center at angle 45°)
  const igniterGroup = new THREE.Group();
  const igniterX = 0.16;
  const igniterZ = 0.16;
  igniterGroup.position.set(igniterX, 0, igniterZ);

  // Hex base adapter
  const igniterBaseGeo = new THREE.CylinderGeometry(0.024, 0.024, 0.032, 6);
  const igniterBase = new THREE.Mesh(igniterBaseGeo, materials.fittingGunmetalMaterial);
  igniterBase.position.y = 0.521;
  igniterBase.userData = { partId: 'motor-casing' };

  // Blue-anodized collar ring
  const igniterCollarGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.012, 24);
  const igniterCollar = new THREE.Mesh(igniterCollarGeo, materials.fittingBlueAnodizedMaterial);
  igniterCollar.position.y = 0.543;
  igniterCollar.userData = { partId: 'motor-casing' };

  // Brass locking washer ring
  const igniterBrassGeo = new THREE.CylinderGeometry(0.021, 0.021, 0.006, 24);
  const igniterBrass = new THREE.Mesh(igniterBrassGeo, materials.fittingBrassMaterial);
  igniterBrass.position.y = 0.552;
  igniterBrass.userData = { partId: 'motor-casing' };

  // Spark plug hex body
  const igniterHexGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.038, 6);
  const igniterHex = new THREE.Mesh(igniterHexGeo, materials.fittingGunmetalMaterial);
  igniterHex.position.y = 0.573;
  igniterHex.userData = { partId: 'motor-casing' };

  // White ceramic ribbed insulator stem
  const igniterCeramicGeo = new THREE.CylinderGeometry(0.010, 0.010, 0.065, 16);
  const igniterCeramic = new THREE.Mesh(igniterCeramicGeo, materials.sparkPlugCeramicMaterial);
  igniterCeramic.position.y = 0.624;
  igniterCeramic.userData = { partId: 'motor-casing' };

  // 3 ceramic insulator ribs
  const ribGeo = new THREE.TorusGeometry(0.012, 0.0028, 8, 16);
  ribGeo.rotateX(Math.PI / 2);
  const ribYOffsets = [0.608, 0.624, 0.640];
  const ceramicRibs: THREE.Mesh[] = [];
  ribYOffsets.forEach((ry) => {
    const rMesh = new THREE.Mesh(ribGeo, materials.sparkPlugCeramicMaterial);
    rMesh.position.y = ry;
    rMesh.userData = { partId: 'motor-casing' };
    ceramicRibs.push(rMesh);
  });

  // Electrode terminal pin
  const electrodeGeo = new THREE.CylinderGeometry(0.004, 0.004, 0.026, 12);
  const electrode = new THREE.Mesh(electrodeGeo, materials.boltSteelMaterial);
  electrode.position.y = 0.669;
  electrode.userData = { partId: 'motor-casing' };

  igniterGroup.add(igniterBase, igniterCollar, igniterBrass, igniterHex, igniterCeramic, ...ceramicRibs, electrode);

  // Fitting 2: Right-Angle Pneumatic / Valve Elbow (Off-center at angle ~193°)
  const valveGroup = new THREE.Group();
  const valveX = -0.21;
  const valveZ = -0.05;
  valveGroup.position.set(valveX, 0, valveZ);

  // Hex adapter base
  const valveBaseGeo = new THREE.CylinderGeometry(0.024, 0.024, 0.028, 6);
  const valveBase = new THREE.Mesh(valveBaseGeo, materials.fittingGunmetalMaterial);
  valveBase.position.y = 0.519;
  valveBase.userData = { partId: 'motor-casing' };

  // Blue anodized compression collar
  const valveCollarGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.012, 24);
  const valveCollar = new THREE.Mesh(valveCollarGeo, materials.fittingBlueAnodizedMaterial);
  valveCollar.position.y = 0.539;
  valveCollar.userData = { partId: 'motor-casing' };

  // Compact L-shaped elbow block body
  const elbowBlockGeo = new THREE.BoxGeometry(0.038, 0.038, 0.038);
  const elbowBlock = new THREE.Mesh(elbowBlockGeo, materials.fittingGunmetalMaterial);
  elbowBlock.position.y = 0.564;
  elbowBlock.userData = { partId: 'motor-casing' };

  // Horizontal valve stem extending outward 90 degrees along -X
  const valveStemGeo = new THREE.CylinderGeometry(0.013, 0.013, 0.048, 16);
  valveStemGeo.rotateZ(Math.PI / 2);
  const valveStem = new THREE.Mesh(valveStemGeo, materials.boltSteelMaterial);
  valveStem.position.set(-0.024, 0.564, 0);
  valveStem.userData = { partId: 'motor-casing' };

  // Blue-anodized hex retention nut on horizontal fitting
  const valveNutGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.014, 6);
  valveNutGeo.rotateZ(Math.PI / 2);
  const valveNut = new THREE.Mesh(valveNutGeo, materials.fittingBlueAnodizedMaterial);
  valveNut.position.set(-0.032, 0.564, 0);
  valveNut.userData = { partId: 'motor-casing' };

  // Brass quick-disconnect nipple barb
  const valveNippleGeo = new THREE.CylinderGeometry(0.009, 0.013, 0.022, 16);
  valveNippleGeo.rotateZ(Math.PI / 2);
  const valveNipple = new THREE.Mesh(valveNippleGeo, materials.fittingBrassMaterial);
  valveNipple.position.set(-0.054, 0.564, 0);
  valveNipple.userData = { partId: 'motor-casing' };

  valveGroup.add(valveBase, valveCollar, elbowBlock, valveStem, valveNut, valveNipple);

  motorGroup.add(
    motorMesh,
    ...casingRings,
    convergingMesh,
    throatCollar,
    lowerFlange,
    grooveMesh,
    upperFlange,
    topPlate,
    ...flangeBolts,
    igniterGroup,
    valveGroup
  );
  rootGroup.add(motorGroup);

  // ----------------------------------------------------
  // 6. LOOSE HARDWARE PROPS AT LAUNCH DECK BASE (Hex Bolts & Nut)
  // Matches foreground reference hardware on test stand surface
  // ----------------------------------------------------
  const hardwarePropsGroup = new THREE.Group();
  hardwarePropsGroup.name = 'HardwareProps';

  // Loose Bolt 1 (horizontal M12 hex bolt with washer lying on grid floor)
  const propBolt1Group = new THREE.Group();
  propBolt1Group.position.set(0.96, -2.32, 0.54);
  propBolt1Group.rotation.y = 0.45;

  const prop1HeadGeo = new THREE.CylinderGeometry(0.026, 0.026, 0.032, 6);
  prop1HeadGeo.rotateX(Math.PI / 2);
  const prop1Head = new THREE.Mesh(prop1HeadGeo, materials.boltSteelMaterial);
  prop1Head.castShadow = true;

  const prop1WasherGeo = new THREE.CylinderGeometry(0.034, 0.034, 0.008, 16);
  prop1WasherGeo.rotateX(Math.PI / 2);
  const prop1Washer = new THREE.Mesh(prop1WasherGeo, materials.boltSteelMaterial);
  prop1Washer.position.z = 0.020;
  prop1Washer.castShadow = true;

  const prop1ShankGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.13, 16);
  prop1ShankGeo.rotateX(Math.PI / 2);
  const prop1Shank = new THREE.Mesh(prop1ShankGeo, materials.boltSteelMaterial);
  prop1Shank.position.z = 0.088;
  prop1Shank.castShadow = true;

  propBolt1Group.add(prop1Head, prop1Washer, prop1Shank);

  // Loose Bolt 2 (tilted hex bolt standing on washer)
  const propBolt2Group = new THREE.Group();
  propBolt2Group.position.set(1.14, -2.315, 0.46);
  propBolt2Group.rotation.set(0.12, 0.8, -0.08);

  const prop2Head = new THREE.Mesh(
    new THREE.CylinderGeometry(0.022, 0.022, 0.026, 6),
    materials.boltSteelMaterial
  );
  prop2Head.position.y = 0.045;
  prop2Head.castShadow = true;

  const prop2Washer = new THREE.Mesh(
    new THREE.CylinderGeometry(0.030, 0.030, 0.007, 16),
    materials.boltSteelMaterial
  );
  prop2Washer.position.y = 0.029;
  prop2Washer.castShadow = true;

  const prop2Stud = new THREE.Mesh(
    new THREE.CylinderGeometry(0.014, 0.014, 0.060, 16),
    materials.boltSteelMaterial
  );
  prop2Stud.position.y = -0.004;
  prop2Stud.castShadow = true;

  propBolt2Group.add(prop2Head, prop2Washer, prop2Stud);

  // Loose Hex Nut (precision machined nut lying flat on floor grid)
  const propNutGroup = new THREE.Group();
  propNutGroup.position.set(1.05, -2.338, 0.69);
  propNutGroup.rotation.y = 0.35;

  const nutOuterGeo = new THREE.CylinderGeometry(0.028, 0.028, 0.022, 6);
  const propNutMesh = new THREE.Mesh(nutOuterGeo, materials.boltSteelMaterial);
  propNutMesh.castShadow = true;

  // Dark hollow threaded center bore
  const nutBoreGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.023, 16);
  const nutBoreMesh = new THREE.Mesh(nutBoreGeo, materials.fittingGunmetalMaterial);

  propNutGroup.add(propNutMesh, nutBoreMesh);
  hardwarePropsGroup.add(propBolt1Group, propBolt2Group, propNutGroup);
  rootGroup.add(hardwarePropsGroup);

  // ----------------------------------------------------
  // 3. FOUR FINS (Symmetrically mounted, trapezoidal, beveled G10 fiberglass)
  // ----------------------------------------------------
  const finsGroup = new THREE.Group();
  finsGroup.name = 'fins';

  // Base pre-scale dimensions: root chord 170 mm, tip chord 62 mm, semi-span 85 mm
  // Scaled up by ~18% (15-20%) for prominent aerodynamic empennage structure
  const finScale = 1.18;
  const baseRootChord = 0.75;
  const baseTipChord = 0.32;
  const baseSpan = 0.42;

  const rootChord = baseRootChord * finScale; // ~0.885
  const tipChord = baseTipChord * finScale;   // ~0.378
  const semiSpan = baseSpan * finScale;       // ~0.496
  const sweep = 0.467;                        // Supersonic leading edge sweep
  const tipLeadingY = rootChord - sweep;      // 0.418
  const tipTrailingY = tipLeadingY - tipChord; // 0.040

  // Construct precision trapezoidal supersonic fin geometry in local space:
  // X = radial span (0 = root edge tangent to casing, +X = extending outward to tip)
  // Y = axial rocket length (0 = root trailing edge, rootChord = root leading edge)
  const finShape = new THREE.Shape();
  finShape.moveTo(0, 0);                        // Root trailing edge (tangent to casing)
  finShape.lineTo(0, rootChord);                // Root leading edge (tangent to casing)
  finShape.lineTo(semiSpan, tipLeadingY);       // Tip leading edge
  finShape.lineTo(semiSpan, tipTrailingY);      // Tip trailing edge
  finShape.closePath();

  const finThickness = 0.022; // Proportional thickness
  const bevelSize = 0.005;
  const finExtrudeSettings = {
    steps: 1,
    depth: finThickness,
    bevelEnabled: true,
    bevelThickness: bevelSize,
    bevelSize: bevelSize,
    bevelOffset: -bevelSize, // Offsets bevel inward so the root edge stays strictly at X >= 0
    bevelSegments: 3,
  };

  const finGeo = new THREE.ExtrudeGeometry(finShape, finExtrudeSettings);
  finGeo.computeBoundingBox();
  const minX = finGeo.boundingBox!.min.x;
  const minY = finGeo.boundingBox!.min.y;
  const midZ = (finGeo.boundingBox!.min.z + finGeo.boundingBox!.max.z) / 2;
  // Translate so:
  // - Root chord edge is precisely at X = 0.000 (no geometry can ever clip inside)
  // - Root trailing edge is at Y = 0.000
  // - Extrusion thickness is centered symmetrically at Z = 0
  finGeo.translate(-minX, -minY, -midZ);
  finGeo.computeVertexNormals();

  // Root mounting bracket / retention saddle bonded flush onto casing outer wall
  const bracketRadialWidth = 0.016;
  const bracketLength = rootChord * 0.92;
  const bracketThickness = finThickness * 1.6;
  const bracketGeo = new THREE.BoxGeometry(bracketRadialWidth, bracketLength, bracketThickness);
  // Position bracket so inner face is precisely at X = 0 (flush against casing outer wall)
  bracketGeo.translate(bracketRadialWidth / 2, rootChord / 2, 0);
  bracketGeo.computeVertexNormals();

  // Standoff of fraction of millimeter in model-space to eliminate any z-fighting with casing mesh
  const finStandoff = 0.003;
  const finMountRadius = motorRadius + finStandoff; // 0.432 + 0.003 = 0.435 (flush to 98mm OD casing)
  const finBaseY = -1.04; // Mounted on aft straight cylindrical casing section above converging taper

  const finMeshes: THREE.Mesh[] = [];
  const finMountBrackets: THREE.Mesh[] = [];

  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 2;
    const finMesh = new THREE.Mesh(finGeo, materials.finMaterial);
    finMesh.castShadow = true;
    finMesh.receiveShadow = true;
    finMesh.userData = { partId: 'fins' };

    // Radial position on casing outer wall:
    const posX = Math.cos(angle) * finMountRadius;
    const posZ = Math.sin(angle) * finMountRadius;
    const posY = finBaseY;

    finMesh.position.set(posX, posY, posZ);
    // Rotate so local +X points radially outward along (cos(angle), sin(angle))
    finMesh.rotation.set(0, -angle, 0);

    // Root attachment bracket / retention saddle
    const bracketMesh = new THREE.Mesh(bracketGeo, materials.finMaterial);
    bracketMesh.castShadow = true;
    bracketMesh.receiveShadow = true;
    bracketMesh.position.set(posX, posY, posZ);
    bracketMesh.rotation.set(0, -angle, 0);
    bracketMesh.userData = { partId: 'fins' };

    finMeshes.push(finMesh);
    finMountBrackets.push(bracketMesh);
    finsGroup.add(finMesh, bracketMesh);
  }

  rootGroup.add(finsGroup);

  // ----------------------------------------------------
  // 4. BULKHEAD 1 (Interstage, thin stainless steel disc)
  // ----------------------------------------------------
  const bulkheadLowerGroup = new THREE.Group();
  bulkheadLowerGroup.name = 'bulkhead-lower';

  const bhThickness = 0.05;
  const bhDiscGeo = new THREE.CylinderGeometry(radius + 0.012, radius + 0.012, bhThickness, 64);
  const bhLowerMesh = new THREE.Mesh(bhDiscGeo, materials.bulkheadMaterial);
  bhLowerMesh.castShadow = true;
  bhLowerMesh.receiveShadow = true;
  bhLowerMesh.userData = { partId: 'bulkhead-lower' };
  bhLowerMesh.position.y = 0.525;

  // Subtle perimeter seal ring & bolt circle indentation
  const sealRingGeo = new THREE.TorusGeometry(radius - 0.03, 0.008, 12, 48);
  sealRingGeo.rotateX(Math.PI / 2);
  const sealRingMesh1 = new THREE.Mesh(sealRingGeo, materials.bulkheadMaterial);
  sealRingMesh1.position.y = 0.525 + bhThickness / 2 + 0.004;
  sealRingMesh1.userData = { partId: 'bulkhead-lower' };

  bulkheadLowerGroup.add(bhLowerMesh, sealRingMesh1);
  rootGroup.add(bulkheadLowerGroup);

  // ----------------------------------------------------
  // 5. RECOVERY SECTION (Cylindrical bay, lighter composite/alum)
  // ----------------------------------------------------
  const recoveryGroup = new THREE.Group();
  recoveryGroup.name = 'recovery-bay';

  const recoveryLength = 1.08;
  const recoveryGeo = new THREE.CylinderGeometry(radius, radius, recoveryLength, 64, 8);
  const recoveryMesh = new THREE.Mesh(recoveryGeo, materials.recoveryMaterial);
  recoveryMesh.castShadow = true;
  recoveryMesh.receiveShadow = true;
  recoveryMesh.userData = { partId: 'recovery-bay' };
  recoveryMesh.position.y = 0.55 + recoveryLength / 2; // Center at Y = 1.09

  // Joint rings at ends
  const jointGeo1 = new THREE.TorusGeometry(radius + 0.004, 0.006, 12, 64);
  jointGeo1.rotateX(Math.PI / 2);
  const jointMesh1 = new THREE.Mesh(jointGeo1, materials.bulkheadMaterial);
  jointMesh1.position.y = 0.58;
  jointMesh1.userData = { partId: 'recovery-bay' };

  const jointMesh2 = new THREE.Mesh(jointGeo1, materials.bulkheadMaterial);
  jointMesh2.position.y = 0.55 + recoveryLength - 0.03;
  jointMesh2.userData = { partId: 'recovery-bay' };

  // Static vent port holes (3 holes at 120 deg)
  const portMeshes: THREE.Mesh[] = [];
  for (let i = 0; i < 3; i++) {
    const pAng = (i * Math.PI * 2) / 3;
    const portGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.02, 16);
    portGeo.rotateZ(Math.PI / 2);
    const port = new THREE.Mesh(portGeo, materials.bulkheadMaterial);
    port.position.set(Math.cos(pAng) * (radius + 0.004), 1.15, Math.sin(pAng) * (radius + 0.004));
    port.rotation.y = -pAng;
    port.userData = { partId: 'recovery-bay' };
    portMeshes.push(port);
  }

  recoveryGroup.add(recoveryMesh, jointMesh1, jointMesh2, ...portMeshes);
  rootGroup.add(recoveryGroup);

  // ----------------------------------------------------
  // 6. BULKHEAD 2 (Avionics, second thin stainless steel disc)
  // ----------------------------------------------------
  const bulkheadUpperGroup = new THREE.Group();
  bulkheadUpperGroup.name = 'bulkhead-upper';

  const bhUpperMesh = new THREE.Mesh(bhDiscGeo, materials.bulkheadMaterial);
  bhUpperMesh.castShadow = true;
  bhUpperMesh.receiveShadow = true;
  bhUpperMesh.userData = { partId: 'bulkhead-upper' };
  bhUpperMesh.position.y = 1.66;

  const sealRingMesh2 = new THREE.Mesh(sealRingGeo, materials.bulkheadMaterial);
  sealRingMesh2.position.y = 1.66 + bhThickness / 2 + 0.004;
  sealRingMesh2.userData = { partId: 'bulkhead-upper' };

  bulkheadUpperGroup.add(bhUpperMesh, sealRingMesh2);
  rootGroup.add(bulkheadUpperGroup);

  // ----------------------------------------------------
  // 7. PAYLOAD BAY (Electronics bay, polished stainless steel)
  // ----------------------------------------------------
  const payloadGroup = new THREE.Group();
  payloadGroup.name = 'payload-bay';

  const payloadLength = 1.1;
  const payloadGeo = new THREE.CylinderGeometry(radius, radius, payloadLength, 64, 8);
  const payloadMesh = new THREE.Mesh(payloadGeo, materials.payloadMaterial);
  payloadMesh.castShadow = true;
  payloadMesh.receiveShadow = true;
  payloadMesh.userData = { partId: 'payload-bay' };
  payloadMesh.position.y = 1.69 + payloadLength / 2; // Center at Y = 2.24

  // Access hatch outline (flush panel on one side)
  const hatchGeo = new THREE.BoxGeometry(0.015, 0.38, 0.22);
  const hatchMesh = new THREE.Mesh(hatchGeo, materials.bulkheadMaterial);
  hatchMesh.position.set(radius + 0.002, 2.24, 0);
  hatchMesh.userData = { partId: 'payload-bay' };

  // Payload section split groove
  const payloadRingGeo = new THREE.TorusGeometry(radius + 0.004, 0.006, 12, 64);
  payloadRingGeo.rotateX(Math.PI / 2);
  const payloadRingMesh = new THREE.Mesh(payloadRingGeo, materials.bulkheadMaterial);
  payloadRingMesh.position.y = 2.76;
  payloadRingMesh.userData = { partId: 'payload-bay' };

  payloadGroup.add(payloadMesh, hatchMesh, payloadRingMesh);
  rootGroup.add(payloadGroup);

  // ----------------------------------------------------
  // 8. NOSE CONE (Smooth aerodynamic von Kármán cone, off-white composite)
  // ----------------------------------------------------
  const noseGroup = new THREE.Group();
  noseGroup.name = 'nose-cone';

  // Generate von Kármán / LD-Haack ogive curve
  const nosePoints: THREE.Vector2[] = [];
  const noseLength = 1.45;
  const noseSteps = 48;

  // Tangent ogive aerodynamic profile
  for (let i = 0; i <= noseSteps; i++) {
    const t = i / noseSteps; // 0 (tip) to 1 (base)
    const y = (1.0 - t) * noseLength; // Tip at noseLength, base at 0

    // Haack / Von Kármán series radius formula
    const theta = Math.acos(1 - 2 * t);
    const r = (radius / Math.sqrt(Math.PI)) * Math.sqrt(theta - (Math.sin(2 * theta) / 2));
    nosePoints.push(new THREE.Vector2(Math.max(0.002, r), y));
  }

  // Base cap / shoulder
  nosePoints.push(new THREE.Vector2(0, 0));

  const noseGeo = new THREE.LatheGeometry(nosePoints, 64);
  noseGeo.computeVertexNormals();
  const noseMesh = new THREE.Mesh(noseGeo, materials.noseConeMaterial);
  noseMesh.castShadow = true;
  noseMesh.receiveShadow = true;
  noseMesh.userData = { partId: 'nose-cone' };
  noseMesh.position.y = 2.79; // Sits directly atop payload bay

  // Machined stainless steel pitot probe tip
  const pitotTipGeo = new THREE.CylinderGeometry(0.012, 0.024, 0.16, 24);
  const pitotTipMesh = new THREE.Mesh(pitotTipGeo, materials.pitotTipMaterial);
  pitotTipMesh.castShadow = true;
  pitotTipMesh.position.y = 2.79 + noseLength + 0.08;
  pitotTipMesh.userData = { partId: 'nose-cone' };

  // Pitot needle extension
  const needleGeo = new THREE.CylinderGeometry(0.004, 0.004, 0.08, 12);
  const needleMesh = new THREE.Mesh(needleGeo, materials.pitotTipMaterial);
  needleMesh.position.y = 2.79 + noseLength + 0.16 + 0.04;
  needleMesh.userData = { partId: 'nose-cone' };

  noseGroup.add(noseMesh, pitotTipMesh, needleMesh);
  rootGroup.add(noseGroup);

  // ----------------------------------------------------
  // REGISTER PART GROUPS & CACHE FOR INTERACTION
  // ----------------------------------------------------
  const registerPart = (
    id: string,
    name: string,
    assembly: string,
    order: number,
    group: THREE.Group,
    explodedDeltaY: number,
    explodedRadialDelta: number = 0
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

  registerPart('nozzle', 'Exhaust Nozzle', 'Engine / Motor Assembly', 1, nozzleGroup, -1.1, 0);
  registerPart('motor-casing', 'Motor Casing', 'Engine / Motor Assembly', 2, motorGroup, -0.5, 0);
  registerPart('fins', 'Stabilizing Fins (x4)', 'Aerodynamic Empennage', 3, finsGroup, -0.5, 0.95);
  registerPart('bulkhead-lower', 'Interstage Bulkhead', 'Structural Isolation', 4, bulkheadLowerGroup, 0.15, 0);
  registerPart('recovery-bay', 'Recovery Section', 'Recovery Subsystem', 5, recoveryGroup, 1.0, 0);
  registerPart('bulkhead-upper', 'Avionics Bulkhead', 'Structural Isolation', 6, bulkheadUpperGroup, 1.85, 0);
  registerPart('payload-bay', 'Payload Bay', 'Avionics & Science Bay', 7, payloadGroup, 2.75, 0);
  registerPart('nose-cone', 'Nose Cone', 'Forward Aerodynamic Fairing', 8, noseGroup, 3.85, 0);

  // Smooth explosion updater
  const updateExplosion = (progress: number) => {
    // Easing curve for smooth mechanical motion
    const ease = 1 - Math.pow(1 - progress, 3);

    parts.forEach((part) => {
      // Y displacement
      part.group.position.y = part.initialY + part.explodedDeltaY * ease;

      // Special radial explosion for fins
      if (part.id === 'fins' && part.explodedRadialDelta) {
        const radDist = part.explodedRadialDelta * ease;
        for (let i = 0; i < finMeshes.length; i++) {
          const angle = (i * Math.PI) / 2;
          const baseFinX = Math.cos(angle) * finMountRadius;
          const baseFinZ = Math.sin(angle) * finMountRadius;

          finMeshes[i].position.x = baseFinX + Math.cos(angle) * radDist;
          finMeshes[i].position.z = baseFinZ + Math.sin(angle) * radDist;

          finMountBrackets[i].position.x = baseFinX + Math.cos(angle) * radDist;
          finMountBrackets[i].position.z = baseFinZ + Math.sin(angle) * radDist;
        }
      }
    });
  };

  // Glowing neon edge contour material for selected parts
  const edgeGlowMat = new THREE.LineBasicMaterial({
    color: 0x00f0ff,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  // Keep track of active highlight edge lines attached as children of meshes
  const activeHighlightLines: { line: THREE.LineSegments; parent: THREE.Mesh }[] = [];
  let currentHighlightedId: string | null = null;
  const originalEmissiveMap = new Map<THREE.MeshStandardMaterial, { color: number; intensity: number }>();

  // Highlighting selected part with precision neon CAD edge contours and emissive pulse
  const highlightPart = (partId: string | null) => {
    // 1. Remove and dispose previous edge lines
    activeHighlightLines.forEach(({ line, parent }) => {
      parent.remove(line);
      line.geometry.dispose();
    });
    activeHighlightLines.length = 0;

    // 2. Restore previous materials' emissive states
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
    // This ensures flawless inheritance of positions, rotations, and radial fin kinematics
    selectedPart.meshes.forEach((mesh) => {
      // Subtle glowing emissive enhancement on authentic materials
      if (mesh.material instanceof THREE.MeshStandardMaterial) {
        if (!originalEmissiveMap.has(mesh.material)) {
          originalEmissiveMap.set(mesh.material, {
            color: mesh.material.emissive.getHex(),
            intensity: mesh.material.emissiveIntensity,
          });
        }
        mesh.material.emissive.setHex(0x003348);
        mesh.material.emissiveIntensity = 0.85;
      }

      // High-precision holographic CAD edge contour lines attached directly to mesh
      try {
        const edgesGeo = new THREE.EdgesGeometry(mesh.geometry, 28);
        const edgeLines = new THREE.LineSegments(edgesGeo, edgeGlowMat);
        edgeLines.raycast = () => {}; // Never intercept raycasting clicks
        edgeLines.renderOrder = 10;
        mesh.add(edgeLines);
        activeHighlightLines.push({ line: edgeLines, parent: mesh });
      } catch (e) {
        // Fallback for non-manifold edge cases
      }
    });
  };

  // Animate glowing rim pulse in sync with render loop
  const updateHighlightAnimation = (time: number) => {
    const pulse = 0.72 + Math.sin(time * 3.5) * 0.25;
    edgeGlowMat.opacity = pulse;

    if (currentHighlightedId) {
      originalEmissiveMap.forEach((_, mat) => {
        mat.emissiveIntensity = 0.65 + Math.sin(time * 3.5) * 0.35;
      });
    }
  };

  // Wireframe toggle across all rocket parts and deck hardware
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
    highlightMat.dispose();
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
