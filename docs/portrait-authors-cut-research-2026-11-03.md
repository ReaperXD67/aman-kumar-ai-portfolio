# Portrait composition and current research — 3 November 2026

Aman rejected the previous portrait's appearance. The red HUMAN word, gold foreground name and broad particle cloud competed for attention. This refinement makes one full-width composition; career facts, photograph identity, routes and recruiter actions remain grounded in the existing content.

## Primary references inspected

| Reference | Version and maintenance evidence | License | Decision |
| --- | --- | --- | --- |
| [Codrops ScrollTextMotion](https://github.com/codrops/ScrollTextMotion) | `9f05d938f7b38e76e3146f26e393118e7975b6b3`; last push 19 December 2025; not archived; inspected `js/index.js` | [MIT](https://github.com/codrops/ScrollTextMotion/blob/9f05d938f7b38e76e3146f26e393118e7975b6b3/LICENSE), copyright 2009–2025 Codrops | Adapt the principle of text travelling between deliberate compositions. Keep the existing native-scroll director; defer its ScrollSmoother, Flip and ScrambleText stack. This is a demonstration, not evidence of a maintained production animation library. |
| [Codrops SeamTransitions](https://github.com/codrops/SeamTransitions) | `54ce5b6480b0502e0afa8781a6130b84638b77a3`; last push 30 October 2026; not archived; inspected `js/seams/fray.js` and `shavings.js` | [MIT](https://github.com/codrops/SeamTransitions/blob/54ce5b6480b0502e0afa8781a6130b84638b77a3/LICENSE), copyright 2009–2026 Codrops | Adapt source-coloured fragments and ordered boundary structure: Fray uses spaced threads; Shavings gives fragments coherent curl. Defer their image textures, canvas physics, ScrollSmoother and extra renderers. |

No upstream code or artwork was copied. The shader remains an original analytical implementation. Direct reuse of substantial upstream code would require retaining its MIT copyright and permission notice; bundled third-party scripts have separate terms. No dependency or skill pack was added.

## Integrated composition

The portrait spans the page instead of occupying a small card beside a competing headline. Ivory AMAN and outlined KUMAR occupy separate rear planes and travel in opposite directions behind the actual cutout. The photograph uses the existing exact translation/scale projection. A stationary caption carries the real name, role and direct contact link; controls occupy a reserved band. The accountable-intelligence thesis, description and professional links continue in a protected editorial band below. Phones reserve separate photo, caption and control regions.

The old foreground camera fields and their obsolete test were removed. No new image, font, renderer or scroll pin was added. The 168 KiB cutout and original error fallback are unchanged. A wider bottom photographic fade softens the source crop; grains still originate from the real contour.

## Current implementation

The former independently random lane/depth distribution filled a wide helical volume with broad 5.2–8.6px sprites. The revised current groups distant travel into twelve fine fibres. Birth UVs still cover the continuous 52–88% silhouette contour; cached alpha and portrait colours remain unchanged. Independent grain phases travel along coherent lanes and depths. Bézier endpoints, source/contact cohorts, camera, analytical tangent, mobile gutter and occlusion guards are retained.

Idle advection changes from 0.042 to 0.014 cycles/second; scroll advection changes from 0.32 to 0.48 cycles/route coordinate. The receiver curl is gentler, directional sprites thinner and halos smaller. Colours are neither replaced nor additively whitened. These are intended visual changes, not measured performance gains.

The renderer retains one THREE.Points, 12,000 desktop / 4,000 phone particles, static attributes and one analytical path evaluation. No textures, draw calls, per-frame image reads or geometry uploads were added. The point-size cap drops from 11 to 9 CSS pixels before DPR, reducing its theoretical maximum rasterized square area by about 33%; actual frame time was not benchmarked.

## Validation — integrated local production build

- `npm run build` passed, including Sites package outputs. The existing large-chunk warning remains. Raw entry JavaScript is 667,926 bytes and the separate current chunk is 23,376 bytes. Byte counts do not measure FPS or network speed.
- `npm run test:motion`: **43 passed**; `test:profile`: **15 passed**; `test:sites`: **4 passed**. Total **62**. The removed test described the superseded moving foreground name.
- Browser pass at 1440 × 1000, 390 × 844, 320 × 568 and 844 × 390: real cutout visible, rear type occluded by the face, native copy and contact fields clear, no observed horizontal overflow. Short-landscape assembly completed after the photograph entered view; hidden/offscreen time intentionally does not advance it.
- First-pass defects were corrected in one batch: inherited type sizing/margins, initial desktop control/dock conflict and mobile role spacing. Confirmation placed controls at bottom y=911.19 and the dock at top y=930.40; phone section gap is 42px.
- Exercised Person → System → Person, replay (returned to AMAN / ONLINE), forward/reverse navigation, the contact anchor, form focus and shared pause. A paused phone photo pose stayed at 18px during native scrolling. No email draft was opened or sent.
- Shader compiled in the browser. Inspected desktop/phone console error lists were empty. Diagnostics retained alpha contour registration, 4,000 phone points and the sampled portrait palette.
- Local proof is in `artifacts/authors-cut-20261103/`: desktop, phone, phone-reading, small-reading and landscape screenshots. Artifacts are intentionally ignored by Git. CI, production proof and deployed asset hashes are recorded there after the authorized push.

Reduced-motion/fallback geometry remain covered by code/math checks; this pass did not toggle the OS motion setting or simulate image-network failure. No device FPS or throttled-network measurement was made. Production and CI are verified separately during delivery; local checks alone do not establish deployment.
