# Signal Current — delivery verification

28 October 2026. This record covers the **photo-colour peel revision**. The [research record](signal-current-research-2026-10-28.md) retains primary references and provenance. Earlier sheet and fixed-palette iterations are historical.

## Implemented experience

Particles peel from continuous origins across 52–88% of the actual portrait's right edge, follow the scroll-controlled 3D route and tighten into a final curl at contact. Each seed retains a colour sampled from the photograph's rightmost 12% at its birth height. The former quantized rows and gold/ivory/acid particle palette are replaced by continuous grain and photo-derived charcoal and kurta gold. The photograph itself remains fixed and recognizable, with its original finite 2.85-second assembly and Person/System/replay controls.

`portrait-colours.js` matches native `object-fit: cover; object-position: 50% 32%` cropping. The renderer reads the already-decoded image into a cached 64 × 64 canvas and bilinearly samples a static RGB attribute. A bounded uniform exposure lift preserves channel ratios in dark grain. Normal alpha blending avoids washing the sampled colours into additive white. Colours persist through travel and the receiver curl.

The existing 160px hero thumbnail is an export of the same photograph and supplies a cold ending link while the full image remains lazy. The full photograph upgrades the palette when available. Cached colours survive Person/System switching. Source/crop/count changes rebuild colour data; ordinary animation frames do not read image pixels or rebuild vertices. A load event invalidates paused/reduced stills. A failed readback retains the previous palette or a finite conservative fallback, identified in renderer diagnostics.

Damped scroll position drives transport and the camera; endpoints follow native scrolling immediately. Phones keep the current in the photo's exterior gutter before releasing below it. The receiver remains connected until actual footer entry fades the stage. Pause freezes transport, hidden/offscreen stages suspend and reduced motion receives a still.

Native photo, reading plates and paper form remain above the stage in the compositor, covering stale WebGL frames during fast native scrolling. Exact photo/form fragment rejection, soft content guards and hard header/tray/owner clipping remain as additional protection. The current stays pointer-transparent.

## Performance and build

- One points draw retains **12,000 desktop / 4,000 phone particles**, static motion buffers, analytic path/tangent, a **1.2-million backing-pixel / DPR-1.35 cap**, deferred scene loading, cached masks/camera and throttled diagnostics.
- No new asset request, GPU image texture or dependency is introduced. A static RGB attribute adds 144,000 desktop / 48,000 phone bytes; the cached RGBA image read is 16,384 bytes.
- The main entry remains **667,034 raw bytes**, unchanged in size from the preceding release. Reproducible Python gzip is **216,725 bytes**. The lazy current module is **17,929 raw / 7,194 gzip bytes**, versus 14,923 raw bytes previously. These are build-file sizes, not wall-clock loading, total transfer, FPS or physical-device results.
- The production build passes and emits `dist/client/index.html`, `dist/server/index.js` and `dist/.openai/hosting.json`. The existing large-chunk warning remains. Sites handoff infrastructure files are untouched.

Pixel readback follows the [Canvas ImageData API](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/getImageData), and colours use a static [Three.js BufferAttribute](https://threejs.org/docs/pages/BufferAttribute.html). The project's emitted files and cache boundaries establish the claims above.

## Automated evidence

- `npm run test:motion`: **33 passing checks**. Four new colour checks cover native crop at wide/tall ratios and thumbnail equivalence, continuous birth UVs, bilinear photo RGB sampling, bounded hue-preserving exposure and finite fallback. Existing route, camera, damping, registration, footer and opening geometry checks pass.
- `npm run test:profile`: **14 passing checks**, with the canonical photo-free résumé unchanged.
- `npm run test:sites`: **4 passing checks** after the production build.
- **51 Node checks pass in total.** These source/math and hosting checks do not render the effect.

## Browser evidence

A batched inspection of the production preview found no blocking visual defect; no additional visual revision was needed.

- At **1440 × 1000**, the renderer reports `palette=portrait`. Charcoal upper grain and gold lower grain visibly peel from the real photo, while face, nameplate, copy and professional links remain clear. The central source stays approximately `(548.04,618.60)`. A second agent's screenshot/code review found no colour mapping or protection defect.
- A cold **1280 × 720** direct contact link reports `palette=portrait-thumbnail`, with full-photo natural width still zero and thumbnail ready. The real-photo colours converge at the paper form's top receiver, without forcing the full offscreen image to load.
- At **390 × 844**, the source remains `(362.50,474.55)` with 4,000 points and `palette=portrait`. Forward PageDown samples cover identity, career, education, résumé, certificate, contact and inputs. Face, text and paper form remain clear in mid-scroll captures; every observed state has no horizontal overflow.
- A temporary name is entered, Tab focuses email and the value is cleared. No submission or mail draft occurs. Footer completion reaches one and clears the current; reverse PageUp restores completion zero with the photo palette retained.
- Person/System switching temporarily removes the photograph while retaining `palette=portrait`. Return/replay sets source readiness zero during assembly, then restores the resolved photo and readiness one.
- Pause freezes active time at exactly **144.424** across navigation from Method to portrait; the camera finishes settling and reports paused. Palette remains `portrait`.
- At **320 × 568**, the face and native controls stay clear, with the photo palette, 4,000 points and no horizontal overflow.
- At **844 × 390**, direct contact retains the photo-thumbnail palette and a clear native heading without horizontal overflow. Inspected browser consoles contain no errors.

Browser viewport checks do not establish physical-phone, on-screen-keyboard or measured FPS results. Reduced-motion, unavailable-image and context-loss behavior are source-reviewed in addition to the automated still/damping tests.

## Release verification

Screenshots, observations and file-size evidence are in ignored `artifacts/portrait-colours/`. Delivery verifies the pushed commit, CI success, Vercel READY state and canonical alias JavaScript/CSS/PDF bytes against the tested build. Release identifiers are stored with those artifacts and reported separately from local checks.
