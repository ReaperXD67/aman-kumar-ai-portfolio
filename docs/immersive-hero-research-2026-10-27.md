# Immersive hero: source research and implementation

Reviewed 2026-10-27. The brief is a materially richer cinematic 3D hero and a continuous handoff into the existing scroll journey. The selected direction preserves the black industrial world, original Decision Loom, truthful personal introduction, portrait and direct work/résumé routes. This is an original synthesis, not an objective worldwide ranking or a clone of another portfolio.

## Primary references and concrete lessons

### Bruno Simon: a camera and material system, not isolated effects

Inspected [folio-2025](https://github.com/brunosimon/folio-2025/tree/41046b57eeed8d156d9c3fd7fa259900baef7816), including [`View.js`](https://github.com/brunosimon/folio-2025/blob/41046b57eeed8d156d9c3fd7fa259900baef7816/sources/Game/View.js), [`Rendering.js`](https://github.com/brunosimon/folio-2025/blob/41046b57eeed8d156d9c3fd7fa259900baef7816/sources/Game/Rendering.js), [`Quality.js`](https://github.com/brunosimon/folio-2025/blob/41046b57eeed8d156d9c3fd7fa259900baef7816/sources/Game/Quality.js) and the [MIT license](https://github.com/brunosimon/folio-2025/blob/41046b57eeed8d156d9c3fd7fa259900baef7816/license.md).

The source separates focus, camera state and cinematic targets; its rendering also adapts postprocessing to quality. The relevant lesson is to compose a navigable world with deliberate focus and lighting. Its WebGPU/TSL renderer and game simulation would be a major platform migration here. No vehicle, world assets, code or branding were imported. The hero instead keeps its existing WebGL renderer and couples the sculpture, structural opening and camera to one shared progress value.

### Lusion: tangible geometry and readable light

The current [Lusion homepage](https://lusion.co/) was inspected live and in a rendered capture. Large physical forms, visible material differences and foreground occlusion provide visual weight. [Porsche: Dream Machine](https://lusion.co/projects/porsche_dream_machine/) also illustrates a phased visual journey rather than a collection of unrelated ornaments.

Our translation is specific to the approved black palette: broad titanium faces, graphite structure, cold studio reflections and a restrained warm key. Thin luminous lines support that structure instead of carrying the entire composition. Lusion's proprietary site and media are visual references only; no studio assets or source were copied.

### Joseph Santamaria: scroll controls composition

[The author's cinematic scroll tutorial](https://tympanus.net/codrops/2025/11/19/how-to-build-cinematic-3d-scroll-experiences-with-gsap/) explicitly maps scroll timelines to camera coordinates, object rotation and synchronized text beats. [The later portfolio case study](https://tympanus.net/codrops/2026/04/28/more-than-a-portfolio-building-a-scroll-driven-3d-world-with-something-to-say/) explains camera-pathed scenes, repeated geometry and low-resolution mobile passes.

The useful pattern is one directed camera move with a readable destination. The hero uses ordinary document scroll and no additional pin, smoothing library, touch interception, audio or long artificial spacer. Its camera moves closer and toward the tapered aperture while the structural ribs open and the woven field becomes a narrow forward vector. That geometry and palette are shared with the separate descent work. Author assets and proprietary portfolio code were not reused; tutorial observations informed an original implementation.

### Official rendering and scroll APIs

[Three.js RoomEnvironment](https://threejs.org/docs/pages/RoomEnvironment.html) provides procedural lighting for a generated PMREM. This gives the original PBR structure broad reflections without downloading an HDR asset or adding a transmission pass. The room and generator are disposed after generation; the environment render target is disposed on unmount. The addon comes from the already-installed Three.js package.

[React Three Fiber's performance guide](https://r3f.docs.pmnd.rs/advanced/scaling-performance) supports shared geometry/material resources, demand rendering and explicit invalidation for externally mutated camera values. [GSAP ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/) supports ordinary native scrolling, scrubbed progress and scoped cleanup. The installed official GSAP React, ScrollTrigger and performance guides were read; the scoped `useGSAP` context owns its timelines.

## What changed in this implementation

- **Sculpture:** nine original bevelled, open octagonal cross-sections form an elongated machine around the existing GPU ribbon spine. Their broad PBR surfaces, edge seams and graphite keel fins expose depth and a tangible silhouette. The shape remains distinct from the spherical identity kernel.
- **Three physical modes:** Observe spreads sensor material through tall, shallow frames; Reason broadens the depth into a twisted reasoning chamber; Execute progressively tapers both structure and signal toward its outlet. This extends the existing geometry/color morph rather than adding disconnected objects.
- **Surface detail:** selective signal ribbons have more width, and the metallic field has restrained directional brushing, a cold fill and controlled emissive traces. Bloom is reduced so material faces remain visible.
- **Spatial handoff:** the prior CSS canvas enlargement is replaced by an actual camera path, structural separation and field convergence driven through a shared mutable progress ref. No React state is set per frame. The actual GPU material refs still receive every scalar/vector/color update, including the new exit uniform.
- **Responsive composition:** narrow screens turn the elongated sculpture into a diagonal upper-stage composition; typography, portrait and native controls remain in the document. A short-landscape rule reduces hero spacing, display size and action density. Root browser verification owns final composition checks at 320px, 390px, landscape and desktop.

## Performance, accessibility and verification boundary

The existing approximately 2.2-million base-pixel cap, maximum 1.35 DPR, 6,800 desktop / 2,800 narrow particles, visibility/hidden-tab unmounting and demand rendering during Pause/reduced motion remain. The new repeated frame uses shared resources and only 192 triangles per cross-section, under 2,000 structural frame triangles overall. There is no downloaded model, texture, new package or extra full-screen context. Generated reflections are a one-time setup operation; only the existing bloom pass runs continuously.

Reduced motion shows settled geometry and changes modes directly; its camera does not take the scroll flight. Pause freezes continuous field time and still permits visitor-controlled mode/scroll changes. The native buttons retain their labels and pressed state. Direct portrait, work and résumé actions remain readable independent of WebGL; the existing error boundary retains an explanatory fallback.

Local implementation checks passed: JSX bundle parsing, finite position/UV/normal arrays for the new aperture geometry, and the Impeccable mechanical detector. These are code checks, not measured device FPS or final browser acceptance. Root integration owns the combined hero/descent browser pass and production build. Research source snapshots are retained under ignored `artifacts/immersive-hero-research/`; root reference captures are under ignored `artifacts/immersive-reference/`.
