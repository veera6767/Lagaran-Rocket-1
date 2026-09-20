import * as THREE from 'three';

/**
 * Generates an equirectangular studio lighting texture on an offscreen HTML canvas.
 * Contains softboxes, studio horizon gradients, key/rim light panels, and subtle floor bounce.
 */
export function createProceduralStudioTexture(): THREE.CanvasTexture {
  const width = 1024;
  const height = 512;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // 1. Studio backdrop gradient (dark charcoal floor, smooth industrial horizon)
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
  bgGrad.addColorStop(0.0, '#1a1f28'); // Overhead soft dome
  bgGrad.addColorStop(0.42, '#28313d'); // Upper studio wall
  bgGrad.addColorStop(0.50, '#354152'); // Horizon light strip
  bgGrad.addColorStop(0.58, '#1e242d'); // Lower horizon
  bgGrad.addColorStop(0.85, '#0d1014'); // Studio floor
  bgGrad.addColorStop(1.0, '#06080a'); // Directly down
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Main Key Light Softbox (Top-Left / Front, Warm-white 5600K)
  const keySoftbox = ctx.createRadialGradient(260, 160, 10, 260, 160, 180);
  keySoftbox.addColorStop(0, 'rgba(255, 252, 245, 1.0)');
  keySoftbox.addColorStop(0.3, 'rgba(240, 242, 248, 0.85)');
  keySoftbox.addColorStop(0.7, 'rgba(180, 195, 215, 0.35)');
  keySoftbox.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = keySoftbox;
  ctx.beginPath();
  ctx.ellipse(260, 160, 190, 100, -0.2, 0, Math.PI * 2);
  ctx.fill();

  // 3. Cool Rim / Edge Softbox (Top-Right / Behind, Crisp Aero Blue)
  const rimSoftbox = ctx.createRadialGradient(780, 180, 10, 780, 180, 160);
  rimSoftbox.addColorStop(0, 'rgba(215, 240, 255, 0.95)');
  rimSoftbox.addColorStop(0.4, 'rgba(140, 190, 230, 0.6)');
  rimSoftbox.addColorStop(0.8, 'rgba(70, 120, 170, 0.2)');
  rimSoftbox.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = rimSoftbox;
  ctx.beginPath();
  ctx.ellipse(780, 180, 160, 85, 0.15, 0, Math.PI * 2);
  ctx.fill();

  // 4. Overhead Linear Strip Softbox (Gives long, gorgeous cylindrical reflections on rocket tubes)
  const stripGrad = ctx.createLinearGradient(0, 50, 0, 120);
  stripGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
  stripGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.8)');
  stripGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = stripGrad;
  ctx.fillRect(100, 50, 824, 70);

  // 5. Secondary lower fill glow (prevents undersides from turning pitch black)
  const groundBounce = ctx.createLinearGradient(0, height * 0.7, 0, height);
  groundBounce.addColorStop(0, 'rgba(40, 55, 75, 0.0)');
  groundBounce.addColorStop(0.5, 'rgba(45, 60, 80, 0.15)');
  groundBounce.addColorStop(1, 'rgba(20, 25, 35, 0.0)');
  ctx.fillStyle = groundBounce;
  ctx.fillRect(0, height * 0.7, width, height * 0.3);

  const texture = new THREE.CanvasTexture(canvas);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Creates procedural PMREM environment map from the studio canvas
 */
export function generateProceduralEnvironmentMap(
  renderer: THREE.WebGLRenderer
): THREE.WebGLRenderTarget {
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();

  const studioTex = createProceduralStudioTexture();
  const envMap = pmremGenerator.fromEquirectangular(studioTex);

  studioTex.dispose();
  pmremGenerator.dispose();

  return envMap;
}

/**
 * Procedural brushed aluminium micro-texture.
 * Generates anisotropic lathe micro-grooves and brushed grain.
 */
export function createBrushedAluminiumBumpTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, size, size);

  // Draw fine horizontal micro-lines (lathe brushed grain)
  for (let y = 0; y < size; y++) {
    const val = 120 + Math.floor(Math.random() * 26);
    ctx.fillStyle = `rgb(${val},${val},${val})`;
    ctx.fillRect(0, y, size, 1);
  }

  // Overlay fine per-pixel noise
  const imgData = ctx.getImageData(0, 0, size, size);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 10;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
  }
  ctx.putImageData(imgData, 0, 0);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 16);
  tex.needsUpdate = true;
  return tex;
}

/**
 * Procedural 2x2 Twill Carbon Fibre texture.
 * Generates characteristic woven tow blocks with fiber striations and anisotropic sheen.
 * Calibrated for Carbon Fibre Grey (#8B939B) with glossy clear coat.
 */
export function createCarbonFiberTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Neutral mid-grey base tone
  ctx.fillStyle = '#8b939b';
  ctx.fillRect(0, 0, size, size);

  const tileSize = 32;

  for (let y = 0; y < size; y += tileSize) {
    for (let x = 0; x < size; x += tileSize) {
      // 2x2 twill pattern logic
      const isHorizontal = ((x / tileSize) % 2 === (y / tileSize) % 2);

      // Weave block base: alternating light and shadow tows for 2x2 twill
      const baseTone = isHorizontal ? 142 : 128;
      ctx.fillStyle = `rgb(${baseTone},${baseTone + 4},${baseTone + 8})`;
      ctx.fillRect(x, y, tileSize, tileSize);

      // Micro fiber strand lines within tow
      if (isHorizontal) {
        for (let py = 0; py < tileSize; py += 2) {
          const v = baseTone + Math.floor(Math.sin((py / tileSize) * Math.PI) * 20);
          ctx.fillStyle = `rgb(${v},${v + 3},${v + 6})`;
          ctx.fillRect(x, y + py, tileSize, 1.2);
        }
      } else {
        for (let px = 0; px < tileSize; px += 2) {
          const v = baseTone + Math.floor(Math.sin((px / tileSize) * Math.PI) * 20);
          ctx.fillStyle = `rgb(${v},${v + 3},${v + 6})`;
          ctx.fillRect(x + px, y, 1.2, tileSize);
        }
      }

      // Border shadow between tows
      ctx.strokeStyle = 'rgba(40, 48, 56, 0.45)';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, tileSize, tileSize);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(8, 8);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

/**
 * Procedural Filament-Wound Fiberglass Composite texture.
 * Generates natural aerospace translucent resin with criss-crossing winding filament tracks.
 */
export function createFiberglassTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Smooth composite base (creamy off-white / light translucent ivory)
  ctx.fillStyle = '#eee9dc';
  ctx.fillRect(0, 0, size, size);

  // Helical winding tracks (+55 deg angle)
  ctx.strokeStyle = 'rgba(215, 205, 185, 0.45)';
  ctx.lineWidth = 2.5;
  for (let offset = -size; offset < size * 2; offset += 14) {
    ctx.beginPath();
    ctx.moveTo(offset, 0);
    ctx.lineTo(offset + size * 1.4, size);
    ctx.stroke();
  }

  // Cross-helical winding tracks (-55 deg angle)
  ctx.strokeStyle = 'rgba(200, 190, 170, 0.35)';
  ctx.lineWidth = 2.0;
  for (let offset = -size; offset < size * 2; offset += 14) {
    ctx.beginPath();
    ctx.moveTo(offset, size);
    ctx.lineTo(offset + size * 1.4, 0);
    ctx.stroke();
  }

  // Subtle resin texture noise
  const imgData = ctx.getImageData(0, 0, size, size);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 8;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
  }
  ctx.putImageData(imgData, 0, 0);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 4);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

/**
 * Procedural texture for lathe-turned polished stainless steel motor casing & nozzle.
 * Generates fine circumferential CNC lathe turning marks, micro-feed grooves, and high-sheen metallic reflection.
 */
export function createLatheStainlessSteelTexture(): THREE.CanvasTexture {
  const width = 1024;
  const height = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Polished stainless steel bright silver metallic base
  ctx.fillStyle = '#dde2e9';
  ctx.fillRect(0, 0, width, height);

  // Micro circumferential lathe turning lines (feed marks)
  for (let y = 0; y < height; y++) {
    // Subtle sinusoidal modulation across height + fine noise
    const baseVal = 215 + Math.sin((y / height) * Math.PI * 16) * 6;
    const noise = Math.floor((Math.random() - 0.5) * 16);
    const v = Math.min(250, Math.max(185, Math.floor(baseVal + noise)));
    
    ctx.fillStyle = `rgb(${v},${v + 1},${v + 3})`;
    ctx.fillRect(0, y, width, 1);
  }

  // Periodic CNC tool pass bands (every 28-36 pixels)
  for (let y = 0; y < height; y += 32) {
    const bandHeight = 2 + Math.floor(Math.random() * 2);
    // Darker tool transition groove
    ctx.fillStyle = 'rgba(160, 168, 178, 0.4)';
    ctx.fillRect(0, y, width, bandHeight);

    // Adjacent bright highlight ridge
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.fillRect(0, y + bandHeight, width, 1);
  }

  // Subtle vertical specular reflection gradient across horizontal wrap
  const vertGrad = ctx.createLinearGradient(0, 0, width, 0);
  vertGrad.addColorStop(0.0, 'rgba(255, 255, 255, 0.05)');
  vertGrad.addColorStop(0.25, 'rgba(255, 255, 255, 0.18)');
  vertGrad.addColorStop(0.5, 'rgba(200, 205, 215, 0.08)');
  vertGrad.addColorStop(0.75, 'rgba(255, 255, 255, 0.18)');
  vertGrad.addColorStop(1.0, 'rgba(255, 255, 255, 0.05)');
  ctx.fillStyle = vertGrad;
  ctx.fillRect(0, 0, width, height);

  // Very subtle laser-etched hardware marking
  ctx.fillStyle = 'rgba(75, 82, 92, 0.65)';
  ctx.font = 'bold 20px monospace';
  ctx.fillText('LAGARAM-1 // SOLID ROCKET MOTOR // 6061-T6 AL', 40, 480);
  ctx.fillText('98mm OD x 4mm WALL // 7926 N·s // M1928', 40, 506);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 4);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

/**
 * Procedural normal/bump texture for circumferential CNC lathe grooves.
 */
export function createLatheStainlessSteelBumpTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, size, size);

  // Sharp alternating micro-grooves
  for (let y = 0; y < size; y += 2) {
    const v = 118 + Math.floor(Math.random() * 24);
    ctx.fillStyle = `rgb(${v},${v},${v})`;
    ctx.fillRect(0, y, size, 1);
  }

  // Periodic pass grooves
  for (let y = 0; y < size; y += 16) {
    ctx.fillStyle = '#555555';
    ctx.fillRect(0, y, size, 1);
    ctx.fillStyle = '#aaaaaa';
    ctx.fillRect(0, y + 1, size, 1);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 8);
  tex.needsUpdate = true;
  return tex;
}

/**
 * Procedural texture for Motor Casing: CNC-machined 6061-T6 Aluminium with detail rings and LAGARAM-1 branding.
 */
export function createMotorCasingTexture(): THREE.CanvasTexture {
  return createLatheStainlessSteelTexture();
}

/**
 * Creates materials for each section of LAGARAM-1 according to exact real data:
 * - Carbon Fibre: Nose Cone (08) and Fins (03)
 * - Fiberglass: Payload Bay (07) and Recovery Section (05)
 * - Stainless Steel: Motor Casing (02), Exhaust Nozzle (01), and Hardware Props
 * - Aluminium: Bulkheads (04 & 06)
 */
export function createRocketMaterials() {
  const brushedBumpTex = createBrushedAluminiumBumpTexture();
  const carbonFiberTex = createCarbonFiberTexture();
  const fiberglassTex = createFiberglassTexture();
  const latheSteelTex = createLatheStainlessSteelTexture();
  const latheSteelBumpTex = createLatheStainlessSteelBumpTexture();

  // 1. Nozzle: Polished lathe-turned stainless steel bell with graphite throat insert
  const nozzleMaterial = new THREE.MeshStandardMaterial({
    color: 0xdde3ea,
    map: latheSteelTex,
    metalness: 0.98,
    roughness: 0.18,
    bumpMap: latheSteelBumpTex,
    bumpScale: 0.012,
    envMapIntensity: 1.75,
  });

  // Graphite Throat Insert
  const graphiteThroatMaterial = new THREE.MeshStandardMaterial({
    color: 0x22262a,
    metalness: 0.15,
    roughness: 0.75,
    envMapIntensity: 0.4,
  });

  // 2. Motor Casing: Precision lathe-turned 316L Stainless Steel with circumferential turning marks
  const motorCasingMaterial = new THREE.MeshStandardMaterial({
    color: 0xe2e7ee,
    map: latheSteelTex,
    metalness: 0.98,
    roughness: 0.17,
    bumpMap: latheSteelBumpTex,
    bumpScale: 0.012,
    envMapIntensity: 1.85,
  });

  // Hardware Fittings: Gunmetal / black-oxide finish for hex bodies
  const fittingGunmetalMaterial = new THREE.MeshStandardMaterial({
    color: 0x282d34,
    metalness: 0.88,
    roughness: 0.35,
    envMapIntensity: 1.25,
  });

  // Blue-anodized collar rings (matching reference photo aerospace connectors)
  const fittingBlueAnodizedMaterial = new THREE.MeshStandardMaterial({
    color: 0x0a65c2,
    metalness: 0.92,
    roughness: 0.20,
    envMapIntensity: 1.6,
  });

  // Brass compression nut / collar
  const fittingBrassMaterial = new THREE.MeshStandardMaterial({
    color: 0xdca644,
    metalness: 0.94,
    roughness: 0.24,
    envMapIntensity: 1.5,
  });

  // Spark plug ribbed ceramic insulator
  const sparkPlugCeramicMaterial = new THREE.MeshStandardMaterial({
    color: 0xf0f3f6,
    metalness: 0.06,
    roughness: 0.28,
    envMapIntensity: 0.9,
  });

  // Precision stainless steel hex bolts & nuts
  const boltSteelMaterial = new THREE.MeshStandardMaterial({
    color: 0xe4eaf0,
    metalness: 0.98,
    roughness: 0.18,
    envMapIntensity: 1.7,
  });

  // 3. Four Fins: G10 Fiberglass Composite with matte off-white/cream finish
  const finMaterial = new THREE.MeshStandardMaterial({
    color: 0xf0ece1, // Authentic matte off-white / cream G10 composite
    map: fiberglassTex,
    bumpMap: fiberglassTex,
    bumpScale: 0.01,
    metalness: 0.06,
    roughness: 0.44,
    envMapIntensity: 1.1,
  });

  // 4 & 6. Bulkheads: 6061-T6 Aluminium discs with precision CNC face
  const bulkheadMaterial = new THREE.MeshStandardMaterial({
    color: 0x8e97a2,
    metalness: 0.95,
    roughness: 0.28,
    bumpMap: brushedBumpTex,
    bumpScale: 0.018,
    envMapIntensity: 1.3,
  });

  // 5. Recovery Section: Filament-wound Fiberglass Composite with smooth protective gloss
  const recoveryMaterial = new THREE.MeshStandardMaterial({
    color: 0xede8d8,
    map: fiberglassTex,
    bumpMap: fiberglassTex,
    bumpScale: 0.012,
    metalness: 0.06,
    roughness: 0.28,
    envMapIntensity: 1.15,
  });

  // 7. Payload Bay: RF-transparent Fiberglass Composite cylinder
  const payloadMaterial = new THREE.MeshStandardMaterial({
    color: 0xede8d8,
    map: fiberglassTex,
    bumpMap: fiberglassTex,
    bumpScale: 0.01,
    metalness: 0.06,
    roughness: 0.26,
    envMapIntensity: 1.2,
  });

  // 8. Nose Cone: Autoclave-cured 2x2 twill Carbon Fibre Composite
  // Calibrated to Carbon Fibre Grey (#8B939B), metalness ~0.5, roughness ~0.3 for glossy clear coat
  const noseConeMaterial = new THREE.MeshStandardMaterial({
    color: 0x8b939b, // Base colour #8B939B (mid grey)
    map: carbonFiberTex,
    bumpMap: carbonFiberTex,
    bumpScale: 0.008,
    metalness: 0.5,
    roughness: 0.3,
    envMapIntensity: 1.6,
  });

  // Pitot air-data tip probe: Machined 6061-T6 Aluminium (light silver)
  const pitotTipMaterial = new THREE.MeshStandardMaterial({
    color: 0xeef2f7,
    metalness: 0.96,
    roughness: 0.16,
    envMapIntensity: 1.8,
  });

  // Internal Parachute Pack: High-visibility aerospace ripstop nylon
  const parachuteMaterial = new THREE.MeshStandardMaterial({
    color: 0xff5a1f,
    roughness: 0.65,
    metalness: 0.12,
    envMapIntensity: 0.8,
  });

  // Internal Drogue Parachute Pack: Crisp neon safety yellow / gold
  const drogueParachuteMaterial = new THREE.MeshStandardMaterial({
    color: 0xfaad14,
    roughness: 0.60,
    metalness: 0.15,
    envMapIntensity: 0.9,
  });

  // Internal Solid Propellant BATES Grain: 70/16/14 AP/Al/HTPB composite grain (dark charcoal)
  const propellantGrainMaterial = new THREE.MeshStandardMaterial({
    color: 0x24282f,
    roughness: 0.85,
    metalness: 0.08,
    envMapIntensity: 0.35,
  });

  // Internal Avionics Circuit Sled Material
  const avionicsCircuitMaterial = new THREE.MeshStandardMaterial({
    color: 0x183c2e,
    roughness: 0.45,
    metalness: 0.35,
    envMapIntensity: 1.0,
  });

  return {
    nozzleMaterial,
    graphiteThroatMaterial,
    motorCasingMaterial,
    fittingGunmetalMaterial,
    fittingBlueAnodizedMaterial,
    fittingBrassMaterial,
    sparkPlugCeramicMaterial,
    boltSteelMaterial,
    finMaterial,
    bulkheadMaterial,
    recoveryMaterial,
    payloadMaterial,
    noseConeMaterial,
    pitotTipMaterial,
    parachuteMaterial,
    drogueParachuteMaterial,
    propellantGrainMaterial,
    avionicsCircuitMaterial,
    brushedBumpTex,
    carbonFiberTex,
    fiberglassTex,
    latheSteelTex,
    latheSteelBumpTex,
    motorCasingTex: latheSteelTex,
  };
}
