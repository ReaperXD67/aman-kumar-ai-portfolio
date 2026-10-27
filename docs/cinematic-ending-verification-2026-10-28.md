# Cinematic ending and arrival text protection

28 October 2026. Extends the shared opening described in [the continuity record](continuous-experience-verification-2026-10-28.md).

## Current behavior

The page continues through Method, the natural portrait, experience, résumé proof and contact on one dark surface. Contact's pale form is an inset paper terminal rather than another full-width palette change. Existing facts, links, document routes and form behavior are unchanged.

`CinematicContinuation` measures native artifact bounds and addresses one transparent, demand-rendered carrier from document scroll. Method's 84 displayed points converge toward an output perimeter as the field leaves view; the underlying simulation remains intact for reversal. The carrier now projects a small 3D aperture mesh through rounded portrait torsion, shallow career/résumé prisms and an aligned contact opening. Geometry uses one eased progress value per route interval; the semantic label can change without jumping the shell or packet. No image or photograph travels across the page.

The real portrait retains its finite 2.85-second raster assembly, Person/System selector and replay. Its former independent entrance translation was removed so the carrier can meet the actual native frame. Career tabs, résumé dialogs and contact inputs remain native content above the carrier. The form still opens a draft only after explicit submission; the site sends no email.

`continuation-geometry.js` owns five seekable poses and their pure geometry. A superellipse extrusion twists along its depth, rotates in three axes and uses perspective projection. Each projected ray meets the native artifact's empty rectangular aperture before its depth expands the outside shell, keeping the photograph and form geometry intact. The shell's envelope expands by at most 34px on phones or 88px on wider screens. Six phone/ten desktop rings use 64/96 angular segments; reduced motion uses three shallow, aligned rings. Panels are sorted by depth for material shading. The renderer remains Canvas 2D; no extra WebGL context is introduced.

All narrative and control rectangles are excluded from the carrier with an additional 8px reserve; overlapping exclusions are cleared independently. The header and actual visible `.signal-mobile-dock` / `.signal-dock` bounds are measured, replacing the fixed 84px bottom reserve so the exclusion includes safe-area padding and the shorter landscape tray. The actual sticky-stage origin is subtracted during projection, including its release near the footer. The stage retains a 1.5-million-pixel budget, a maximum DPR of 1.35, no autonomous animation loop, and hidden/offscreen suspension.

The full-scroll mobile source audit also found the opening's pinned footer and progress below the fixed professional-action tray. Mobile flight now reserves 62px plus the bottom safe area, or 54px in short landscape: progress meets the tray top, footer clears it by 18px, and narrative/arrival panels remain in a separate lane 56px above the tray. Desktop positioning is unchanged.

## Reported overlap

The user's screenshot showed the transported Karix capture covering “From product to proof,” its explanation and its link. Protecting only Work's chrome had left the preceding flight narrative unprotected.

`CinematicOpening` now measures the visible arrival panel, navigation and footer within their clipping stage. The moving copy excludes these regions in its own unscaled coordinates. Intersecting holes are unioned into disjoint rectangles before applying the even-odd path; overlapping cutouts cannot accidentally refill. Opaque narrative plates also protect those words while the original 3D scene remains visible. The source/destination image rectangles, reverse route and explicit control cancellation are preserved.

## Browser verification scope

The current refinement has a local browser pass and targeted confirmation of the mobile fixes. Public release identifiers and byte comparisons are recorded separately in the delivery evidence. The baseline observations below are retained separately so the earlier release's results are not presented as verification of changed geometry.

### Spatial-shell refinement

- At 1440 × 1000, the portrait and contact displayed the projected shell while their native content stayed clear.
- At 390 × 844, 23 forward PageDown observations traversed hero to footer, followed by 23 reverse PageUp observations back to the top. The inspected states had no horizontal page overflow and the ending phase followed the native route in both directions.
- This pass exposed a genuine phone proof-vault overlap: a 430px minimum preview occupied a 390px grid row, overflowing its row by 40px and crossing the following heading by approximately 12px. The phone preview minimum now matches the 390px row. Both artifacts subsequently measured a 390px preview in a 390px row, with a positive 28px gap before the following heading.
- At 320 × 568, bright opening WebGL rails crossed chapter text. Intro/chapter captions now have an opaque pseudo-element plate in their own narrative stack; the fix changes no measured layout. With the live WebGL canvas present, AtlasLM, Agent and KarixMC chapter text was subsequently clear over those plates. The footer and progress remained above the tray.
- The same short-phone pass found the Loom behind the compact Person-entry text in the hero. Its mobile signature now has an opaque background without a layout change. The final 320 × 568 check retained a visible sculpture while keeping the name and professional context clear.
- At 844 × 390, the final project arrival was readable and the Method Control tab updated its accent.
- A cold 390 × 844 contact entry resolved to the contact act without stale frame placement. The form accepted a temporary test name, Tab focused email, and the value was cleared without submission. At its reading position the paper form measured approximately y=86–740, below the fixed header and above the y=782 action tray. The submit retained its 58px target. The final local preview reported no console errors. These are browser viewport checks, not physical-device or mobile-keyboard measurements.

### Baseline observations

- At 1054 × 800, the reported overlap was reproduced along the native arrival route. The resulting CSS `path(evenodd, ...)` was supported, active and visibly excluded the heading, paragraph, evidence link and footer while the copy moved. Both the initial overlap window and a later copy-only window retained readable text.
- At 1440 × 1000, Method's dark heading/chamber flowed into the portrait frame and contact terminal. Method reported its existing source selection and an output value of zero while being read, then one when it left view. The portrait remained clear and recognizable after its finite assembly.
- The contact form accepted a test name and keyboard focus moved to the email field; the temporary value was cleared. No submission or external message was performed. The opening WebGL canvas was absent while contact was in view.
- At 390 × 844, the portrait and its controls remained readable; portrait buttons measured approximately 45px high. The contact form retained 51px inputs and a 58px submit control. Neither inspected phone surface had horizontal page overflow.
- At 320 × 800, the final submit action remained above the mobile tray at the page end, followed by the native footer. The 844 × 390 landscape layout retained direct Method tab selection and reverse scrolling. No browser console errors were recorded in the local preview. An explicit principle selection also updates the carrier accent while its simulation is offscreen.
- A cold production contact entry exposed stale absolute coordinates when the lazy opening changed height above the ending. Artifact offsets now remain local to their owner and resolve against its current document origin on every update. The parent main layout is observed as well, so a shift above the owner refreshes the route even when the ending's own height does not change. A regression check covers this displacement.

## Automated verification

```bash
npm run build
npm run test:motion
npm run test:sites
npm run test:profile
```

The production build and all three Node commands pass: 23 motion/geometry checks plus the existing 18 Sites/profile checks, for 41 checks total. They cover responsive narrative exclusion, union of overlapping holes, transformed clip coordinates, ordered ending stages, reverse determinism, field-exit timing, native/sticky frame projection and reduced-motion frame selection. The five new spatial-shell checks cover finite/outside-aperture/envelope-bounded vertices, continuous integer handoffs, meaningful depth with a capped phone envelope, reversible geometry and shallow aligned reduced-motion poses. Build output retains all required Sites files. No new dependency or change to the protected worker/hosting preparation is required.

Renderer source/mocked checks also covered outside-frame geometry, finite drawing, coalesced demand frames, hidden/resume/cleanup and the backing-pixel cap. Those checks are distinct from browser observations. Reduced-motion behavior was reviewed through the pure route checks and component paths; the browser session did not emulate an operating-system preference or inject GPU loss. No frame-rate guarantee is asserted. Vite retains its existing large shared-chunk warning.

Production release verification checks CI, the Vercel commit/alias and public JavaScript/CSS bytes against the local build, plus the unchanged canonical résumé digest. Its screenshots and delivery evidence are captured in ignored local `artifacts/ending-spatial/`; the earlier contour release used `artifacts/cinematic-ending/`.
