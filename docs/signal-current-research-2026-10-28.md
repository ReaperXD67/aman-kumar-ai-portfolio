# Signal Current — research and implementation contract

Research date: 28 October 2026. The user rejected the bright metallic sheet behind the portrait: its motion felt rough and its silhouette competed with the content. The replacement direction is an open field of soft particles and flowing signals, with authored perspective-camera movement. The photograph, words and controls remain native, clear and usable.

## References and decisions

| Primary reference | Relevant finding | Application here |
| --- | --- | --- |
| [Cerebrium: making infrastructure tangible](https://tympanus.net/codrops/2026/07/23/building-cerebrium-making-serverless-infrastructure-tangible/) | Its authors describe static network geometry animated by traveling shader masks, careful control of bloom, and deliberately authored camera motion. | Borrow the principle of motion through stable geometry and controlled light. Do not import its scene, branding, models or postprocessing pipeline. |
| [Aether 1: sound without boundaries](https://tympanus.net/codrops/2025/08/06/building-aether-1-sound-without-boundaries/) | Its team combines a consistent camera route with GPU flow-field particles, and scales expensive effects down. | Treat portrait through contact as one spatial composition. Use analytic paths in the existing renderer instead of adopting its stateful GPGPU simulation, infinite scrolling or multi-pass fluid distortion. |
| [Isfaaq Emambocus particle shaders](https://github.com/imfemambocus/portfolio/blob/main/src/particles/shaders.ts), [field setup](https://github.com/imfemambocus/portfolio/blob/main/src/particles/ParticleField.tsx), [MIT license](https://github.com/imfemambocus/portfolio/blob/main/LICENSE) | A stable particle cohort morphs on the GPU through uniform changes; soft sprites and a bounded flow swell avoid straight-line interpolation. | Keep scroll work independent of particle count. Author original trajectories and shading for this portfolio; do not transplant its 160,000-point budget or layouts. |
| [Interlude particle transition](https://github.com/codrops/interlude/blob/main/src/transitions/particles.ts), [MIT license](https://github.com/codrops/interlude/blob/main/LICENSE) | Static per-particle attributes and a few uniforms drive gathering, breathing, pointer response and release. Its render callback stops when the transition ends. | Borrow the small-control-surface principle and explicit lifecycle. Its TSL/WebGPU transition framework is unnecessary for this existing WebGL page. |
| [Drei Stars shader](https://github.com/pmndrs/drei/blob/master/src/core/Stars.tsx), [MIT license](https://github.com/pmndrs/drei/blob/master/LICENSE) | One points geometry uses perspective-sized particles, soft fragment opacity and disabled depth writes. | Use soft, depth-aware points without installing Drei or React Three Fiber. The composition must have directed flow rather than a generic starfield. |

These are visual and technique references. The replacement shader is authored specifically for this portfolio; no reference source code, imagery, models or other assets are copied, and no dependencies are added. The articles are not offered as reusable asset licenses. The linked repository licenses describe the references, not a dependency introduced by this change.

## Alternatives declined

- [React Bits Light Pillar source](https://github.com/DavidHDev/react-bits/blob/main/src/content/Backgrounds/LightPillar/LightPillar.jsx) uses an 80-step raymarch, nested detail loops and a second composite pass. Its adaptive quality and cleanup are useful examples, but this fill-heavy treatment is a poor fit for the ending's mobile performance and reading space. Its [license is MIT plus Commons Clause](https://github.com/DavidHDev/react-bits/blob/main/LICENSE.md), not plain MIT.
- [Dreamy Particles](https://github.com/DGFX/codrops-dreamy-particles) and its [author tutorial](https://tympanus.net/codrops/2024/12/19/crafting-a-dreamy-particle-effect-with-three-js-and-gpgpu/) demonstrate attractive GPGPU motion and bloom. No explicit repository license was found in the reviewed root or package metadata, and the models have separate credits. Do not copy its code or assets. Its simulation and postprocessing are also unnecessary for a reversible scroll composition.

## Chosen rendering contract

- One `THREE.Points` object with **12,000 desktop / 4,000 phone particles** and soft sprites. Source inspection and the renderer's browser metadata confirm these budgets; they are not measured performance claims.
- Seeded static attributes feed analytic shader paths. Scroll, camera, appearance and active time change through uniforms; no per-frame CPU geometry rebuild, normal recomputation, PMREM environment or hard rectangular content clip.
- A continuous authored camera route carries the field from the portrait through the reading passage into contact. Negative space belongs to the composition; a bright solid object must not reappear behind the face or words.
- Frame-rate-independent delta damping smooths scroll and camera changes. Ambient motion advances only during visible active time; hidden tabs and offscreen stages do not accumulate a jump on return.
- A visible **Pause signal current** control stops ambient motion; the same action is available in Signal OS. `prefers-reduced-motion` receives a settled static composition. Native scrolling and direct professional links remain independent of the effect.

## Verification scope

The [delivery record](signal-current-verification-2026-10-28.md) distinguishes source checks, browser viewport observations and public release verification. It includes the mobile reading route, direct links, pause/resume and footer clearance. Reduced-motion, context-loss and unavailable-WebGL behavior are source-reviewed; no physical-phone FPS result is claimed. Source checks alone do not establish visual quality or deployment.
