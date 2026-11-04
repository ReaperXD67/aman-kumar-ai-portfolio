# Portrait name motion — 4 November 2026

Aman requested more dramatic AMAN / KUMAR movement behind the existing portrait, a seamless current into contact, clear mobile reading and a GitHub push. This is a refinement of the approved full-width composition, grounded in the primary-source comparisons in the [Author's cut record](portrait-authors-cut-research-2026-11-03.md). No new dependency, asset, renderer or scroll pin was added.

## Implementation

- The existing native-scroll director supplies independent X/Y/Z/rotation poses to the two rear rows. AMAN travels up to ±340px on desktop; phones use 23% of viewport width, capped at 120px. KUMAR counter-travels at 86% of that amplitude. Desktop turns reach 10° and 9°; phone turns are capped at 4°. The rear container supplies its own perspective and clips overflow.
- Both text planes retain negative depth inside their z-index 1 container. The native alpha photo remains at z-index 2, and stationary caption/controls above it. Text movement does not alter the exact photograph/particle projection. The existing photo scale, source colour, contour births and contact receiver remain unchanged.
- The main travelling cohort previously recycled through `fract()` at full opacity. It now fades in over the first 1.8% of travel and out over the final 2.5%, with zero-slope smoothstep endpoints. The existing 14% source and 10% receiver cohorts retain their independent lifetimes; exact endpoint sentinels remain registered. This removes a visible teleport without emptying the peel or gather.
- Shared pause freezes every pose field. Reduced motion zeros the pose and removes the CSS transforms. Rendering budgets remain 12,000 desktop / 4,000 phone points, one analytical path evaluation and the existing 1.2-million-pixel / DPR-1.35 cap.

## Verification

- `npm run build` passed with the existing large-chunk warning. Sites output files were emitted.
- `npm run test:motion`: **44 passed**; `test:profile`: **15 passed**; `test:sites`: **4 passed**. The additional motion test checks opposing travel, continuous bounded perspective poses and negative rear depth. Photo registration, pause, crop and reduced-motion checks remain intact.
- Production-build browser checks at 1440 × 1000, 390 × 844 and 320 × 568 confirmed face occlusion, stationary captions, clear reading text and no horizontal overflow. A 260px native wheel scroll moved the first row's X translation from +47.4304px to −131.981px and the last from −40.7901px to +113.504px. A −260px reverse scroll reproduced the original transform matrices exactly.
- Browser emulation of `prefers-reduced-motion: reduce` returned `transform: none` for both rows. The emulation was cleared afterward.
- The contact route and form focus were checked; no message or email draft was sent. Desktop and phone console error lists were empty. Local screenshots and release evidence are saved under `artifacts/name-motion-20261104/` (ignored by Git).

The browser checks establish the observed composition and behavior, not a device FPS benchmark or throttled-network result. CI and the deployed production assets are checked after the authorized push and recorded separately in the artifact directory.
