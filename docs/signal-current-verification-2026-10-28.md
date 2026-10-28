# Signal Current — delivery verification

28 October 2026. Replaces the reflective sheet described in the [historical ending record](cinematic-ending-verification-2026-10-28.md). Primary references and license findings are in the [research record](signal-current-research-2026-10-28.md).

## Implemented behavior

The ending now uses an original GPU particle current: 23 open filament paths change from loose signals into a vertical portrait plume, routed evidence streams and an outbound contact convergence. The same static particle seeds persist through the transformation. Visible active time carries luminous packets along those paths; the shader also gives them slight depth movement. There is no opaque surface, reflection environment, CPU vertex/normal rebuild, downloaded model or new dependency.

`signal-current.js` owns deterministic seed generation, analytical GLSL paths, soft elongated sprites, the authored camera and finite delta-based damping. `ContinuationSignal.jsx` uses one `THREE.Points` draw with 12,000 wider-screen / 4,000 phone points, additive light, DPR at most 1.35 and at most 1.2 million backing pixels. It starts lazily, stops hidden/offscreen, freezes active time while paused, and renders a stable reduced-motion composition. The pause button in Method and the Signal OS command share one state. Pausing ambient flow still permits a finite scroll-driven camera settle.

`CinematicContinuation.jsx` measures native reading surfaces against the sticky stage. The shader softly attenuates particles before their centers reach the whole photograph, words, evidence or controls; a six-pixel inner guard exceeds the sprite radius. Hard clipping applies only to fixed chrome and the owner's visible intersection. A pre-render refresh resolves native scroll changes before drawing, avoiding a frame with stale text protection. The camera follows an authored route rather than steering toward a content-dependent centroid.

The real portrait, its finite assembly and Person/System controls remain native. The portrait now fits its grid column instead of its minimum height forcing it into the gutter. Shorter phone gaps replace the previous sheet runways. Opening capture/text protection and safe-area-aware action-tray clearances remain intact. The final current discharges before the footer. Contact remains a native paper form and opens a draft only when the visitor requests it.

## Local checks

- `npm run build` succeeds and produces the client, server and hosting files required by Sites.
- `npm run test:motion`: 24 passing source/math checks, including seeded inputs, continuous camera, frame-rate-independent damping at 30/60/120 Hz, long-pause delta bounding, reversal and exact finite settling.
- `npm run test:sites`: four passing hosting checks. `npm run test:profile`: fourteen passing identity/manifest checks. Total: 42 Node checks.
- `python scripts/verify-resume.py`: PASS. The canonical PDF remains one page, photo-free, selectable and byte-identical at SHA-256 `e690160bf8cdd22b1d13b7a7086b27d4f7baba50aaee1b0e5f38e8cf741447b5`.
- The build retains the existing shared-chunk size warning. This change does not claim an FPS result or a physical-device performance measurement.

## Browser and release evidence

- At 1280 × 720 and 1440 × 1000, the approved portrait and full identity thesis stay clear. The current occupies their gutter and surrounding negative space, then opens into the career/evidence passage. The renderer reports WebGL with 12,000 points and no shader errors in the inspected console.
- At 390 × 844, the portrait entry and ten forward PageDown states cover identity copy, career, education, both documents, contact and footer. None reports horizontal overflow. Saved screenshots received a second-agent visual review with no material face/text/control overlap or blank-screen break. Rapid reverse PageUp inputs restore the field and camera through the proof passage.
- A fresh 320 × 568 `#about` entry keeps the face clear and the portrait inside its column. Direct `#contact` aligns beneath the 68px header. A temporary name can be entered; Tab reaches email; the value is cleared without submitting or opening a mail draft.
- On desktop, Method's pause button freezes active time at exactly `52.764` seconds across separate observations. Signal OS finds the matching resume command; Enter closes the dialog and resumes flow. Paused flow releases its animation loop after settling.
- At the phone footer, coordinate `4`, completion `1` and canvas opacity `0` leave the footer links and action tray clear. The owner clipping also protects the footer independently of that fade.
- At 844 × 390, Method and contact direct links align below the short-landscape header without horizontal overflow. The current remains outside the heading and native controls; the inspected console contains no errors.

These are browser viewport checks, not physical-device, on-screen-keyboard or FPS measurements. Reduced-motion, hidden/offscreen suspension, context loss and unavailable-WebGL behavior are additionally source-reviewed; the camera still and damping have automated checks.

The Git integration publishes `main` to the canonical Vercel alias. Delivery verifies the deployment's exact commit and READY state, CI result, and public entry/CSS/PDF bytes against the local build. Release identifiers, screenshot files and machine-readable observations belong in ignored `artifacts/signal-current/`; the final delivery response reports publication status. A source/math pass alone does not prove publication.
