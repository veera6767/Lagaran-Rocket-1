# LAGARAM-1 Rocket Inspector

Interactive 3D engineering inspector for **LAGARAM-1**, a single-stage solid-propellant sounding rocket designed for weather applications.

🔗 **Live website:** https://veera6767.github.io/Lagaran-Rocket-1/

## About the project
This website is the visual companion to our B.Tech Aerospace Engineering final-year project, *Performance Characterization of a Sounding Rocket for Weather Applications* (Phase 1). You can orbit the rocket, click any section to inspect its material, dimensions and mass, and view the propulsion and flight-simulation results.

## Features
- Interactive 3D model: drag to orbit, scroll to zoom, click a section to inspect it
- Exploded view, wireframe mode, CG/CP markers, camera presets
- Per-section inspector: material, length, diameter, wall thickness, mass
- Mission Analysis panel: NASA CEA, OpenMotor, OpenRocket, RASAero II, fin flutter, rail exit velocity

## Rocket specifications
| Parameter | Value |
| --- | --- |
| Total length | 2000 mm |
| Outer diameter (airframe) | 102 mm |
| Wall thickness | 3 mm |
| Inner diameter | 96 mm |
| Nose cone | 550 mm (carbon fibre, Von Karman profile) |
| Avionics bay | 250 mm |
| Drogue bay | 400 mm |
| Booster section | 800 mm |
| Inner motor | 700 mm (M1928) |
| Wet mass | 13.32 kg |

## Key results
| Parameter | OpenRocket | RASAero II |
| --- | --- | --- |
| Apogee | 5,206 m | 4,493 m |
| Max velocity | 531 m/s | 528.5 m/s |
| Max Mach | 1.58 | 1.55 |

- Motor: M1928, total impulse 7,926 N·s, burn time 4.08 s
- Static margin: 2.38 calibers (CG 1290 mm, CP 1530 mm from nose)
- Fin flutter velocity 1,428 m/s (2.69x safety margin)
- Rail exit velocity 27.4 m/s on a 6 m rail (minimum required 15 m/s)

## Tools used
NASA CEA, OpenMotor, OpenRocket, RASAero II, NACA TN 4197 (fin flutter), React 19, TypeScript, Three.js, Vite 6, Tailwind CSS

## Run locally
```bash
# 1. Install dependencies
npm install

# 2. Start local development server
npm run dev

# 3. Open in browser
# http://localhost:5173/

# 4. Build static production bundle
npm run build
```
