# Signal Current — delivery verification

28 October 2026. This record describes the **portrait-attached current revision**, its passing local production build and browser checks. Primary references and license findings remain in the [research record](signal-current-research-2026-10-28.md); the [contour/sheet record](cinematic-ending-verification-2026-10-28.md) is historical.

## Implemented attachment

One foreground GPU particle cohort connects the real portrait to the native contact form. `PortraitSignal.jsx` retains the photograph, finite 2.85-second assembly and Person/System/replay controls. A native gold seam spans 62–76% of the image-stage height. `portrait-current-route.js` places the source half a CSS pixel outside the portrait's right edge, centered at 69% of the image height, and the receiver half a pixel above the form at `left + min(48px, 12% width)`. The form has a matching native edge cue. The visible source waits for the portrait assembly to resolve; there is no copied face, photographic dissolve or moving portrait texture.

`CinematicContinuation.jsx` measures these ports against the actual sticky stage and observes portrait state changes. Visible endpoints retain their native coordinates; already-far-offscreen ports are bounded to preserve numerical precision. Endpoints and protection update immediately with native scrolling, independently of decorative camera damping. A pre-render refresh prevents a flowing frame from using an outdated scroll position.

`signal-current.js` constructs one 3D Bézier spine between those ports, with helical filament depth, gold/ivory/acid packets and persistent endpoint particles. The interior responds to the stronger authored camera orbit and dolly while endpoints stay registered in view space. `ContinuationSignal.jsx` uses one additive `THREE.Points` draw with 12,000 wider-screen / 4,000 phone points, DPR at most 1.35 and at most 1.2 million backing pixels. Seeds stay static; no CPU vertex rebuild, reflection environment, downloaded asset or new dependency is introduced.

The foreground fragment shader rejects every pixel inside the complete portrait and contact-form rectangles, including sprite halos at their attachment points. Other words, evidence and controls retain six-pixel inner guards with soft exterior attenuation. Header, professional-action tray and owner bounds retain hard clipping. The current stays visible at contact coordinate `4`; fade now follows actual footer entry and completes at document end.

On phones, the projected stream stays in the photograph's exterior gutter before releasing smoothly into the gap beneath it. This avoids a disconnected offscreen arc. Portrait readiness fades the current gently after assembly or replay; neither endpoint registration nor the protection masks are damped.

Visible active time drives flow. Pause freezes that time while allowing finite scroll/camera settling; Method and Signal OS share one pause state. Hidden/offscreen stages suspend, reduced motion receives a settled still, and native content remains independent of WebGL. Shorter native reading gaps, stable form inputs and direct links are retained.

## Automated evidence

- `npm run test:motion`: **28 passing source/math checks**. Four new helper checks cover portrait/contact registration at 320/390/844/1440px, immediate scroll/sticky translation, offscreen bounds/invalid geometry and footer-based exit. Existing checks cover deterministic seeds, continuous camera, reversal, 30/60/120 Hz damping, long-pause bounds and finite settling.
- Four Sites checks and fourteen profile checks bring the Node total to **46**. These suites cover hosting and canonical identity/manifest contracts; they do not render the attached current.
- `npm run build` passes and emits the required client, server and hosting files. The existing shared-chunk warning remains. No FPS, physical-device or on-screen-keyboard result is claimed.

## Browser evidence

- At 1440 × 1000, the source is visibly attached to the photo's right border. Its measured point `(548.04, 618.60)` follows the native frame. The contact receiver is `(723.10, 165.48)`, half a pixel above the form's measured top. At contact coordinate `3.9999`, completion remains `0`, so the connection persists.
- At 390 × 844, the portrait source is `(362.50, 474.55)` beside a frame ending at x=362. The corrected current follows the outside gutter and opens below the frame. Sampled forward states cover portrait, identity copy, career, education, both documents, contact and footer; no state reports horizontal overflow. A second agent's screenshot review found no particle overlap with face, text, controls or inputs and no detached source.
- The mobile form receiver is `(59.28, 252.02)`, half a pixel above its actual top. A temporary name can be entered, Tab focuses email, and the value is cleared without sending or opening a mail draft. Native links and controls remain usable beneath the pointer-transparent canvas.
- Replay changes source readiness to `0` and fades presence toward zero; after the finite portrait assembly, readiness/presence return to `1`. Person/System toggling remains functional. Signal OS pause freezes active time at exactly `42.179` across separate observations; the resume command restores flow and closes the dialog.
- At the phone footer, coordinate `4`, completion `1`, opacity `0` and motion `complete` leave the footer clear. Three rapid reverse PageUp inputs restore the current at coordinate `3.5343`, completion `0`, without horizontal overflow.
- Fresh 320 × 568 portrait entry keeps the face clear. Direct contact aligns below the 68px header. At 844 × 390, Method and contact direct links remain readable without horizontal overflow; contact aligns at y≈60. The inspected browser consoles contain no errors.

These are browser viewport checks rather than physical-device, on-screen-keyboard or FPS measurements. Reduced-motion, hidden/offscreen suspension and unavailable-WebGL paths are source-reviewed; camera stills and damping also have automated checks.

## Release verification

New screenshots and observations are in ignored `artifacts/portrait-current/`. Delivery verifies the pushed commit, CI result, Vercel READY state and canonical alias JavaScript/CSS/PDF bytes against the tested build; release identifiers are stored alongside that evidence and reported in the delivery response. Publication is separate from source/math and local browser checks.
