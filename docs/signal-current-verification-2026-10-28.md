# Signal Current — delivery verification

28 October 2026. This record describes the fuller **portrait-edge peel revision**. Primary inspiration and provenance remain in the [research record](signal-current-research-2026-10-28.md); the [contour/sheet record](cinematic-ending-verification-2026-10-28.md) is historical.

## Implemented experience

One GPU particle cohort peels across 52–88% of the real portrait's right edge, curls into 31 layered strands and converges at the native contact form's measured top receiver. Seven percent of seeded particles maintain a short moving edge cohort; the central source and receiver retain exact registration seeds. The broader body, larger sprites and helical depth use the same 12,000 desktop / 4,000 phone budget. The approved photograph stays fixed and recognizable, with its finite 2.85-second assembly and Person/System/replay controls.

Damped reading position now drives particle advection as well as the continuous camera orbit/dolly. Forward and reverse scrolling move the flow through the route; visible active time supplies gentle transport at rest. Native endpoints update immediately, independently of the decorative camera, with only far-offscreen endpoints bounded. The full measured image span follows the same bound. Phones keep the peel in the photograph's exterior gutter before releasing below it.

The foreground stage occupies native gaps. Opaque reading plates, portrait and paper form sit above it in the browser's compositor, so fast native scrolling cannot expose stale particles over content. This closes a race found in the first mobile inspection. Shader portrait/form rejection, soft content guards and hard header/tray/owner clipping remain as additional protection. Contact stays connected at coordinate four; actual footer entry fades the current.

Pause freezes time and scroll transport while native ports remain registered and the camera can finish settling. Hidden/offscreen stages suspend; reduced motion receives a still. Rendering remains one static-buffer points draw, capped at 1.2 million backing pixels and DPR 1.35. No new dependency, texture, reflection environment or CPU vertex rebuild is introduced.

## Loading and runtime work

- The ending renderer is dynamically imported within 900px of the ending, or immediately for a direct ending hash. The native interface can render independently of Three.js. A direct ending link starts with the opening scene disabled until its observer brings it into view. The full portrait is browser-lazy-loaded; the small hero thumbnail remains immediate.
- The vertex shader computes one path and its analytic tangent rather than evaluating the full path twice per particle.
- Unchanged native masks and camera matrices are reused. Diagnostics update at most approximately seven times per second, with immediate state changes. Geometry and guard updates remain immediate on real layout/scroll changes.
- The emitted entry shrank from **1,415,077 to 667,034 bytes (52.9%)**. Python gzip with fixed mtime shrank from **410,220 to 216,724 bytes (47.2%)**. These compare the previous shipped bootstrap with this build; they are not total-transfer, wall-clock loading, FPS or physical-device measurements. Shared 3D chunks still load when needed. The build retains the large-chunk warning.

The split follows [Vite's asynchronous chunk-loading mechanism](https://vite.dev/guide/features.html#async-chunk-loading-optimization); the implementation and emitted files are the evidence for this project's measured entry reduction.

## Automated evidence

- `npm run test:motion`: **29 passing source/math checks**. The new coverage check verifies that both phone and desktop seeds populate the complete peel band. Port tests include full-span translation and offscreen bounds. Existing checks cover camera continuity/reversal, frame-rate-independent damping, finite settling, route, capture and opening geometry.
- `npm run test:profile`: **14 passing checks**. The canonical photo-free résumé and identity assets remain unchanged.
- `npm run test:sites`: **4 passing checks**, repeated after the final build. The Node total is **47**.
- `npm run build` passes and emits the required client, server and hosting outputs. The Sites handoff files remain intact.

## Browser evidence

The first batched inspection found brief particles over the orange career rail and paper form during fast PageDown scrolling. The native compositor-layer correction was applied as one batch and confirmed in the rebuilt production preview.

- At **1440 × 1000**, the broad fan visibly leaves the real portrait edge; the central port remains at approximately `(548.04,618.60)`. The continuous camera and transport follow scrolling. At contact, the receiver is `(723.10,165.48)`, half a pixel above the form top; coordinate `3.9999` retains completion `0`.
- At **390 × 844**, the photograph and nameplate remain clear, with the central source at `(362.50,474.55)`. The confirmation route samples identity copy, career, education, résumé, certificate, contact introduction, inputs and footer. All observed states report no horizontal overflow. The corrected career rail and form remain clear even in mid-scroll captures.
- A temporary name is entered, Tab focuses the email input, and the value is cleared. No submission or mail draft occurs. The pointer-transparent stage does not block the form or professional controls.
- Footer entry completes discharge; reverse PageUp restores the current. The final mobile evidence records native content at z-index 3, stage at 2 and the content wrapper at auto, avoiding the previous stacking trap.

- At **320 × 568**, the face and native controls remain clear with 4,000 points and no horizontal overflow. Replay changes the portrait to assembling and source readiness to zero, then restores resolved/readiness one after the finite entrance.
- At **844 × 390**, direct contact aligns below the header at approximately y=59px, with clear native heading and no horizontal overflow. The inspected consoles contain no errors.
- The Method pause button freezes active time at exactly **5.986** while navigation moves the route from Method to portrait and the camera finishes settling. Resume restores flow. Portrait and form remain native interaction surfaces throughout.

Browser viewport checks do not establish physical-phone, on-screen-keyboard or measured FPS results. Reduced-motion and context-loss paths are source-reviewed in addition to the camera/damping tests.

## Release verification

Screenshots, browser observations and entry comparison are stored in ignored `artifacts/portrait-peel/`. Delivery verifies the pushed commit, CI success, Vercel READY state and canonical alias asset bytes against the tested build. Those release identifiers are stored with the delivery artifacts and reported separately from local checks.
