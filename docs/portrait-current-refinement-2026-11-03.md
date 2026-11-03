# Portrait current refinement — 3 November 2026

## Intent and reference

Aman's latest feedback asks for brighter, fuller particles that retain the
portrait's colours, visibly peel with scrolling, and gather more decisively into
contact. The face, mobile reading route and form must remain clear. The supplied
Instagram screenshot also asks for a stronger editorial portrait presentation.

The web fetch of the [Instagram post](https://www.instagram.com/p/DfMhyC7Ma31/)
was throttled; the parent subsequently opened the actual post in authenticated
Chrome and inspected playing-video frames. The likely matching live reference is
[Renando's portfolio](https://portofoliorenando.pages.dev/): its name, creator
handle, red oversized title and central black-blazer portrait match the supplied
screenshot. Its publicly served HTML, CSS and JavaScript were inspected. Browser
video-frame observations support the reference; frame-exact video timing was not
measured and its blob video was not downloaded.

The live reference uses layered 2.5D parallax: background typography, portrait and
introductory text travel at different rates, with a modest portrait scale change
and a masked type entrance. This is useful composition research, not evidence of
a face-morphing 3D model. No reuse license was established for that site's code or
assets. This implementation copies neither; it adapts the depth and hierarchy
principle to Aman's existing visual identity.

## Upstream comparison

Primary repositories, source and exact license files were inspected on
2026-11-03. Maintenance dates describe the inspected snapshots, not a promise of
future support.

| Source | Snapshot and license | Relevant pattern and decision |
| --- | --- | --- |
| [Codrops SeamTransitions](https://github.com/codrops/SeamTransitions/tree/54ce5b6480b0502e0afa8781a6130b84638b77a3) | Unarchived; commit `54ce5b6`, 2026-10-30; [MIT, Codrops 2009–2026](https://github.com/codrops/SeamTransitions/blob/54ce5b6480b0502e0afa8781a6130b84638b77a3/LICENSE) | **Adapt the interaction principle.** Its Fray and Shavings examples connect released material to a real image edge and reserve measured space around text. Their ScrollSmoother, texture and per-piece drawing machinery is unnecessary here. |
| [Codrops ScrollBasedLayoutAnimations](https://github.com/codrops/ScrollBasedLayoutAnimations/tree/729029a0f2c31e7c39e15d5c6433a0f4f2bac498) | Unarchived; commit `729029a`, 2026-10-31; [MIT, Codrops 2009–2022](https://github.com/codrops/ScrollBasedLayoutAnimations/blob/729029a0f2c31e7c39e15d5c6433a0f4f2bac498/LICENSE) | **Adapt bounded differential travel.** It demonstrates measured spatial transitions and responsive refresh. Its long gallery pins and Lenis integration would compete with the existing native-scroll experience, so they are deferred. |
| [React Parallax Tilt](https://github.com/mkosir/react-parallax-tilt/tree/b91fade19ea07fff4dd5ee2ee72be42a860a4ab1) | Unarchived; commit `b91fade`, 2026-11-02; [MIT, Marko Kosir 2019](https://github.com/mkosir/react-parallax-tilt/blob/b91fade19ea07fff4dd5ee2ee72be42a860a4ab1/LICENSE); React peer dependencies, no runtime dependencies | **Defer installation.** Existing pointer hooks and animation infrastructure cover the small depth interaction. Gyroscope support would introduce permission and compatibility concerns without improving the scroll peel. |

In [Fray](https://github.com/codrops/SeamTransitions/blob/54ce5b6480b0502e0afa8781a6130b84638b77a3/js/seams/fray.js), source-coloured strands release according to scroll travel, sway in response to velocity and settle when scrolling stops. [Shavings](https://github.com/codrops/SeamTransitions/blob/54ce5b6480b0502e0afa8781a6130b84638b77a3/js/seams/shavings.js) adds a reversible peel, curl and gathered pile. Those causal relationships are relevant; copying either renderer would increase complexity and undermine the current GPU budget.

No upstream component, skill pack, runtime dependency, source code or image asset
was imported for this refinement. License notices would need preservation if
substantial upstream code were reused in a later change.

## Chosen treatment

The particle revision keeps the cached 64 × 64 portrait sampling and static RGB
attribute. A bounded, uniform exposure gain now lifts dark samples towards a
maximum-channel value of `0.62`, with a gain cap of `8`. This preserves the ratios
of nonzero colour channels; already-bright samples remain unchanged. It does not
replace sampled hues with a gold tint or additive white bloom.

The existing cohort is redistributed to provide a stronger attachment and
destination: 14% of seeds occupy the short source-release portion and 10% occupy
the receiver portion. The final curl begins earlier, becomes fuller before
contracting, and uses stronger particle coverage. These are visual adjustments
within the existing single `THREE.Points` draw and fixed 12,000 desktop / 4,000
phone point budgets, not an additional particle system.

The portrait composition gains oversized split-name letter planes in its lower
region, with bounded differential scroll travel. The photograph itself remains
fixed and recognizable. This preserves exact source-edge registration and the
finite 2.85-second raster assembly; it adds no cutout, photograph request or
facial deformation. Person/System/replay controls remain part of the identity
instrument. Text and image layers must continue to protect the face and reading
route at every intermediate scroll position.

Existing native scrolling, lazy loading, normal alpha blending, cached colour
reads, source/form guards, opaque reading plates, pause/reduced-motion handling,
hidden/offscreen suspension and pixel/DPR caps remain constraints. No per-frame
image read, CPU mesh rebuild, GPU portrait texture or environment map is needed.
Expected savings from preserving these constraints are architectural reasoning;
they are not measured frame-rate or loading-time results.

## GitHub presentation and badges

GitHub's [official profile reference](https://docs.github.com/en/account-and-profile/reference/profile-reference)
distinguishes native achievements, which are awarded for actual events, from
program badges that require qualifying participation. Some historical awards
are no longer obtainable. [Visibility controls](https://docs.github.com/en/account-and-profile/how-tos/contribution-settings/manage-visibility-settings-for-private-contributions-and-achievements)
can display achievements already earned; changing visibility does not earn a
new award.

The profile now uses three real workflow-status badges and a direct link to the
supplied micro1 credential. Its original responsive SVG portrait header replaces
the earlier APNG, reducing header file size by 79% on desktop and 83% on mobile.
The unchanged portrait is embedded, with 154 photo-coloured grains along its
edge. Collapse and static variants remain available; the flagship showcases and
final Contribution Loom remain in place.

[Profile commit 88e900c](https://github.com/ReaperXD67/ReaperXD67/commit/88e900cbfbf68ccf80e6e079c8fdd22ce72b12c2)
is pushed and [profile asset CI](https://github.com/ReaperXD67/ReaperXD67/actions/runs/41602734603)
passed. Local 1280px desktop/390px mobile and the actual public GitHub profile
were visually checked: the embedded portrait renders through GitHub's image
proxy, and the three workflow badges show passing. Existing Pull Shark x2,
Quickdraw and YOLO achievements are visible. No native achievement was earned
by this work; no activity, certificate or award was fabricated.

## LinkedIn delivery

The authenticated owner UI saved clearer titles and descriptions for the first
three Featured cards: portfolio, KarixMC and Revive. Their live/source URLs and
ordering remain. All three saved values were re-read after reload; the exact
copy is maintained in [the profile system](linkedin-profile-system.md). Headline,
About, five top skills and recruiter-only Open to Work were inspected and
retained. Account photos were retained, as requested. No posts, messages,
connection requests or new credential claims were made.

The first Featured thumbnail still shows older artwork. Uploading the existing
approved portrait social image was blocked because Chrome's ChatGPT extension
has file-URL access disabled. No permission was changed and the text changes
remain saved. The blocked thumbnail replacement is not reported as complete.

## Local verification

- Production build passes; Sites outputs are present. Existing shared large-chunk
  warning remains. Protected hosting infrastructure and the canonical PDF are unchanged.
- 33 motion checks, 14 profile checks and 4 Sites checks pass: **51 total**.
  Colour assertions verify hue ratios, bright-highlight preservation, bounded
  near-black gain and finite fallback; cohort checks verify phone root coverage.
- Main entry: **667,285 raw bytes**, 251 bytes above the preceding release.
  Lazy current: **18,835 raw bytes**, 906 bytes above the preceding release.
  No dependency, image request, GPU texture, particle count or draw call is added.
  These are file sizes, not frame-rate or load-time measurements.
- A bounded desktop/mobile inspection caught the initial oversized name crossing
  the lower face. One correction moved its start to 73% of the photo stage and
  reduced container-relative type size. Final 1440×1000, 390×844 and 320×568
  captures show clear face and shoulder-level typography; no horizontal overflow.
- Portrait grains are visibly brighter and retain grey/charcoal and kurta yellow.
  Desktop source diagnostics remain `(548.04,618.60)`, with 12,000 points;
  phones retain 4,000 points and the full-portrait palette.
- Native forward scroll samples cover identity, career, résumé, certificate,
  contact introduction, form and footer. Text and controls remain clear. The
  contact coil terminates at the paper edge. At footer, completion reaches
  `1.000`; reverse scrolling restores `0.000`. Observed states have no horizontal overflow.
- A temporary name input was entered, Tab focused email, and the value was
  cleared. No form submission or email draft occurred.
- Person/System switching and return preserve controls and restore finite
  assembly. Pause held time at `135.713` across Method→portrait navigation;
  the settled renderer reported paused. Motion was then resumed.
- Cold direct contact at 844×390 preserves the readable heading and gutter.
  Reduced-motion and image-failure paths are source-reviewed and covered by
  existing mathematical checks; no physical-device, on-screen-keyboard or FPS
  certification is claimed.

Screenshots are local, ignored artifacts in
`artifacts/portrait-brighter-20261103/`; LinkedIn captures may contain private
owner controls and are not public portfolio assets. Final release verification
checks the pushed commit, successful CI, Vercel READY state and canonical
JavaScript/CSS/PDF bytes against this tested build. Those identifiers and results
are recorded in the release artifact and user handoff after publication.
