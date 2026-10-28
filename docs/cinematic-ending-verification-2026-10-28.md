# Continuous ending film and mobile text safety

Historical record: the sheet and earlier contour implementations below have been superseded by [Signal Current](signal-current-verification-2026-10-28.md).

28 October 2026. Continues the opening described in [the continuity record](continuous-experience-verification-2026-10-28.md).

## Current direction and ownership

The latest feedback rejects the ending's perimeter-shaped animation. Its replacement is one open metallic sheet, rendered in Three.js with a real moving camera. The sheet changes fold, width, camber, sway and twist while retaining one mesh topology. It does not derive its silhouette from portrait, résumé or contact rectangles. The natural photograph and all native reading and interaction surfaces remain stable.

`ending-film-geometry.js` owns the analytic surface, reusable typed mesh buffers and camera path. Five authored surface and camera moments share cubic interpolation tangents. The camera changes position, target, field of view and bank continuously through the route. Contact's final pose is a flat open sheet with a frontal camera; between coordinates 3.15 and 4 its material changes from reflective silver toward rough paper. Reduced motion selects one settled sheet and camera composition. There is no elapsed-time choreography to replay or historical state to reconstruct on reverse scroll.

`continuation-motion.js` supplies one monotone, continuous document coordinate through Method, portrait, career, résumé and contact. Its interior knots retain velocity rather than braking at each artifact. `CinematicContinuation` measures local artifact offsets and resolves them against its current document origin, so content loading above the ending cannot leave stale absolute frame positions. The actual sticky-stage origin is included when mapping safety regions into viewport space.

Native artifact bounds serve two purposes: route timing and exclusion. They do not fit the sculpture to an outline. The complete portrait, Method field, career console, document previews, contact form, narrative and controls remain protected, together with the header and the visible desktop or mobile action tray. The tray measurement includes safe-area padding and landscape height. A continuous negative-space composition hint helps the sculpture use open space; it never authorizes drawing over protected content. The owner's actual visible intersection adds exclusions outside the ending, including when the negative-margin sticky stage releases near the footer.

`ContinuationSignal` initializes a transparent Three.js WebGL renderer on first visibility. One double-sided mesh uses 64 × 14 segments on phones and 96 × 20 on wider screens. Reusable position and normal buffers update from the scroll coordinate; a studio environment and directional lighting reveal its broad faces. The stage retains a 1.5-million-pixel budget and a maximum DPR of 1.35. Each invalidation coalesces into one frame, with no self-scheduling animation loop; hidden or offscreen states clear and suspend rendering. Measured exclusions become a unioned CSS clipping path, so overlapping protected rectangles cannot refill. A context restore marks the environment for regeneration on the next draw, after Three.js restores its own state; a failed environment refresh retains direct lighting. Cleanup disposes GPU resources, observers, listeners and pending animation frames. This restoration path was source-reviewed, not verified with injected GPU loss.

The transparent renderer is separate from the opening's shared WebGL scene. Method retains its 2D field and its native boundary exit; its 84 points do not become the new film's vertices. The optional Systems Kernel retains its own scene. This is not one Canvas for the entire site. Shared negative space between native reading surfaces gives the freeform transformation room on phones, without a new long pin, wheel interception or automatic scrolling.

The portrait retains its finite 2.85-second raster assembly, Person/System selector and replay. Career tabs, résumé dialogs, canonical PDF routes and contact fields keep their existing behavior. The form opens an email draft only after explicit submission; the site sends no email.

## Current verification status

The freeform film has a completed local phone/desktop/landscape browser pass and targeted confirmation of its footer correction. The production build and 46 Node checks pass: 28 motion checks plus 18 Sites/profile checks. Public release identifiers and byte comparisons are recorded separately in the delivery evidence. Earlier browser results below remain historical regression evidence; they do not verify the new geometry or camera.

At 390 × 844, the initial pass inspected 12 forward PageDown states through the ending to the footer and 11 PageUp states back through the portrait. The native face stayed clear. A broad lit folded surface was visible in the portrait/thesis and identity/career gaps; the camera moved across the object as its continuous coordinate advanced through approximately 0.8–4. These sampled states had no horizontal overflow or browser console errors.

The first pass found a settled sheet reappearing below contact over the footer. The film now yields to the form as its coordinate approaches 4, and the owner's geometric clipping independently protects all pixels outside the ending. A regression check includes an owner ending at y=579 in an 844px stage, requiring every following footer pixel to be excluded. At the end of the final 320 × 568 check, coordinate 4/completion 1 produced canvas opacity 0 and left the footer text and links clear.

At 320 × 568, the natural face remained clear in its portrait. Eight native ArrowDown inputs then revealed the folded sheet in the portrait/thesis gap without horizontal overflow. At 1440 × 1000, the native portrait stayed clear and the camera visibly orbited the broad sheet through the identity/career space. These are browser viewport checks rather than physical-device or mobile-keyboard measurements.

At 844 × 390, the contact form accepted a temporary test name, Tab focused email, and the value was cleared without submission. Footer text and links stayed clear, with no browser console errors. A fresh blank-tab entry at 390 × 844 loaded directly at `#contact` with the section approximately 68px below the top, contact act/coordinate 3.8658, and no horizontal overflow. Native Control+End reached coordinate 4/completion 1/canvas opacity 0; the footer at approximately y=579–782 remained fully readable above the action tray.

Run the production workflows from the repository root:

```bash
npm run build
npm run test:motion
npm run test:sites
npm run test:profile
```

The motion suite checks the continuous document route, film/camera geometry, capture exclusions, docking and original Loom geometry. Six film checks cover finite regular surfaces, reusable topology, triangle orientation, continuous camera/surface velocity, meaningful unfolding with a flat contact landing, exact reverse reconstruction and stable reduced-motion geometry. Four new director checks cover a monotone clock without braking at interior stops, finite negative-space focus, continuous composition shifts and owner-bounded footer clipping. Sites/profile checks cover hosting output and canonical identity assets. A passing source or math check is not evidence of visual quality, device performance or deployment.

Production verification compares the Vercel commit and canonical alias with the intended release, checks CI, compares public JavaScript/CSS bytes with the local build, and verifies the unchanged canonical résumé digest. Browser viewport checks do not establish physical-device, mobile-keyboard, GPU-loss or operating-system reduced-motion behavior. No frame-rate guarantee is asserted.

## Retained overlap fixes and prior evidence

The earlier ending releases established these regression cases:

- The moving KarixMC capture covered “From product to proof,” its explanation and evidence link. `CinematicOpening` now clips around measured narrative/navigation/footer regions in the moving copy's own unscaled space. Intersecting holes are unioned before applying an even-odd path, so overlapping cutouts do not refill. Opaque arrival plates also protect text while the original WebGL scene is visible. At 1054 × 800, both the initial overlap window and the later copy-only window were readable.
- The fixed mobile action tray covered the pinned flight footer and progress. Mobile flight reserves 62px plus the bottom safe area, or 54px in short landscape. Progress sits above the tray, the footer clears it, and captions use a separate lane. The 844 × 390 arrival and Method controls were usable.
- Bright gates and captured interfaces crossed intro/chapter letters at 320 × 568. Opaque narrative pseudo-element plates protect these captions without changing measured layout. The compact hero Person entry also has an opaque mobile surface; the sculpture remained visible while its name and professional context stayed clear.
- Phone document previews had a 430px minimum inside a 390px row. Their 40px overflow crossed the next heading by approximately 12px. The phone minimum now matches the row; both artifacts measured 390px with a positive 28px gap before the following heading.
- A 390 × 844 pass inspected 23 forward PageDown states from hero to footer and 23 reverse PageUp states back to the top without horizontal overflow. A cold contact entry aligned correctly; a temporary test name was accepted, Tab focused email, and the value was cleared without submission. These observations belong to the preceding spatial-shell release, not the current film.

The preceding contour and spatial-shell evidence remains in ignored local `artifacts/cinematic-ending/` and `artifacts/ending-spatial/`. Current film screenshots and release identifiers use ignored local `artifacts/ending-film/`.
