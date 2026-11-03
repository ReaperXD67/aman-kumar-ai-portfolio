# Portrait silhouette — 3 November 2026

## The gap

The preceding depth pass moved an opaque photograph between type planes. It
still occluded everything inside a rectangle. Aman's latest request requires
the typography to travel behind his actual head and shoulders, and the current
to peel from that organic outline. This supersedes the previous constraint
against creating a silhouette asset; it does not authorize changing his face,
hair, clothing or expression.

The [earlier depth record](portrait-depth-2026-11-03.md) retains the Instagram
and Renando reference provenance. The reference's useful principle remains
independent visual layers. Its photograph, branding and custom code are not
licensed for reuse here and are not copied.

## Focused research and decisions

Sources were checked on 3 November 2026. This investigation narrows the decision
to image alpha, cached contour data and existing rendering primitives; another
scroll controller or browser inference framework would not resolve the visual
gap more directly.

| Source | Inspected evidence | Decision |
| --- | --- | --- |
| [Three.js r185](https://github.com/mrdoob/three.js/tree/2431a09f46f34c560bc8e44b33be0e567723d5b9) | Tag resolves to commit `2431a09f46f34c560bc8e44b33be0e567723d5b9`, dated 2026-07-01. Repository unarchived; repository activity observed on 2026-11-03. [MIT, Copyright 2010–2026 three.js authors](https://github.com/mrdoob/three.js/blob/r185/LICENSE). The existing portfolio already uses the r185 runtime. | **Adapt existing primitives.** Static typed attributes can carry per-particle contour origins and birth colours; compact uniforms can describe protection. No additional engine or GPU portrait texture is required. |
| [IMG.LY background-removal-js](https://github.com/imgly/background-removal-js/tree/12f56cc4f2a90d624e165a715748d22efc7a1d93) | Latest inspected commit `12f56cc4f2a90d624e165a715748d22efc7a1d93`, dated 2025-07-18; unarchived. Web package 1.7.0 declares ONNX Runtime Web as a peer. [GNU AGPL version 3](https://github.com/imgly/background-removal-js/blob/12f56cc4f2a90d624e165a715748d22efc7a1d93/LICENSE.md). Its [package guide](https://github.com/imgly/background-removal-js/blob/12f56cc4f2a90d624e165a715748d22efc7a1d93/packages/web/README.md) describes first-run model/WASM downloads and approximately 40 MB / 80 MB model options. | **Defer.** Visitors need to see one prepared portrait, not run segmentation. Adding inference and model downloads would conflict with this portfolio's loading budget. The package and its model are not installed or incorporated. |
| [Native image alpha / CSS mask modes](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/mask-mode) | Alpha masking depends on opacity rather than colour brightness. A luminance mask can accidentally remove dark hair or dark clothing. | **Use actual alpha.** A transparent native image provides the silhouette directly. If an auxiliary mask is needed, use its alpha rather than an invented geometric contour or brightness threshold. No MDN code is copied. |
| [Canvas `getImageData`](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/getImageData) and [Three.js `BufferAttribute`](https://threejs.org/docs/pages/BufferAttribute.html) | Canvas exposes RGBA pixels; custom typed attributes are uploaded to the GPU and marked for update when data changes. | **Adapt the data path.** Read the decoded, same-origin asset once per crop/source change and upload static origins/colours. Scrolling changes the projection, not image pixels. |
| [WebP format documentation](https://developers.google.com/speed/webp) | WebP supports alpha in both lossless and lossy modes. | **Use a versioned delivery asset with preserved alpha**, after inspecting the matte and comparing actual file sizes. Do not infer a specific byte saving from generic format claims. |

No third-party component, model, source file or skill pack is installed by this
research. New geometry and sampling code should be original adaptations of
these documented primitives. Existing library notices remain applicable.

## Asset and compositing contract

Use a genuine transparent cutout of the approved yellow-kurta portrait. Keep the
prior opaque portrait available for its existing uses and a failure fallback.
Record the final asset path, generation prompt, dimensions, byte size and alpha
inspection below once production is complete. A geometrical CSS polygon is not
an adequate substitute for a photographic matte.

The native image remains in front of the rear typography and current. Its
opaque subject pixels protect the face during compositor scrolling, even before
the particle renderer receives updated coordinates. The photograph may move as
an axis-aligned plane, but it must not deform facial features.

Every supporting layer must respect the same transparency: the photo container,
raster wrapper, assembly canvas, lower shading and any seam decoration must not
paint an opaque rectangular backing. The finite assembly should use alpha-aware
pixels and transparent clears. Rear lettering must visibly pass behind the head
or shoulders at intermediate scroll positions, rather than merely sit above
the photo bounds.

## Contour and colour contract

The display crop, finite assembly crop and contour sampler must agree. Preserve
the current untransformed anchor plus analytical projection: uniform scale does
not change the normalized crop. A small cached RGBA sample can provide row-wise
silhouette edges and per-particle lower-shoulder birth locations. Read colours
slightly inside the opaque outline to avoid transparent-black fringe values.

The silhouette path should become active only after a valid transparent source
has decoded. The existing opaque thumbnail can supply colour fallback, but
cannot establish an organic contour. Empty rows, disconnected low-alpha specks,
unavailable readback and Person/System changes need deliberate fallback paths.
No per-frame image read, segmentation, CPU mesh rebuild or additional portrait
texture belongs on the scroll path.

Use the actual projected silhouette for source placement and safety. A full
image-rectangle discard would hide the newly inset shoulder roots; removing all
protection would expose the face to sprites. A conservative cached contour guard
plus the native foreground image provides a useful balance. Mobile flow should
exit through the shoulder gutter, preserve the foreground name and body-copy
plates, then gather at the existing contact receiver.

## Implementation and asset provenance

The selected delivery asset is
[`public/profile/aman-silhouette-v1.webp`](../public/profile/aman-silhouette-v1.webp),
1000 × 1000 pixels and 172,032 bytes. It was produced with the built-in image
generation/editing tool from the approved
[`aman-portrait.webp`](../public/profile/aman-portrait.webp), then converted to
WebP with FFmpeg, quality 88 and compression level 6, preserving alpha. The
opaque original and existing hero thumbnail remain available.

The generated source PNG is stored locally at
`C:/Users/Aman/.codex-cli/generated_images/01a17dd4-a0f1-73d0-ba0f-b5b0a60791d3/exec-39662a38-8347-4b3b-9741-b0a6542cdd7d.png`.
Built-in image edit mode used `transparent_background: true`, with the existing portrait as the sole referenced image. The final tool prompt was:

```text
Use case: background-extraction. EDIT this exact photograph for a professional portfolio. Remove ONLY the charcoal studio background and return a genuinely transparent alpha background. Preserve the exact person and photographic pixels/appearance: same recognizable face, facial proportions, expression, skin texture and color, eyes, hair silhouette and wispy curls, yellow kurta, pose, shoulder outline, crop and composition. Do not beautify, relight, retouch, recolor, redraw, reposition, enlarge or change the person. Keep the same square canvas and original subject placement; hair meets the top and clothing extends through the bottom edges exactly as in the original. Retain natural fine hair transparency with clean antialiased edges. No replacement backdrop, no shadow, no border, no frame, no typography, no objects. This is a precise cutout for typography to pass behind the actual human silhouette; the face must remain untouched.
```

The prompt records the requested invariants. The output was visually compared with the original; it is an identity-preserving generated edit, not a claim of pixel-identical RGB data. The generated source remains in place; the project uses the versioned optimized WebP above.

Read-only asset inspection found an alpha range of 0–255 and 418,428 fully
transparent pixels out of one million. This verifies that the delivery file has
real transparency; it does not by itself prove edge quality or identity
preservation. Those remain visual inspection responsibilities.

[PortraitSignal](../src/PortraitSignal.jsx) loads the versioned cutout and falls
back to the retained opaque portrait if that request fails. Its 2.85-second
assembly now clears an alpha-enabled canvas, skips samples below 3% alpha,
weights grain opacity by source alpha, and applies its finite scan line only to
existing pixels. The native image takes over after assembly. Reduced motion
resolves directly to that native image. The image and canvas share their
positioning, cover sizing and `50% 32%` crop.

[The portrait CSS](../src/portrait-signal.css) removes the rectangular image
backings and full-box lower overlay. The lower 12% has a gentle alpha fade to
release the already-cropped torso into the page. Rear `HUMAN` type occupies the
head/shoulder region at 28% of the desktop stage and 30% on phones, so the
silhouette actually occludes it. The native photo remains in the foreground;
the separate name, caption and controls retain their reading space. The System
view keeps its own opaque background.

[ContinuationSignal](../src/ContinuationSignal.jsx) now samples a cached
128 × 128 RGBA image rather than the previous 64 × 64 colour-only read. The
cache key includes source, dimensions and native crop size. No scroll-frame
pixel reads or extra sampling-image request are added. Uniform scale and
translation reuse the cached normalized data. Returning from System preserves
the decoded palette; source replacement invalidates it.

[portrait-colours.js](../src/portrait-colours.js) derives the right edge per
sample row at alpha ≥48 and a solid-colour sampling edge at alpha ≥192. A valid
cutout requires at least 1% transparent, occupied and solid samples; opaque or
empty sources retain the rectangle fallback. Missing rows inherit the nearest
occupied row. Particle births use the full cached edge rows at 52–88% image
height, including the fixed 69% registration seed. Colours are sampled one to
three pixels inside the solid edge with alpha-weighted bilinear interpolation,
then receive the existing hue-preserving exposure lift.

Static `aPortraitBirth` and `aPortraitColor` attributes are uploaded on
source/crop or geometry changes. A 32-row right-edge uniform supplies the
shader's approximate silhouette guard. This compact outline is not presented as
pixel-exact: the native foreground image performs the exact alpha compositing.
A 14px birth corridor allows the first sprites to emerge where the coarse
outline would otherwise clip a curved shoulder. It only opens at the right of
that particle's birth point; the native image still occludes occupied facial and
body pixels. System and opaque-source fallback set silhouette mode to zero.

The existing one-draw current retains 12,000 desktop / 4,000 phone particles,
14% moving roots, 10% receiver cohort, normal alpha blending, cached camera and
mask work, the 1.2-million-pixel/DPR-1.35 cap, pause, reduced-motion still and
hidden/offscreen suspension. It adds no renderer, inference library, GPU photo
texture or per-frame geometry rebuild. These are implementation properties;
frame rate and network load time have not been inferred from them.

## Validation and delivery

Local browser checks used 1440 x 1000, 390 x 844, 320 x 568 and 844 x 390. The first pass found an image visibility selector error, which was fixed before the confirmation pass. The native image then displayed at opacity 1, with clear hair/shoulder alpha, rear lettering visibly occluded by the person, and no opaque rectangular backing. The name remains below the face; observed phone caption/control clearances remained 9px at the entrance and 19px at the central pose, increasing on exit. No horizontal overflow was observed.

The phone renderer reported `alpha-32`, with static birth U values spanning .6641 to 1. At the central pose its nominal rectangle source was x341.95, while the actual centre-lane silhouette source was x267.89 at the same y478.00: approximately 74px inward, on the organic shoulder outline. The visible particles carried warm skin and yellow-kurta colours, rather than the previous grey backdrop. Desktop and phone console captures contained no errors.

Forward/reverse scrolling, the finite alpha assembly, Person -> System -> Person and pause/resume were exercised. System reported rectangle protection; returning to Person restored the silhouette mode. Pause held the photo Y pose at 18px while native scrolling continued. Direct contact navigation retained readable heading and form text. The visible receiver gathered above the form edge; clicking the name field and tabbing to email worked, and temporary test text was cleared without opening or sending an email. At document end the current reported completion 1.000; reversing restored 0.000.

Reduced motion, opaque/empty images and invalid geometry have automated/source checks; OS-level reduced-motion and a forced network failure were not simulated in this browser run. No FPS or throttled-network benchmark was performed. Screenshots and release evidence live locally under `artifacts/portrait-silhouette-20261103/`.

`npm run build` passed with the pre-existing large-chunk warning. `test:motion` passed 44 checks, `test:profile` passed 15 and `test:sites` passed 4: 63 checks total. The build emitted the required Sites files. No package dependency was added.

The authorized release follows `main` -> [GitHub verification](https://github.com/ReaperXD67/aman-kumar-ai-portfolio/actions/workflows/verify.yml) -> [the canonical Vercel portfolio](https://aman-kumar-ai-portfolio.vercel.app/#about). The local release record `artifacts/portrait-silhouette-20261103/release-verification.json` records the pushed commit, CI, deployment and byte comparisons after production is ready. It includes the new alpha asset as well as emitted code and the unchanged canonical resume. Local build checks alone are not deployment evidence.
