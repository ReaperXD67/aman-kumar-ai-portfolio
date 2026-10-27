# Continuous portfolio experience — implementation notes

Research and source audit: 28 October 2026. This is a proposed continuity contract, not a claim that every handoff below is shipped. The root implementation owns the persistent hero/descent scene; this audit changes no application source.

## Direction

Make the page one journey through **a decision becoming a product, its proof, and its author**. Carry identifiable geometry and real artifacts across boundaries. Keep the DOM responsible for readable project evidence, professional actions and native scrolling. Continuity does not require every section to become another WebGL scene or pinned performance.

The strongest immediate connection already exists: the descent finishes with **KarixMC**, and `ProjectXRay` initially selects **KarixMC**. Both use `/assets/karixmc-live.png`. Reuse that exact texture and crop at the arrival; do not replace it with a generic portal, particle wipe or a second presentation of all projects.

## Current seams and concrete changes

| Boundary | Current interruption in source | Implementable continuation |
| --- | --- | --- |
| Hero → descent | `HeroFoundry` owns a `SignalCore` scene and its own journey; `CognitiveDescent` starts another camera/world. | One persistent renderer and camera authority. The hero's execution strands extend into the first corridor rails while the camera crosses the same aperture. Preserve the hero object's position/orientation through the overlap; a camera interpolation alone cannot hide unrelated geometry. |
| Descent → Work | `App` inserts the full `SignalBand` marquee and four-metric mosaic before `ProjectXRay`; Work then has a large heading, filmstrip and project title before its lens. | Put the first Work capture on the arrival path. Move the metrics after the first inspection or integrate their useful facts into existing proof. The final Karix plane comes forward, squares to the screen and docks to the real `.xray-surface` capture rectangle. Ensure this destination is actually visible; docking to an offscreen lens is not a handoff. |
| Work → Method | Dark project instrument ends; a large pale heading restarts the story; `MethodField` creates a fresh, seeded 84-particle system. | Carry one selected **source-grounded architecture path** out of the instrument. Its endpoints seed the first chamber arrangement, then redistribute into the existing evidence/control/infrastructure/interface targets. Let the chamber's physical edge reveal the pale editorial surface as it passes. Keep the existing four controls and do not auto-cycle them. |
| Method → Identity | A separate reveal raises/fades the portrait instrument; the thesis compiles independently. | End the chamber with its output boundary resolving into the portrait instrument's rectangular frame. Keep the human photograph as the default and let its existing finite pixel assembly finish clearly. Compile “Accountable” as the conclusion of those visible safeguards. Do not turn the face into a synthetic morph, force System view, or repeat the hero Loom as the identity object. |
| Identity → career → résumé → contact | These already form a useful editorial reading sequence. | Use the same frame width, rules and typography as the resolved identity instrument. Preserve native tabs, PDF dialogs and stable actions. This part should settle into clarity; another camera flight would compete with the recruiting task. |

These are complementary transformations: **strand → corridor**, **capture plane → product lens**, **architecture endpoints → validation field**, **output boundary → human frame**. They should not all use the same fade, scale or particle burst.

## Small shared contract

- A shared scroll ref is the only high-frequency journey input. Derive semantic windows from measured section boundaries, not independent competing camera tweens. Use React state for discrete controls, not per-frame pose.
- Keep one camera writer. Evaluate hero and flight target poses independently, then blend position, quaternion and FOV in their overlap. Use the *same eased parameter* for all three. The world and hero should read this pose, not call `camera.lookAt()` after the director.
- At a seam, source final pose must equal destination initial pose; match position, quaternion, projection and geometry frame. Zero derivative at both ends helps a short blend, but an eased stop should not be inserted into an otherwise continuous flight. Test both scroll directions.
- Carry a real project identity (`karixmc`), image URL, contain/crop rule and accent into Work. Measure the **image rectangle inside `.xray-surface`**, not the surrounding `.xray-lens`; the current lens has significant padding and caption height. Invalidate that measurement after resize, font settlement and layout refresh.
- While a capture docks, have one visible owner. When the projected artifact and DOM capture coincide, change ownership without a visible reset. Keep the DOM surface present underneath and interactive immediately afterward. A fast skip or direct `#work` entry should show the DOM destination immediately, not replay the entire journey.
- Keep Work's explicit project-switch handoff local. Its existing native scroll-to-visible-lens behavior belongs to a visitor's selection; the overall journey must not introduce automatic section scrolling, custom wheel capture or a second pin.
- Optional later extension: pass normalized architecture endpoints plus selected project ID into Method once on entry. User interaction owns the chamber from that point onward; scrolling back must not repeatedly erase the selected principle.

## Primary-source engineering lessons

### Persistent renderer and resource ownership

R3F documents material/geometry compilation cost and recommends keeping stages mounted with visibility changes where practical. Preserve the hero/descent Canvas and shared resources across their seam; hiding a world must also stop its own animation requests. Scope asset Suspense to loaded content so a late project texture cannot blank the already-visible hero. This is an application of the documented lifecycle guidance, not a claim that every scene should stay allocated forever. [R3F performance pitfalls](https://r3f.docs.pmnd.rs/advanced/pitfalls)

Keep Canvas and its error/context-loss boundary stable. Actual WebGL loss needs the static composition; leaving a section or intentionally disposing an old renderer is not an application failure. The default Canvas supports a DOM fallback and automatic container measurement. If replacing it with a custom `createRoot`, resize must be supplied explicitly. [R3F Canvas](https://r3f.docs.pmnd.rs/api/canvas)

### Demand rendering and frame order

With `frameloop="demand"`, ref mutations require `invalidate()`. It schedules a future frame and repeated calls coalesce. Request another frame only while a visible animation or damped pose remains unsettled. Schedule the initial frame before starting a synchronous animation. A mounted hidden world must not keep invalidating. [R3F scaling performance](https://r3f.docs.pmnd.rs/advanced/scaling-performance)

Use a deliberate order: shared progress/pose evaluation at negative priority, object updates next, one final compositor. R3F executes frame callbacks in ascending priority; positive priority takes responsibility for rendering, whereas negative priority only orders callbacks. Avoid two composers or another `gl.render` after the final pass. Read Canvas `size`/`viewport` inside the R3F tree; nested camera property mutations are not themselves reactive. [R3F hooks](https://r3f.docs.pmnd.rs/api/hooks)

### Camera rotation

Use normalized quaternions and `slerpQuaternions(source, destination, t)` for a scroll-addressable orientation. Do not independently interpolate Euler angles through a bend. For temporal damping, use a frame-rate-independent factor such as `1 - exp(-rate * delta)` and snap when settled; for deterministic reverse scrubbing, evaluate the same source/destination poses from the same progress. `rotateTowards` accepts an angular step and avoids overshoot, but a constant angular step alone is not a scroll-addressable camera path. [Three.js Quaternion](https://threejs.org/docs/pages/Quaternion.html)

### Resize, refresh and cleanup

Use scoped `useGSAP` cleanup; delayed animation creators need `contextSafe`, and dependency-driven rebuilds need `revertOnUpdate` when prior animations must be reverted. Remove native observers, listeners and rAF callbacks separately. [GSAP React](https://gsap.com/resources/React/)

After fonts, loaded media or an expanded panel changes layout, refresh measured journey boundaries. `ScrollTrigger.refresh(true)` permits the DOM to settle first; ordinary scroll updates do not need repeated refreshes. Refresh temporarily resets scrubbed animation for measurement, so scene state must resolve from the final refreshed progress, without remounting the world or treating that temporary measurement state as a user command. [GSAP ScrollTrigger.refresh](https://gsap.com/docs/v3/Plugins/ScrollTrigger/static.refresh()/)

## Acceptance checks remaining for implementation

1. **Actual continuity:** record a slow forward and reverse traversal of each implemented seam. Compare geometry, capture crop, camera heading and projection immediately before/after ownership changes; no black frame, duplicate artifact or reset.
2. **Native navigation:** cold-load `#work`, `#method`, `#about`, return from a résumé dialog, use browser Back and rapidly reverse scroll. No cinematic replay gate or forced return to the hero.
3. **Controls:** hero mode/pause remains authoritative; Work switching and keyboard arrows remain readable; Method tabs and Person/System controls retain focus and current selection.
4. **Layouts:** verify 320/390px, tablet landscape, short desktop and large desktop. Measure the Work capture destination after orientation/viewport changes. Neither the fixed header nor mobile action tray may obscure controls.
5. **Rendering:** count WebGL contexts during the hero/descent seam, confirm one final compositor, inspect frame requests after the canvas is offscreen or the tab is hidden, and confirm a single current frame on return.
6. **Fallback:** reduced motion, no WebGL and real context loss show complete project proof and the natural portrait without waiting for flight completion. Preserve the resume and contact routes.

## Implemented Work → Method subset

`MethodField` now accepts `entrySignal={{ projectId, layerIndex }}`. It consumes the exported `XRAY_CIRCUITS` and `circuitPath` from the existing X-ray renderer; `methodEntryGeometry.js` samples those rendered paths, including their authored `via` bends. Each node is retained and the remaining particles are distributed by actual route length, for 84 source points in total. There is no second project topology or activity feed.

The latest supplied selection is sampled until the chamber canvas is at least 12% visible. Its project/layer provenance then locks, and a finite 1.2-second transfer redistributes those source points into the current principle's existing pattern. Visible frame time drives that transfer; hidden/offscreen pauses preserve elapsed time. Returning does not replay it. Pointer interaction or principle-tab interaction takes control immediately, including a click/focus on the already-selected tab. Principle changes retarget existing particles instead of rebuilding the canvas lifecycle. Reduced motion draws the settled target without an animation loop.

DOM inspection is available through `data-entry-project`, `data-entry-layer` and `data-entry-state` (`pending`, `transferring`, `settled`, `interactive`). The project/layer report the source actually consumed; changing Work after that does not silently relabel a completed transfer. Root integration owns the actual `entrySignal` wiring and explanatory paragraph.

Source validation passed for all 24 actual project/layer circuits: all 84 particles lie on an authored node or route, including guard/return paths, and all fitted coordinates remain in bounds at 320, 390 and 960 pixel widths. A source-level mocked canvas/rAF lifecycle check passed finite completion, latest-source-before-entry, locked source afterward, hidden/offscreen pause, no replay, stage/pointer interruption, reduced-motion settling and listener/frame cleanup. Full browser verification remains part of the root integration; these checks do not claim a visual recording or deployed result.

This scoped implementation changes only `src/MethodField.jsx`, the new pure geometry helper and this research note. It adds no dependencies, profile changes or deployment.
