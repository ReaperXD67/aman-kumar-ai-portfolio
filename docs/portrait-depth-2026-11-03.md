# Portrait depth — 3 November 2026

## Intent

Aman rejected the previous treatment because the photograph still read as a
static frame. This refinement makes the real portrait a moving middle plane,
between oversized background typography and a separate foreground name. The
face stays recognizable; mobile copy, professional links and identity controls
retain a clear reading route. The existing photo-coloured current must peel from
the moving photograph rather than from its old layout rectangle.

## Reference and provenance

The supplied [Instagram reference](https://www.instagram.com/p/DfMhyC7Ma31/)
was previously inspected in authenticated Chrome. Its likely matching live
implementation is [Renando's portfolio](https://portofoliorenando.pages.dev/),
whose name, creator and central black-blazer portrait match the supplied image.
Its public HTML, CSS and JavaScript were re-inspected for this refinement. The
reference moves its large background title, portrait and introductory copy at
different rates, with a modest portrait scale change. It is layered 2.5D
parallax, not a deforming face or a 3D human model. Its mobile composition gives
introductory text its own lower region.

The useful principle is independent planes with a strong size hierarchy. No
license was established for the reference site's custom implementation or
artwork. Its code, photograph, typography assets and branding are not copied.
The existing Aman portrait and local fonts remain the visual assets.

| Primary source | Inspected snapshot | Decision |
| --- | --- | --- |
| [Codrops ScrollBasedLayoutAnimations](https://github.com/codrops/ScrollBasedLayoutAnimations/tree/729029a0f2c31e7c39e15d5c6433a0f4f2bac498) | Commit `729029a0f2c31e7c39e15d5c6433a0f4f2bac498`, 2026-10-31; unarchived when checked on 2026-11-03. [MIT license, Copyright Codrops 2009–2022](https://github.com/codrops/ScrollBasedLayoutAnimations/blob/729029a0f2c31e7c39e15d5c6433a0f4f2bac498/LICENSE). | **Adapt the spatial principle.** Its source measures layout states, refreshes responsive geometry and supplies a reduced-motion layout. These are useful patterns. Defer its long gallery pins, Flip transitions and Lenis scroll controller; the portfolio already has a native-scroll director. |

The [Codrops article](https://tympanus.net/codrops/2023/07/20/scroll-based-layout-animations/)
explains composing start and end layouts before animation. Here, the original
implementation uses one bounded analytical pose rather than importing an
upstream component. No new dependency, skill pack, image asset or upstream code
is installed. The MIT notice would need preservation if substantial Codrops
source were reused later.

## Implemented scene

[PortraitSignal](../src/PortraitSignal.jsx) now composes three native layers:

- Rear: large vermilion `HUMAN` lettering, with slower, opposing scroll travel.
- Middle: the existing opaque native photograph, translated and uniformly
  scaled as the visitor scrolls through the scene.
- Front: `AMAN / KUMAR.` and the existing personal statement, positioned at the
  lower shoulder and travelling independently. Desktop adds bounded perspective
  to the type; phones remove that rotation and shorten travel.

[The portrait styles](../src/portrait-signal.css) remove the enclosing card border
and reserve space around the image. Header, Person/System buttons and replay
remain stable native controls with 44px touch targets. The System view remains
available, and the Person view stays the default. The actual face is neither
warped nor replaced by a generated cutout.

## Shared projection and current attachment

[portrait-depth.js](../src/portrait-depth.js) derives a reversible camera pose
from an untransformed layout anchor and the current viewport. The photograph
stays axis-aligned: translation and uniform scale are enough to create a dolly
effect while keeping the image crop and right edge analytically exact.

[CinematicContinuation](../src/CinematicContinuation.jsx) measures the stable
`.portrait-photo-anchor`, writes the pose to CSS variables and passes the same
projected rectangle to the particle endpoint and portrait mask. It does not
measure an already transformed picture and feed that result back into the
animation. Source attachment follows the actual moving image edge immediately;
the decorative current's camera settling does not delay native registration.

The foreground name gains its own protected region. Opaque photo, copy and
control surfaces retain native stacking protection above the current, including
the interval before a fast compositor scroll reaches the next JavaScript frame.
The existing contact receiver, footer-only current fade and colour sampling
remain in place.

## Motion and performance boundaries

The pose follows native scroll in both directions. Shared pause freezes the
decorative pose while its frozen geometry still travels with the document, so
the source remains registered during paused scrolling. Responsive layout
changes can recalculate the pose. Reduced motion resolves to a static, readable
composition with unit photo scale and no type rotation.

The finite 2.85-second raster assembly is retained. Its canvas uses the frame's
untransformed `clientWidth` and `clientHeight`; scaling the composited picture
does not resize or resample that canvas on every scroll frame. Its existing
visibility suspension and cleanup remain. Particle colours still come from the
cached crop of the decoded portrait; a uniform scale preserves that crop's
aspect ratio.

This adds CSS transforms and a small pure projection function to the existing
director, not another renderer, continuous animation loop, GPU portrait texture
or per-frame pixel read. The current retains its 12,000 desktop / 4,000 phone
point budget, lazy loading, hidden/offscreen suspension and pixel/DPR caps.
These are implementation properties, not measured frame-rate or load-time
claims.

## Verification

[Portrait depth tests](../tests/portrait-depth.test.mjs) cover projection and
attachment, reversible motion, frozen-pose registration, cover-crop invariance,
foreground placement, reduced motion and invalid input. They are part of
`npm run test:motion`. Their presence is not a substitute for a browser scroll
check.

Build and test execution on 3 November: `npm run build` passed with the existing large-chunk warning; `test:motion` passed 41 checks, `test:profile` 14, and `test:sites` 4 (59 total). Required Sites outputs were emitted. No dependency or image asset changed. The entry is 667,967 raw bytes and the lazy current is 18,835 raw bytes; these are bundle sizes, not load-time or FPS measurements.

### Browser QA

The local app was inspected at 1440 x 1000, 390 x 844, 320 x 568 and 844 x 390, including direct `#about` entry and intermediate scroll positions. The first phone pass exposed a caption/control collision; the stage now reserves separate caption and control space. Tablet/landscape width is capped, and short landscape receives additional lower clearance. The portrait remains recognizable and the lettering stays over the lower shoulders or below the image. No horizontal overflow was observed.

At 390px, the observed entrance / middle / exit caption-to-controls gaps were approximately 9 / 19 / 38 CSS pixels. Foreground type began at least 31 CSS pixels below the conservative 74%-height face boundary in those samples. At the exit sample, the photo right edge was 338.98px and the reported particle source was 339.48px: the intended half-pixel attachment offset. These sampled observations do not claim exhaustive device coverage.

Forward/reverse native scrolling, Person -> System -> Person, assembly after return, shared pause/resume and direct contact navigation were exercised. Pause held the photo Y pose at 18px while the document continued scrolling. The mobile contact heading and native fields stayed readable; a temporary test name was cleared after Tab reached the email field. No email draft was opened or sent. At the actual document end the current reported completion 1.000 and cleared from the footer. Reduced motion and unavailable-image fallback are covered by source/math checks, not a changed OS preference in this browser run.

Screenshots and sampled geometry are kept locally under `artifacts/portrait-depth-20261103/`. The existing full-page current, caps and loading policy remain unchanged. No FPS or throttled-network benchmark was performed.

### Delivery

Delivery uses the existing authorized `main` -> GitHub CI -> Vercel workflow. The public target is [the canonical portfolio](https://aman-kumar-ai-portfolio.vercel.app/#about), with [verification runs](https://github.com/ReaperXD67/aman-kumar-ai-portfolio/actions/workflows/verify.yml) attached to each push. This source record establishes the implementation and local results above; production verification is recorded separately in `artifacts/portrait-depth-20261103/release-verification.json` after the release is ready, including commit, deployment, CI and byte comparisons. Local checks alone do not establish a successful release.
