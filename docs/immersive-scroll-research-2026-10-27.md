# Immersive scroll direction — 27 October 2026

The new request calls for a materially stronger 3D world and cinematic transitions. The existing descent used a nearly straight Z dolly, a fractured icosahedron and a few isolated image planes. Those objects did not explain the hero's directional Decision Loom or make the flagship projects feel like places the visitor entered.

## Primary references and decisions

- [Joseph Santamaria's author case study](https://tympanus.net/codrops/2026/04/28/more-than-a-portfolio-building-a-scroll-driven-3d-world-with-something-to-say/) demonstrates how camera composition, lighting and scene rhythm can carry one coherent world. It also describes instancing and reduced-resolution atmospheric passes. The useful principle here is spatial continuity; no proprietary scene, branding, shader or artwork is copied.
- [Gaspard Hedde's curve-gallery tutorial](https://tympanus.net/codrops/2026/07/07/building-a-scroll-driven-3d-gallery-using-a-blender-camera-path-with-three-js-and-gsap/) and [author repository](https://github.com/gaspoorf/curve-gallery) make the curve itself the authoring tool for travel, image focus and rhythm. The portfolio uses its own finite hand-authored Catmull-Rom track with ordinary page scroll; it does not adopt the demo's wheel interception, closed infinite path or auto-scroll.
- [Bruno Simon's folio-2025 source](https://github.com/brunosimon/folio-2025) separates view and rendering stages in the game loop. Its [View implementation](https://github.com/brunosimon/folio-2025/blob/main/sources/Game/View.js) explicitly handles camera focus, roll and non-ideal aspect ratios. Here, the camera updates before scene-dependent shader uniforms, with precomputed focus directions and a different phone field of view. No game world or model assets are reused.
- [Houmahani Kane's atmospheric depth-gallery source](https://github.com/houmahani/codrops-depth-gallery) ties depth and motion to each image's visual world. Its [MIT license](https://github.com/houmahani/codrops-depth-gallery/blob/main/LICENSE) is explicit. This portfolio instead carries its existing acid, ice and vermilion signals through three real artifact bays rather than importing unrelated gallery imagery.
- [React Three Fiber's performance guidance](https://r3f.docs.pmnd.rs/advanced/scaling-performance) supports demand rendering, explicit invalidation, shared geometry and instancing. [Three.js's CatmullRomCurve3 documentation](https://threejs.org/docs/pages/CatmullRomCurve3.html) defines the curve and reusable vector-target APIs used by the camera.

## Implemented world

`CognitiveDescent.jsx` now owns the narrative, native skip/evidence anchors, scoped GSAP timeline, visibility gate and real static fallback. `DescentWorld.jsx` owns the single existing WebGL scene. `cognitive-descent.css` contains the new styles without changing the global stylesheet.

The visitor enters a graphite/titanium aperture field continuous with the hero's elongated Decision Loom. Thirty-one chamfered angular gates use two instanced meshes rather than one mesh per strut. Twelve peripheral signal rails braid along an 84-world-unit curved track. The camera banks gently and looks toward each approaching flagship bay, then releases along the path. This replaces the old spherical fracture, sparse torus gates, random particle cloud and perpetual rotation.

AtlasLM carries the acid evidence signal; the autonomous agent carries the ice ownership signal; KarixMC carries the vermilion trust-boundary signal. The large bays use the current real AtlasLM and KarixMC captures plus the explicitly labeled agent architecture blueprint. Machined housings and offset source-anatomy blades give those artifacts spatial thickness. These overview layers are illustrative architecture, never live events, metrics or executed tests. The selected-work instrument remains the place to inspect the complete decisions and source paths.

## Motion and integration contract

- The component keeps the existing one sticky journey: 540svh on desktop and 440svh at widths up to 700px. It does not add another pin, wheel handler, scroll lock or custom scroller.
- `progressRef.current` is the normalized, scrubbed GSAP timeline driver. `--journey-progress` mirrors it on `.descent-flight`. The DOM `data-flight-chapter` moves through `entry`, `atlaslm`, `agent`, `karixmc` and `evidence`. No App prop or public caller change is required.
- Camera/artifact focal stops are approximately 0.265, 0.535 and 0.785. Chapter captions enter at 0.15, 0.40 and 0.67; the evidence arrival enters at 0.89. Small camera damping settles after the timeline stops.
- Canvas uses `frameloop="demand"`. Timeline updates invalidate a frame; camera settling requests only the additional frames it needs. Rails, approach scale and banking depend on progress rather than an elapsed-time clock. There is no ambient animation requiring a separate pause control.
- The canvas unmounts outside the section's near-viewport range and when the document is hidden. Rendering bounds base pixel area to roughly 1.8 million, caps DPR at 1.35, and uses reduced-resolution bloom without multisampling.
- Reduced motion and caught WebGL/asset failures show a short normal-flow artifact collection with native source links and an evidence link. Reduced motion mounts no Canvas and creates no scroll timeline. Context loss selects the same fallback.
- Phone rendering uses smaller artifact bays and an 86-degree vertical field of view. Phone text moves below the main view, retains 44px controls, and has no hover-only action. Short landscape uses a compact caption composition.

## Validation and remaining visual QA

Both new JSX entry points bundle with installed esbuild. A local geometry smoke checked 101 track samples for finite orthogonal frames and all three artifact focal centers against 1440×900 and 320×800 projection matrices. Every artifact center remains comfortably inside the viewport at its focal stop. The Impeccable detector reported no findings in the three scoped files.

Root integration QA still needs to inspect the actual lighting and material response, native forward/reverse scroll, idle settling, the hero-to-aperture handoff, all three artifact/caption compositions, phone and short-landscape readability, reduced-motion normal flow, context-loss fallback and offscreen/hidden lifecycle. Projection checks are not a claim of measured browser frame rate or completed visual approval.
