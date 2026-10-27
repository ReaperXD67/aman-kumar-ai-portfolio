# Project handoff research — 27 October 2026

The user's latest direction calls for a clearly cinematic transition between real portfolio projects. The incumbent eight alternating vertical shutters were flat and read as a generic wipe. The replacement uses an original, bounded perspective composition inside the existing Engineering X-ray lens.

## Primary references inspected

| Source | Relevant mechanism | Application here |
| --- | --- | --- |
| [Creative WebGL Image Transitions](https://tympanus.net/codrops/2019/11/05/creative-webgl-image-transitions/) and its [actual source](https://github.com/akella/webGLImageTransitions) | A continuous progress value reshapes image coordinates; image identity survives a substantial transition. | Preserve real capture fragments through a continuous handoff. No shader/source/assets copied; no new WebGL context. The old resource's custom redistribution terms are not relabeled MIT. |
| [Animating in Frames: Repeating Image Transition](https://tympanus.net/codrops/2025/04/28/animating-in-frames-repeating-image-transition/) and [source](https://github.com/codrops/RepeatingImageTransition) | Image repetitions follow coherent paths with bounded step timing and rotations. | Six regions of one outgoing capture separate, then follow a common curved depth trajectory; the incoming capture seats in four planes. Original layout/timeline; no demo scripts or generated art reused. |
| [Image to Grid Transition](https://github.com/codrops/ImageToGridTransition/) | An image retains continuity as its geometry changes into a structured grid. | Complete old capture at the beginning; complete next capture at the end. Replace arbitrary alternating strips with one spatial volume. No Flip dependency needed for this fixed lens. |
| [Scroll refraction and shader effects in Three.js and React](https://tympanus.net/codrops/2019/12/16/scroll-refraction-and-shader-effects-in-three-js-and-react/) | Explicit spatial transforms and responsive geometry; DOM/canvas tradeoffs. | Read the surface geometry once and reduce depth on narrow lenses. Keep accessible product DOM/controls underneath. No canvas or warping required for this short interaction. |
| [GSAP React guidance](https://gsap.com/resources/React/) | Scoped useGSAP, automatic context cleanup and context-safe delayed callbacks. | A keyed transition per project pair; rapid selection/reduced-motion unmount kills the old timeline and timeout. Existing installed GSAP; no new package or remote runtime. |

## Authored sequence and budget

The outgoing capture begins intact, separates into a 3 × 2 surface, lifts toward the visitor and arcs left/backward while rotating through perspective. The next capture assembles from four rear/right planes into the ordinary image frame. Registration corners briefly confirm arrival. Captions and controls belong to the already-rendered new instrument, which remains present and interactive underneath.

An explicit new-project selection brings the lens into view **only when less than 62% of its available stage is visible**. Its top lands 16 px below the measured fixed header; a visible bottom action tray is excluded from the usable viewport. Selection and source content update immediately. Scrolling uses the browser's native smooth behavior; reduced motion is immediate. Keyboard tab focus uses preventScroll so subsequent arrow cycling does not jump back to the filmstrip.

The plane timeline waits for that same visibility rule before playing. It finishes at 1.04 seconds, with a 1.08-second wall-clock escape **after playback starts**. A canceled/offscreen wait expires after 1.4 seconds; it cannot surprise a visitor much later. Proximity uses a passive, frame-throttled listener and an IntersectionObserver, without pinning, wheel handlers or a custom scroll driver. Rapid selection/unmount cancels observer, listeners, frame request, timeout and old GSAP context.

Ten temporary planes share the existing cached image URLs and animate transforms/opacity only. No new GPU context or continuous render loop. The overlay is decorative, aria-hidden and pointer-events:none. Same-project selection has no scroll or transition. Reduced motion renders the real next project directly, with an additional CSS media-query guard.

Implementation: `src/ProjectPortal.jsx`, separately imported `src/project-portal.css`, and the small selection-to-stage effect in `src/ProjectXRay.jsx`. The obsolete shared shutter rules were removed from `src/project-xray.css`; other X-ray styles, project facts, source links, hero and descent remain outside this change. It introduces no loading screen or disabled controls.

Validation follows browser inspection and the root build. References establish useful mechanisms, not a claim that every portfolio was inspected or objectively ranked.
