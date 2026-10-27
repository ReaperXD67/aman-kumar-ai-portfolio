# GitHub body design audit — 27 October 2026

## Finding

The user's criticism is accurate: the new animated header and contribution instruments do not transform the main reading experience. The inspected profile still presents Autonomous Personal Agent, AtlasLM and MinePulse / KarixMC as long Markdown descriptions, followed by more lists for secondary work, experience and skills. Actual project interfaces are absent from the open body. The architecture atlas is hidden in a disclosure. A visitor scrolling past the animated introduction returns to an ordinary text document.

This audit recommends changing that entire rhythm while retaining factual engineering evidence and current account avatars. It does not recommend adding another typing widget or replacing claims with decorative statistics.

## Rendering boundary

[GitHub's own markup repository](https://github.com/github/markup#github-markup) explains that rendered HTML passes through aggressive sanitization, removing executable script and styling hooks. A profile README cannot host this portfolio's JavaScript, WebGL interaction or iframe as an in-page application.

[GitHub's official formatting source](https://github.com/github/docs/blob/main/content/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax.md#images) supports repository images, alt descriptions, relative paths and the `<picture>` element. [The upstream HTML Pipeline sanitizer](https://github.com/gjtorikian/html-pipeline/blob/main/lib/html_pipeline/sanitization_filter.rb) includes image/picture/source and native details/summary in its default allowlist. That source is supporting evidence, not a guarantee that every deployed GitHub filter is identical to the library default.

The useful implementation strategy is a deliberate sequence of linked, self-contained visual artifacts with ordinary text and native disclosures. Use full-color APNG for animated real interfaces, matching PNG stills, and self-contained SVG for exact geometric architecture. Verify the delivered files through GitHub's actual renderer. Do not depend on SVG JavaScript, external fonts/images, embedded HTML or internal clickable controls inside an image.

## Proposed full-page rhythm

1. **Identity and destination.** Keep the strong Decision Loom header and immediately visible portfolio, recruiter quick-read and canonical résumé routes. Keep the role and career context as searchable text.
2. **One concise contribution interlude.** The genuine contribution snake provides the requested animated calendar; the 3D skyline remains an alternative view of the same data. Their size should not postpone the engineering portfolio for several screens.
3. **Three authored flagship plates.** Give each flagship a full-width visual composition, its real status, one technical question, and a distinct motion vocabulary. Follow it with one short normal-text description and explicit Live / Source / Decision links. Put deep scope notes and CI evidence in native disclosures.
4. **A compact secondary contact sheet.** Revive, ROLLFORWARD and AtlasForge form a three-project visual unit. Recompose as a vertical mobile asset rather than shrinking a desktop triptych. Retain real links and honest prototype/local status below.
5. **Small career and capability surfaces.** A short experience strip names SIP, micro1 and independent work with the existing exact dates. A compact capability map groups actual tools by the engineering job they serve. Keep the ordinary text equivalent available in a disclosure; do not add skill scores or animated percentage bars.
6. **A clear recruiter close.** Finish with the canonical résumé, live portfolio and email. Detailed provenance stays in the profile evidence guide rather than becoming the page's dominant visual texture.

This creates a repeating visual cadence of **artifact → one engineering decision → direct proof**, with different artifacts doing different jobs. It does not turn every paragraph into a looping image.

## Flagship art direction

| Project | Composition | Motion | Proof destination |
| --- | --- | --- | --- |
| Autonomous Personal Agent | A large authored topology and lifecycle instrument, honestly labeled local alpha. Use a real UI capture only if an actual source capture is available; do not invent a hosted dashboard. | Intent passes through the approved-action boundary; a worker loses its lease; stale completion is visibly refused and a receipt persists. This is an illustrated source explanation. | Lifecycle ADR, exact-action implementation, current capability limitations. |
| AtlasLM | Real workbench/landing capture dominates one side; retrieved evidence and a citation path occupy the other. | Evidence candidates converge through hybrid retrieval; an evidence gate stops unsupported output; supported citation objects remain visible. Avoid random floating tokens or fake model confidence percentages. | Live workspace, retrieval architecture, grounding implementation. |
| MinePulse / KarixMC | Real production capture paired with an explicit game-to-web trust boundary. | A signed Paper event crosses HMAC/nonce verification into the ledger; a replay is refused or a stored delivery receipt survives a lost acknowledgement. No live player/revenue telemetry is implied. | Live site, plugin integration, security model, production runbook. |

Alternate where image and architecture sit across the three plates. Keep one consistent background, type family and signal palette, while changing the internal geometry. The subject and mechanism should make each project recognizable before its title is read.

## Primary examples inspected

| Primary source | What is useful | What not to copy |
| --- | --- | --- |
| [DenverCoder1's actual README source](https://github.com/DenverCoder1/DenverCoder1/blob/master/README.md) | Project thumbnails and image-led sections make an open-source body scannable; native disclosures organize depth. | Its third-party card-service dependency chain and many badge/tool groups do not fit Aman's evidence-led world. |
| [innng's actual README source](https://github.com/innng/innng/blob/master/README.md) | One strongly authored identity is maintained with very little prose and a deliberately limited image vocabulary. | The personal illustration, voice and credentials belong to its author; it is not an engineering-project template. |
| [Uliana Zalutska's actual README](https://github.com/ulianazalutska/ulianazalutska) | Self-owned animated SVGs include a browser mockup and information composition, showing that the body can be visual without embedding an application. | A fixed side-by-side table would make project anatomy too small on a phone. Use responsive independent assets instead. |
| [ratacat/github-marquee](https://github.com/ratacat/github-marquee) | Self-contained animated SVG studies demonstrate masks, deterministic timelines and readable first frames in an image-hosted context. | Five unrelated effect samples should not all be inserted. Select material behavior that explains a real project mechanism. |
| [Wenoxxxx/svg-readme](https://github.com/Wenoxxxx/svg-readme) | The primary repository includes project-showcase template kits and frame-based animated exports, a concrete reusable tool category rather than only a README gallery. It declares MIT licensing. | Its editor and general templates are unnecessary runtime dependencies for this profile. Authored local plate generation can be smaller and more specific. |
| [chiranjeevi7777's project-card generation guide](https://github.com/chiranjeevi7777/chiranjeevi7777/blob/main/docs/widget-setup.md) | The owner maintains project visuals from structured project data and generator scripts alongside the README. That maintenance model transfers well. | Its progress percentages, roadmap state and workshop illustrations must not be transplanted into Aman's project facts. |

These are selected first-party examples, not an objective ranking or endorsement. No source artwork or personal material is copied by this audit.

## Accessible and reliable delivery

- Give each animated project plate a static desktop and deliberately composed mobile alternative through `<picture>`, with reduced-motion sources first where conditions overlap.
- Keep the default/first frame readable and visually complete. A paused, cached or unsupported animation must still explain the project.
- Use a native disclosure to hide a looping visual. The normal text project name, truthful status and links must remain useful without the animation.
- Use one whole-image destination plus separate ordinary text links; do not draw several fake buttons inside an image and imply that each is clickable.
- Keep essential labels large enough for a phone composition. A desktop screenshot containing tiny interface text should serve as context, not as the only way to read the evidence.
- Export delta-compressed full-color frames where practical. Preserve interface and portrait quality rather than converting all artwork to a coarse GIF palette. Avoid three simultaneous multi-megabyte loops when a slower, concise mechanism can communicate the same idea.
- Generate from structured facts and local captures. Record capture dates and source provenance; do not imply visualized requests are real traffic, tests or merchant outcomes.
- Check actual GitHub rendering at desktop, 390px and 320px; verify image source selection, link destinations, image loading and collapsed details. Publication of the body is a separate verification step from a local generated preview.

## Scope of this audit

The current README, asset inventory and evidence guide were inspected, along with the primary sources above. This pass writes only this report. The GitHub implementation agent owns the actual body redesign; final rendering, file sizes and publication remain to be verified against that delivered implementation.
