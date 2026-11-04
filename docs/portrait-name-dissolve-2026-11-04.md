# Portrait typography dissolve — 4 November 2026

Aman requested that the moving AMAN and KUMAR lettering dissolve into portrait-coloured particles, then gather into contact as one fluid scroll transition. The existing composition, clear face, mobile reading route and authorized GitHub workflow remain the constraints. This extends the [name-motion refinement](portrait-name-motion-2026-11-04.md).

This record describes the original dissolve release. The subsequent [particle-presence refinement](portrait-current-presence-2026-11-04.md) updates its density, exposure, swirl and contact coil, with separate validation.

## Source comparison

Sources were inspected on 4 November 2026. No upstream implementation was copied and no dependency was added.

| Candidate | Provenance and maintenance | Decision |
| --- | --- | --- |
| Three.js custom-attribute particles | Inspected the [r185 example](https://github.com/mrdoob/three.js/blob/r185/examples/webgl_custom_attributes_points.html) and [MIT license](https://github.com/mrdoob/three.js/blob/r185/LICENSE), copyright 2010–2026 Three.js authors. The maintained project released [r187 on 30 October 2026](https://github.com/mrdoob/three.js/releases/tag/r187). | **Adapt the pattern:** static attributes in the existing `BufferGeometry`, one `Points` object and original shader. Retain the installed 0.185.1 dependency. The example's texture, additive blending, 100,000-point budget and per-frame CPU uploads do not fit this ending. |
| Troika text | Inspected [documentation](https://protectwise.github.io/troika/troika-three-text/), main commit `9c89d51f828f94a21e33d6f24b38128d78014d5f` dated 2 November 2026, and [MIT license](https://github.com/protectwise/troika/blob/main/LICENSE), copyright ProtectWise 2019 and Jason Johnston 2021. The repository was unarchived. | **Defer:** its SDF atlas, worker/font parsing and separate text layout are useful for general 3D text but unnecessary for two existing native words. Keep that machinery outside this renderer's loading path. |

Canvas sampling follows the browser's [letter-spacing API](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/letterSpacing), [font bounding metrics](https://developer.mozilla.org/en-US/docs/Web/API/TextMetrics/fontBoundingBoxAscent) and [font-loading readiness](https://developer.mozilla.org/en-US/docs/Web/API/Document/fonts). These references support the sampling design; they do not establish visual alignment or performance on the portfolio.

## Implementation

- The stage exit supplies a reversible clock: `(viewportHeight * .2 - stageTop) / min(stageHeight, viewportHeight)`. AMAN's phase spans .04–.40 and KUMAR's .18–.62. The clock is independent of the photograph's viewport-dependent depth pose, so names first remain readable and then dissolve as their stage leaves the reading area.
- Two CPU masks sample the loaded native font, weight, letter spacing and line-box baseline. KUMAR uses its actual stroke. Sampling is cached by text, font and layout; glyph origins become a static `aTypeOrigin` buffer. Native offsets and the same centered perspective projection register particles to the moving letters. No GPU glyph texture or per-frame pixel read is added.
- Opposing CSS mask fronts and per-particle release thresholds erase lettering into grains. The middle 36% of the existing budget supplies these grains; 14% portrait roots and 10% contact receivers remain intact. Glyph grains inherit the cached portrait colours, curl outside the portrait before joining the existing analytic spine, and gather progressively as route scroll approaches contact. The renderer still uses 12,000 desktop / 4,000 phone points and one current-path evaluation per point. The silhouette's vertex guard now protects its interior rather than the entire left half-plane, so left-hand glyph grains remain visible outside the photo bounds; native alpha and fragment guards still protect the face.
- Shared pause freezes release and decorative motion while native geometry stays registered. Reduced motion keeps whole names. Erasure is gated on font-ready glyph data, Person view and successful WebGL rendering. Unsupported sampling, shader failure or context loss restores the native lettering; context restoration invalidates the cached scene before rebuilding the handoff.
- The native silhouette, stationary caption, mobile reading plates and contact form retain their existing occlusion. The 1.2-million-pixel / DPR-1.35 cap, lazy scene loading and hidden/offscreen suspension remain unchanged. No new asset request, renderer, pin or runtime dependency is introduced.

## Verification

- `npm run build` passed; the existing large-chunk warning remains. All 49 motion, 15 profile and four Sites checks passed (68 total).
- Browser inspection covered 1440 × 1000 desktop, 390 × 844 phone and 320 × 568 reduced-motion reading. The full and outlined font masks contained real glyph samples; the fixed particle counts remained 12,000 / 4,000. Projected native row bounds agreed with the matching perspective calculation within 0.32 CSS pixels in the measured desktop pose.
- A 100px phone scroll and its reversal returned from `0.537,0.010` to the identical initial `0.005,0.000` release phases and scroll position. Shared pause kept both CSS erasure edge and glyph phases fixed through scrolling; resume restored live transport. Browser reduced-motion emulation returned `mask-image: none` and `transform: none`, and was cleared afterward.
- Face, caption, reading band and form remained protected in the inspected poses. The contact name input was focused successfully without sending a message. No horizontal overflow or browser console errors were observed. Screenshots and alignment evidence are in `artifacts/name-dissolve-20261104/` (ignored by Git).
- Context-loss restoration was reviewed in source and its invalidation bug fixed; forced browser context loss was not exercised. These observations do not establish an FPS or throttled-network benchmark. CI and deployed-asset checks follow the authorized push and are recorded separately in the artifact directory.
