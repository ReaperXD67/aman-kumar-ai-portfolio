# Portfolio motion source research — 27 October 2026

The next pass must change the first impression visibly. The existing system already has the right identity and evidence structure; its hero's forty small box shards and sparse rails do not yet deliver the visual density, material richness or authorship Aman requested. The recommended upgrade is one continuous **signal → reasoning → execution** world, with a much larger GPU-authored hero and a distinct, short project-image handoff inside the Engineering X-ray.

## Recommended sequence

1. **Immediate image:** a full-stage directional light/filament sculpture fills the hero. Sensor streams converge into a tightly woven reasoning braid, then compress into an execution vector. Keep the recognizable portrait signature, actual role, résumé and professional routes readable above it.
2. **First interaction:** pointer movement bends the field locally; a tap or mode button sends a bounded pulse and changes geometry, color and the visible readout together. Provide a native Pause motion control. The effect should respond immediately, without asking visitors to discover a hidden hover target.
3. **Scroll handoff:** retain the existing cognitive descent as the main spatial journey. Use the hero's light direction, palette and motion logic so the scene feels like the same authored world. Do not add a second long pinned sequence.
4. **Inspect the work:** project selection gets a short displacement/masked transition with a large, real interface capture. It settles into the existing accessible layer controls and source-linked notes. The failure walkthrough remains an explanatory interaction rather than decorative telemetry.
5. **Resolve:** the portrait, career information and recruiter actions become clean resting states. Continuous movement belongs in the authored field, not in every heading and link.

This is a creative synthesis from the primary sources below. It does not claim a universal worldwide ranking. No studio imagery, brand assets, portfolio copy or client claims should be copied.

## Five useful techniques and their actual sources

### 1. A dense GPU signal sculpture

- Primary implementation references: [React Bits Beams](https://github.com/DavidHDev/react-bits/blob/e12c22192ac7b4b452c5e2feb9b586d74765d696/src/content/Backgrounds/Beams/Beams.jsx), [Light Rays source](https://github.com/DavidHDev/react-bits/blob/e12c22192ac7b4b452c5e2feb9b586d74765d696/src/content/Backgrounds/LightRays/LightRays.jsx), and [Light Rays component](https://reactbits.dev/backgrounds/light-rays).
- Inspected pattern: raw WebGL field rendering, pointer-steered illumination, a finite entrance, local pulses, a bounded pixel budget, resize handling, and visibility suspension. Beams uses field/blur/composite passes; Light Rays caps its pixel budget at 2.4 million.
- Adaptation: author the existing Decision Loom as directional strands and particles, rather than importing another standalone canvas behind an unchanged hero. A single shader or instanced draw can produce much denser material detail than many separately managed React meshes.
- Performance: cap pixel count and device ratio; reduce samples and strand count on narrow devices; stop the render loop offscreen and in a hidden tab. Avoid stacking multiple full-screen transparent canvases.
- Accessibility: reduced motion renders a settled representative composition. Mode buttons still change state, without continuous drift or pulses.
- Reuse terms: [the inspected license](https://github.com/DavidHDev/react-bits/blob/e12c22192ac7b4b452c5e2feb9b586d74765d696/LICENSE.md) is **MIT + Commons Clause**, not plain MIT. It permits use within an application/site/product and requires preservation of its notice; it restricts redistribution of the components/tools as standalone products. Original implementation informed by the pattern avoids adding that component distribution to this repository.

### 2. Instanced geometry and deliberate materials

- Primary sources: [R3F scaling performance](https://r3f.docs.pmnd.rs/advanced/scaling-performance), [Drei Instances](https://drei.docs.pmnd.rs/performances/instances), [Instances implementation](https://github.com/pmndrs/drei/blob/master/src/core/Instances.tsx), and [MeshTransmissionMaterial](https://drei.docs.pmnd.rs/shaders/mesh-transmission-material).
- Inspected pattern: shared geometry/material resources and instancing reduce draw calls. Drei specifically identifies CPU overhead in declarative instances and recommends raw `THREE.InstancedMesh` for very large fields. This is directly relevant to replacing forty individually managed shards with hundreds or thousands of GPU-driven signal elements.
- Adaptation: keep a small number of material systems: dark metallic structure, luminous signal, and at most one refractive core. A shape should become richer through lighting and depth, not by increasing every postprocessing parameter.
- Performance: transmission requires an additional scene pass. Use a shared, low-resolution buffer or omit it on mobile; do not give every shard its own transmission pass. On-demand rendering needs explicit invalidation for manually mutated values.
- Reuse terms: [Drei LICENSE](https://github.com/pmndrs/drei/blob/master/LICENSE) is MIT. Keep the existing dependency and its notices rather than vendoring an unrelated runtime.

### 3. Velocity-sensitive project imagery

- Primary source: [Jan Kohlbach / Codrops shader-on-scroll](https://github.com/jankohlbach/codrops-shader-on-scroll), inspected revision `8120ad43def74a1243761a3f5f064cc1262afc2a`.
- Actual implementation: [`effectVertex.glsl`](https://github.com/jankohlbach/codrops-shader-on-scroll/blob/8120ad43def74a1243761a3f5f064cc1262afc2a/shader/effectVertex.glsl) bends the image plane according to scroll velocity; [`effectFragment.glsl`](https://github.com/jankohlbach/codrops-shader-on-scroll/blob/8120ad43def74a1243761a3f5f064cc1262afc2a/shader/effectFragment.glsl) adds local pointer/noise displacement. The JavaScript maps image elements into the scene.
- Adaptation: a 0.5–0.8 second project-switch transition, or a restrained velocity response in the large project preview, can make the X-ray feel materially different without repeating the descent. Never distort the source notes, status labels or source links.
- Performance/accessibility: use one preview material and reset deformation fully at rest; retain the real DOM image as loading/error/reduced-motion fallback. Reuse the existing native scroll rather than introducing another scrolling library.
- Reuse terms: repository code is MIT; its example images have separate provenance and are not needed. If any shader is adapted directly, retain its notice and the separate Ashima/Stegu noise notice when using that noise source.

### 4. Large editorial movement with a native-scroll fallback

- Primary source: [Codrops OnScrollColumnsRows](https://github.com/codrops/OnScrollColumnsRows), inspected revision `33001fa32bbc04443f9eb8e325d6ef13136fc16f`; concrete [index.js](https://github.com/codrops/OnScrollColumnsRows/blob/33001fa32bbc04443f9eb8e325d6ef13136fc16f/js/index.js).
- Actual implementation: column offsets, image parallax and bounded `clamp(...)` triggers share a scroll rhythm. Its current basic example waits for images/fonts, uses `gsap.matchMedia()` for no-preference motion, and cleans up the scrolling integration when the preference changes.
- Adaptation: one oversized, split editorial section transition can give the portfolio a stronger visual cadence. Keep it subordinate to the main descent and do not turn every content block into a pinned panel.
- Performance/accessibility: animate child transforms and opacity, preserve layout dimensions, refresh only after actual layout changes. Under reduced motion, keep the content visible in natural document order.
- Reuse terms: demo code is MIT, while bundled libraries retain their own licenses. This project already has GSAP and should use its installed package rather than copying minified vendor files.

### 5. Finite kinetic typography and focused expansion

- Primary sources: [Motion Primitives repository](https://github.com/ibelick/motion-primitives), [text-scramble.tsx](https://github.com/ibelick/motion-primitives/blob/120f64f6ca60348e251f929e9c81f11ccbe45eda/components/core/text-scramble.tsx), [morphing-dialog.tsx](https://github.com/ibelick/motion-primitives/blob/120f64f6ca60348e251f929e9c81f11ccbe45eda/components/core/morphing-dialog.tsx), and [MIT license](https://github.com/ibelick/motion-primitives/blob/120f64f6ca60348e251f929e9c81f11ccbe45eda/LICENCE.md).
- Useful pattern: one short text compilation and a layout-linked expansion can connect the industrial system identity to the underlying information. They work best as punctuation, not an endless carousel of disappearing text.
- Source caveat: the inspected scramble example starts an interval without an effect cleanup and does not itself implement reduced motion. It is a visual reference, not code to paste unchanged. Use a finite requestAnimationFrame/timer with cleanup, a stable accessible text label, and a settled reduced-motion state.
- Adaptation: compile the hero's action verb once, then stop; retain the existing identity thesis as its own separate authored statement. Use native dialogs for important résumé/credential interactions, maintaining focus and Escape behavior.

## Studio/portfolio references

- [Bruno Simon's current source](https://github.com/brunosimon/folio-2025) at `41046b57eeed8d156d9c3fd7fa259900baef7816` supplies a concrete model for coherent world building: materials, interaction, camera, time and environment are part of one system. The inspected material files use Three.js WebGPU/TSL; importing them directly into this existing WebGL renderer would be a migration, not a drop-in enhancement. Its root `license.md` is MIT; individual asset notices still matter.
- [Lusion](https://lusion.co/) and [Immersive Garden](https://immersive-g.com/) establish the ambitious studio benchmark: large visual storytelling and selective case studies. They are inspiration references, not reusable asset libraries or evidence that Aman's work has their client outcomes.
- [Dennis Snellenberg](https://dennissnellenberg.com/) demonstrates the value of a very clear personal introduction, large work presentation and decisive contact route. Preserve those practical recruiter routes while raising the spectacle.
- [GSAP's current showcase](https://gsap.com/showcase/) was used as a discovery source, with named live portfolios such as Mike Fernandez and Guillaume Colombel. Inclusion is a curation signal, not an objective quality ranking or permission to copy their implementation.
- [Aceternity Container Scroll Animation](https://ui.aceternity.com/components/container-scroll-animation) was inspected as a familiar 3D-scroll pattern. It would largely duplicate the portfolio's existing peel anatomy; no Aceternity code or paid assets were installed, and no unverified license was assumed.

## Installed official GSAP skills

The user requested necessary skills. Four focused guides from [greensock/gsap-skills](https://github.com/greensock/gsap-skills/tree/aed9cfd3277740755f6bfc1155c7aa645403b760) were read before installation, then installed through the bundled skill installer at the pinned revision `aed9cfd3277740755f6bfc1155c7aa645403b760`:

- `C:/Users/Aman/.codex-cli/skills/gsap-react/SKILL.md`
- `C:/Users/Aman/.codex-cli/skills/gsap-scrolltrigger/SKILL.md`
- `C:/Users/Aman/.codex-cli/skills/gsap-performance/SKILL.md`
- `C:/Users/Aman/.codex-cli/skills/gsap-timeline/SKILL.md`

Each folder includes the upstream MIT license and an `ORIGIN.json` recording the revision. They become available to automatic skill discovery on the next turn; their files are readable now. No app packages, executables, browser extensions or additional renderer were installed. Useful rules include scoped `useGSAP`, context-safe delayed handlers, one top-level ScrollTrigger per timeline, transform/opacity updates, and offscreen suspension. The guide's horizontal-scroll example contains a `Max.max` typo, so examples still require review against the official API.

## Source record and delivery boundary

Inspected source files, license texts and repository trees are retained privately in ignored `artifacts/motion-research/`. They are reference material, not a shipped vendor bundle. This research document does not claim that the proposed effects are implemented or visually verified; the app's source, main README and release verification should record the final delivered behavior and any directly reused notices.
