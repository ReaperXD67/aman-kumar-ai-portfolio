# Fuller portrait-coloured current — 4 November 2026

Aman requested brighter, fuller grains from the dissolving names, a more obvious swirl and a stronger gather into contact, while preserving his face and phone text. This is a focused refinement of the [typography handoff](portrait-name-dissolve-2026-11-04.md); its primary-source comparison and original implementation remain the basis. No upstream code, dependency or asset was added.

## Current behaviour

- Glyphs now receive 48% of the existing 12,000 desktop / 4,000 phone budget, up from 36%. The 14% portrait-root and 10% receiver cohorts remain intact. Static origins still match sampled native font ink.
- A cached uniform RGB gain targets a .86 maximum channel, capped at 12. This lifts low-key photo samples without changing their channel ratios, inventing colour in pure black, or changing already-bright highlights. Normal alpha blending preserves the portrait palette.
- Larger, fuller directional cores make individual grains visible. The 9px sprite cap, 1.2-million backing-pixel cap and DPR-1.35 limit remain unchanged. There is no bloom pass, texture upload or extra draw call.
- Released glyphs turn through a bounded 1.15-revolution spatial swirl. Its quartic envelope and derivative vanish at both ends, maintaining attachment and continuity into the existing path. The phone radius is reduced.
- The wider receiver coil rotates more clearly. Gathered glyphs stay distributed over the last part of the path rather than converging to a single dense point. The dedicated receiver cohort and exact endpoint seed retain the physical contact handoff.
- Shared pause, reduced-motion stills, native silhouette occlusion, reading/form plates, lazy loading and hidden/offscreen suspension remain in place. The new swirl uses the existing active clock and analytic derivative; it adds no per-frame CPU buffer work.

## Validation

- Production build passed with the existing large-chunk warning. All 49 motion, 15 profile and four Sites checks passed (68 total). Colour checks cover bounded exposure, hue ratios, true black, highlights and alpha-aware sampling; glyph coverage checks use the updated cohort.
- Independent shader review found disjoint cohorts, bounded colour/alpha and zero swirl displacement/derivative at the handoff ends. Numerical derivative comparison was within 5.4e-10. This does not measure frame rate.
- Local browser inspection at 1280 × 720 showed intact arrival names, brighter letter release, the outboard swirl and a fuller contact coil. The face, caption and contact form remained clear. No console errors were observed.
- The production build at 390 × 844 retained 4,000 points, clear face/caption and protected reading text without horizontal overflow. A 100px scroll changed release phases from `0.005,0.000` to `0.537,0.010`; reversing 100px returned to the identical scroll position and phases.
- The phone contact input accepted focus without any message being submitted; the current gathered above the paper form. At 320 × 568, browser reduced-motion emulation restored unmasked, untransformed native names with no horizontal overflow. Temporary viewport and media overrides were restored after inspection.
- Shared pause kept the current clock at `302.876` and phases at `1.000,1.000` through a 100px native scroll. Playback was resumed afterward. No browser console errors were observed on the tested phone build.

Screenshots and verification artifacts are in the ignored `artifacts/current-presence-20261104/` directory. Delivery checks are recorded after the authorized GitHub push. No throttled-network or FPS benchmark is claimed.
