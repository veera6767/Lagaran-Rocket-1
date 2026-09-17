import { RocketPartInfo } from '../types';

export const ROCKET_PARTS: RocketPartInfo[] = [
  {
    id: 'nozzle',
    name: 'Exhaust Nozzle',
    assembly: 'Engine / Motor Assembly',
    order: 1,
    material: 'Stainless Steel / Graphite Insert',
    finish: 'CNC lathe-turned 304/316 stainless steel conical bell with isostatic graphite throat insert',
    massKg: 0.80,
    lengthMm: 180,
    diameterMm: 98,
    description: 'Precision lathe-turned stainless steel conical expansion nozzle. Engineered with a clean supersonic conical bell contour that flows continuously from the motor casing converging section, featuring an isostatically pressed high-density graphite throat insert to resist 2,900 K erosion.',
    technicalDetails: [
      'Conical bell expansion geometry flowing seamlessly from casing converging taper',
      'High-purity isostatic graphite throat insert resisting high-pressure erosion at 6.2 MPa',
      'Machined external retaining shoulder collar and precision-turned exit lip',
      'High-temperature Viton O-ring seal interface meeting aft casing flange'
    ],
    specs: [
      { label: 'Bell Alloy', value: '304/316 Stainless Steel' },
      { label: 'Throat Insert', value: 'Isostatic Graphite' },
      { label: 'Exit Diameter', value: '65.0 mm' },
      { label: 'Expansion Ratio', value: '7.8 : 1' }
    ],
    explodedYOffset: -1.1
  },
  {
    id: 'motor-casing',
    name: 'Motor Casing',
    assembly: 'Engine / Motor Assembly',
    order: 2,
    material: 'Stainless Steel (304/316)',
    finish: 'Lathe-turned polished stainless steel (98 mm OD, 4 mm wall) with top flange & fittings',
    massKg: 2.39,
    lengthMm: 620,
    diameterMm: 98,
    description: 'Lab-machined cylindrical stainless steel pressure vessel chamber (98 mm OD, 4 mm wall thickness, 2.39 kg empty mass). Features a stepped top circular flange with an 8-bolt circle, protruding igniter and right-angle pneumatic valve fittings, and a smooth converging conical section necking down to the nozzle throat.',
    technicalDetails: [
      'Dimensions: 98 mm OD, 4 mm wall thickness, 2.39 kg empty chamber mass',
      'Top flange cap with 8-bolt circular pattern (hex head fasteners with washers)',
      'Top fittings: off-center spark-plug igniter (ceramic ribs) & right-angle pneumatic elbow',
      'Smooth converging conical taper necking down to throat mating retention collar'
    ],
    specs: [
      { label: 'Chamber Material', value: '304 Stainless Steel' },
      { label: 'Outer Diameter', value: '98 mm' },
      { label: 'Wall Thickness', value: '4 mm' },
      { label: 'Chamber Mass', value: '2.39 kg' },
      { label: 'Proof Pressure', value: '14.0 MPa' },
      { label: 'Motor Class', value: 'M1928-P (Sim-Confirmed)' }
    ],
    explodedYOffset: -0.5
  },
  {
    id: 'fins',
    name: 'Stabilizing Fins (x4)',
    assembly: 'Aerodynamic Empennage',
    order: 3,
    material: 'G10 Fiberglass Composite',
    finish: 'Matte off-white/cream G10 composite with precision double-wedge beveled knife edges',
    massKg: 1.05,
    lengthMm: 200, // Scaled root chord (+18% from 170 mm base)
    diameterMm: 390, // Tip-to-tip span (+18% scaled)
    description: 'Cruciform four-fin passive aerodynamic stabilization array mounted flush against the motor casing exterior. Precision-machined from high-strength G10 fiberglass composite with an authentic matte off-white/cream finish, featuring surface-mounted flush tangent brackets and double-wedge supersonic chamfered edges to maintain high flutter margins.',
    technicalDetails: [
      'G10 fiberglass composite with matte off-white/cream finish & double-wedge supersonic profile',
      'Surface-mounted flush tangent root brackets with aerospace retention fasteners',
      'Base pre-scale dimensions: 170 mm root chord, 62 mm tip chord, 85 mm semi-span',
      'Scaled up ~18% for enhanced aerodynamic stability authority (+2.38 calibers / 12.2% margin)'
    ],
    specs: [
      { label: 'Fin Count', value: '4 cruciform (90°)' },
      { label: 'Material', value: 'G10 Fiberglass' },
      { label: 'Surface Finish', value: 'Matte Off-White' },
      { label: 'Root Chord', value: '200 mm (170 mm base)' },
      { label: 'Tip Chord', value: '73 mm (62 mm base)' },
      { label: 'Semi-Span', value: '100 mm (85 mm base)' }
    ],
    explodedYOffset: -0.9,
    explodedRadialOffset: 1.4 // Kicks outward radially
  },
  {
    id: 'bulkhead-lower',
    name: 'Interstage Bulkhead',
    assembly: 'Structural Isolation',
    order: 4,
    material: 'Aluminium 6061-T6',
    finish: 'CNC-machined aluminium disc with dual O-ring seal & thermal barrier',
    massKg: 0.34,
    lengthMm: 15,
    diameterMm: 102,
    description: 'High-rigidity hermetic bulkhead dividing the forward closure of the solid motor from the recovery bay. Machined from 6061-T6 aluminium with a phenolic insulation puck and dual radial O-ring seals.',
    technicalDetails: [
      'Withstands 8.0 kN axial ejection charge thrust dynamic pressure',
      'Dual fluoroelastomer O-rings isolate hot motor gases from parachute compartment',
      'Centrally mounted forged eyebolt for drogue shock cord anchoring',
      'Integrated mounting well for redundant black powder separation canisters'
    ],
    specs: [
      { label: 'Material', value: 'Aluminium 6061-T6' },
      { label: 'Disc Web Thickness', value: '8.0 mm' },
      { label: 'Proof Load', value: '18.0 kN axial' },
      { label: 'Seal Rating', value: 'Dual Viton O-Ring' }
    ],
    explodedYOffset: 0.1
  },
  {
    id: 'recovery-bay',
    name: 'Recovery Section',
    assembly: 'Recovery Subsystem',
    order: 5,
    material: 'Fiberglass Composite',
    finish: 'Filament-wound aerospace fiberglass tube with radial shear pin ports',
    massKg: 2.10,
    lengthMm: 480,
    diameterMm: 102,
    description: 'Cylindrical recovery section fabricated from lightweight filament-wound aerospace fiberglass. Houses the dual-event parachute mechanism including high-altitude drogue parachute, main toroidal parachute, and tubular Kevlar bridle.',
    technicalDetails: [
      'Dual-deployment sequence: drogue at apogee, main canopy deployed at 350 m AGL',
      '3x 2.5 mm precision nylon radial shear pins calibrate mechanical separation threshold',
      '4x 3.0 mm static pressure equalization sampling ports for barometric altimeters',
      'Flame-resistant Nomex deployment bag and 12 kN tubular Kevlar shock harness'
    ],
    specs: [
      { label: 'Airframe Material', value: 'Fiberglass Composite' },
      { label: 'Main Canopy Dia', value: '2.4 m Toroidal' },
      { label: 'Drogue Canopy Dia', value: '450 mm Hemispherical' },
      { label: 'Terminal Descent', value: '4.8 m/s' }
    ],
    explodedYOffset: 1.1
  },
  {
    id: 'bulkhead-upper',
    name: 'Avionics Bulkhead',
    assembly: 'Structural Isolation',
    order: 6,
    material: 'Aluminium 6061-T6',
    finish: 'CNC-machined aluminium disc with cable pass-throughs & mounting bosses',
    massKg: 0.28,
    lengthMm: 15,
    diameterMm: 102,
    description: 'Forward barrier providing mechanical mounting foundation for the avionics sled while sealing sensitive flight computers and science payload instruments from parachute deployment dynamics and ejection gases.',
    technicalDetails: [
      'Twin forged eyebolts rated to 15 kN for recovery tether linkage',
      'Hermetically sealed pass-through grommets for external arming switches',
      'Hard-anodized MIL-A-8625 Type III surface finish for corrosion resistance',
      'Direct structural coupler interface aligning payload and recovery bays'
    ],
    specs: [
      { label: 'Material', value: 'Aluminium 6061-T6' },
      { label: 'Disc Web Thickness', value: '6.5 mm' },
      { label: 'Harness Proof Load', value: '15.0 kN' },
      { label: 'Coupler Shoulder', value: '50.0 mm engagement' }
    ],
    explodedYOffset: 2.1
  },
  {
    id: 'payload-bay',
    name: 'Payload Bay',
    assembly: 'Avionics & Science Bay',
    order: 7,
    material: 'Fiberglass Composite',
    finish: 'Filament-wound aerospace fiberglass with flush external access panel',
    massKg: 1.85,
    lengthMm: 380,
    diameterMm: 102,
    description: 'Cylindrical RF-transparent avionics and scientific instrumentation bay constructed from filament-wound fiberglass. Contains dual redundant 32-bit flight computers, 9-DOF IMU, GPS telemetry transmitters, and barometric altimeters.',
    technicalDetails: [
      'RF-transparent fiberglass walls enable internal telemetry antennas without external drag pods',
      'Machined flush access hatch secured with countersunk stainless steel fasteners',
      'Internal carbon fiber avionics sled with silicone shock-damping standoffs',
      'Dual 32-bit ARM Cortex flight controllers recording telemetry at 500 Hz'
    ],
    specs: [
      { label: 'Airframe Material', value: 'Fiberglass Composite' },
      { label: 'RF Permittivity', value: 'εr = 4.2 (Transparent)' },
      { label: 'Telemetry Link', value: '915 MHz / 2.4 GHz' },
      { label: 'Battery Capacity', value: '2,200 mAh LiPo' }
    ],
    explodedYOffset: 3.1
  },
  {
    id: 'nose-cone',
    name: 'Nose Cone',
    assembly: 'Forward Aerodynamic Fairing',
    order: 8,
    material: 'Carbon Fibre Composite',
    finish: 'Autoclave-cured 2x2 twill carbon fibre with clear epoxy finish & metal tip',
    massKg: 0.85,
    lengthMm: 450,
    diameterMm: 102,
    description: 'Von Kármán (minimum supersonic wave drag) profile aerodynamic fairing. Fabricated from autoclave-cured 2x2 twill carbon fibre composite with an integrated aluminium pitot tip probe for air-data stagnation pressure sensing.',
    technicalDetails: [
      'Von Kármán LD-Haack supersonic aerodynamic series (fineness ratio 3.75 : 1)',
      'Sharp machined 6061-T6 air-data pitot probe for total pressure measurement',
      'Internal carbon fiber bulkhead housing forward GPS tracking beacon and antenna',
      'Autoclave cured at 6 bar / 130 °C for exceptional stiffness-to-weight ratio'
    ],
    specs: [
      { label: 'Fairing Material', value: 'Carbon Fibre Composite' },
      { label: 'Fineness Ratio', value: '3.75 : 1' },
      { label: 'Aero Profile', value: 'Von Kármán (Haack)' },
      { label: 'Stagnation Temp', value: '260 °C at Mach 1.58' }
    ],
    explodedYOffset: 4.3
  }
];

export const OPENROCKET_SIMULATION = {
  software: 'OpenRocket Simulation',
  status: 'Confirmed Simulation Data',
  totalLengthCm: 200,
  totalLengthM: 2.00,
  maxDiameterMm: 102,
  maxDiameterCm: 10.2,
  dryMassG: 7842,
  dryMassKg: 7.842,
  wetMassG: 13970,
  wetMassKg: 13.97,
  cgCmFromNose: 129,
  cpCmFromNose: 153,
  stabilityMarginCalibers: 2.38,
  stabilityMarginPercent: 12.2,
  stabilityMarginCm: 24,
  motor: 'M1928-P',
  apogeeM: 5206,
  apogeeKm: 5.21,
  maxVelocityMs: 531,
  maxMach: 1.576,
  maxMachFormatted: 'Mach 1.576',
  maxAccelerationMs2: 232,
};

export const VEHICLE_SUMMARY = {
  designation: 'LAGARAM-1',
  vehicleClass: 'Suborbital Aerodynamic Vehicle • Single-Stage Solid Rocket',
  totalLengthM: 2.00,
  totalLengthCm: 200,
  diameterMm: 102,
  maxDiameterCm: 10.2,
  dryMassKg: 7.842,
  dryMassG: 7842,
  wetMassKg: 13.97,
  wetMassG: 13970,
  centerOfGravityCm: 129,
  centerOfGravityMm: 1290,
  centerOfPressureCm: 153,
  centerOfPressureMm: 1530,
  staticStabilityCalibers: 2.38,
  staticStabilityPercent: 12.2,
  stabilityMarginCm: 24,
  motorConfig: 'M1928-P',
  maxApogeeM: 5206,
  maxApogeeKm: 5.21,
  maxVelocityMs: 531,
  maxMach: 'Mach 1.576',
  maxAccelerationMs2: 232,
  peakThrustKn: 3.6,
  primaryMission: 'Suborbital Aerodynamic Vehicle • Single-Stage Solid Rocket Engineering Inspector'
};
