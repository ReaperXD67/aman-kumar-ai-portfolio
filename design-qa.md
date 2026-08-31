# Design QA — Aman Kumar Portfolio, Wow Pass

## Evidence

- Source visual truth: `C:\Users\Aman\AppData\Local\Temp\codex-clipboard-c1b19145-ce31-423f-99c0-74c5a9a4162a.png`
- Rendered desktop implementation: `C:\Users\Aman\OneDrive\Desktop\Portfolio\artifacts\wow-desktop-final.png`
- Focused work capture: `C:\Users\Aman\OneDrive\Desktop\Portfolio\artifacts\wow-work-final.png`
- Focused method capture: `C:\Users\Aman\OneDrive\Desktop\Portfolio\artifacts\wow-method-final.png`
- Mobile implementation: `C:\Users\Aman\OneDrive\Desktop\Portfolio\artifacts\wow-mobile-final.png`
- Source pixels: 1920 × 1080. Implementation pixels: 1920 × 1080. Desktop CSS viewport: 1920 × 1080 at device scale 1.
- Mobile pixels and CSS viewport: 390 × 844 at device scale 1.
- State: dark theme; OBSERVE hero mode; ALL project filter; first method panel expanded.
- Intent normalization: the screenshot is an inspiration reference rather than a literal clone target. Browser chrome and MotionSites gallery controls were excluded from fidelity requirements; the retained target is its cinematic black editorial art direction, large generative focal object, compact technical UI, strict grid, and high-contrast content hierarchy.

## Full-view comparison evidence

The source and implementation were opened together in one comparison input at matching 1920 × 1080 pixel dimensions. The implementation carries over the source's strongest visible traits—black canvas, industrial hairlines, restrained navigation, oversized visual centerpiece, monospace telemetry, severe white type, and one vivid accent—while replacing marketplace chrome with a coherent personal portfolio narrative. The result is intentionally original rather than a Vesper or MotionSites clone.

The upgraded hero now has equivalent visual authority to the reference: a dense, animation-ready Three.js cognitive core occupies the dominant right frame and the three-line editorial statement balances it on the left. The following project and method regions preserve this same design language instead of dropping into generic portfolio cards.

## Focused comparison evidence

### Hero and interactive core

- Cabinet Grotesk provides a deliberate editorial silhouette across display text, while compact monospace telemetry keeps the technical layer crisp and secondary.
- The inline real project crop adds an image interruption inside the headline without replacing source imagery with placeholder CSS art.
- OBSERVE, REASON, and EXECUTE are real buttons. Each changes the core state and accessible pressed state; direct core clicking also cycles the mode.
- Reduced motion is detected and disables nonessential continuous animation.

### Project case-file stack

- `wow-work-final.png` verifies a two-column editorial case-file anatomy, real project imagery, accurate title/summary/stack content, and a readable sticky narrative column.
- The stack uses scale and translation only. Parent opacity/filter dimming was removed so offscreen sticky cards remain accessible and retain text contrast.
- ALL, AI, SYSTEMS, and PRODUCT filters respond. Case-study dialogs open and close with Escape.

### Method accordion

- `wow-method-final.png` verifies the intended black/ivory polarity shift and horizontal accordion composition.
- Each capability is a semantic button with a visible expanded state; text and icon families remain consistent.

### Responsive and accessibility

- `wow-mobile-final.png` verifies a deliberate mobile hierarchy: identity, statement, CTA pair, then 3D core. No horizontal overflow was found at 390 × 844.
- Axe reported 0 accessibility violations on desktop, mobile, and reduced-motion states. Two portrait-overlay nodes remain an automated “incomplete” because axe cannot infer the composited image background; both use an explicit `#050505` label surface and were manually checked.
- Console error check returned no runtime errors. A development-only Three.js clock deprecation warning originates from the rendering stack and does not affect the experience.

## Required fidelity surfaces

- Fonts and typography: passed. Display/body/telemetry roles are distinct, responsive wrapping is intentional, and optical weights are consistent.
- Spacing and layout rhythm: passed. Desktop hero proportions, sticky work grid, method accordion, mobile stacking, borders, and section transitions show no collision or clipping.
- Colors and tokens: passed. Near-black, ivory, steel gray, and signal orange are consistently tokenized with accessible interactive contrast.
- Image quality and asset fidelity: passed. The hero is native procedural Three.js; project visuals and inline crops use real repository screenshots with controlled crops and no placeholder graphics.
- Copy and content: passed for current known profile data. Messaging is specific to explainable AI, agent systems, and production engineering rather than generic portfolio language.

## Comparison history

1. **P2 — hero impact:** the earlier portfolio hero was polished but still conventional and did not match the source's dominant kinetic centerpiece. Fixed with a quality-gated stateful Three.js core, editorial three-line headline, and inline project imagery. Post-fix evidence: `wow-desktop-final.png`.
2. **P2 — project hierarchy:** the earlier flat project grid lacked a memorable scroll narrative. Fixed with large split case files, sticky presentation, real imagery, filters, and detail dialogs. Post-fix evidence: `wow-work-final.png`.
3. **P2 — section distinctiveness:** the method section needed a stronger compositional change. Fixed with an ivory horizontal accordion and black active panel. Post-fix evidence: `wow-method-final.png`.
4. **P1 — accessibility:** first stack pass dimmed previous cards with parent opacity and brightness filters, producing axe contrast failures. Removed those properties while keeping translation/scale depth. Post-fix axe result: 0 violations.
5. **P2 — work heading wrap:** “Selected work, with receipts.” wrapped to four lines at the target viewport. Tightened to “Work with receipts.” and verified the intended two-line silhouette.
6. **P2 — scroll-stage positioning:** the first cognitive-descent render inherited `overflow: hidden` from `main`, preventing the sticky stage from holding the viewport and pushing chapter text offscreen. Replaced it with horizontal clipping and visible vertical overflow. Post-fix evidence: `descent-signal-pass2.png`.
7. **P1 — WebGL resource contention:** the first overdrive pass kept both hero and descent canvases alive, causing a context-loss warning and an empty tunnel render. Both scenes now mount only near their viewport, leaving one active WebGL context during the sequence. Post-fix evidence: `descent-intro-pass2.png`, `descent-reason-pass2.png`, and one active canvas reported in the mobile run.

## Overdrive extension evidence

- Extension source truth: incumbent visual system `C:\Users\Aman\OneDrive\Desktop\Portfolio\artifacts\wow-desktop-final.png`, reinforced by the original MotionSites art-direction screenshot already documented above.
- Desktop implementation: `C:\Users\Aman\OneDrive\Desktop\Portfolio\artifacts\descent-intro-pass2.png`, `descent-reason-pass2.png`, `descent-action-pass2.png`, and `descent-release-pass1.png`.
- Mobile implementation: `C:\Users\Aman\OneDrive\Desktop\Portfolio\artifacts\descent-mobile-intro-pass1.png` and `descent-mobile-action-pass1.png`.
- Reduced-motion implementation: `C:\Users\Aman\OneDrive\Desktop\Portfolio\artifacts\descent-reduced-motion.png`.
- Desktop viewport and pixels: 1920 × 1080 CSS px and image px at density 1. Mobile viewport and pixels: 390 × 844 CSS px and image px at density 1.
- State coverage: entry core, SIGNAL, REASON, ACTION, proof handoff, work release, mobile action, and reduced-motion static cut.
- Full-view comparison: the incumbent hero, original art-direction reference, new entry, new mid-sequence, and mobile sequence were opened together in one comparison input. The extension preserves the incumbent typography, black/ivory/vermilion/acid tokens, industrial telemetry, authentic project imagery, and square control language while introducing one coherent scroll-controlled WebGL chapter.
- Focused evidence: the entry confirms the core fracture and spatial depth; the reason/action captures confirm real project artifacts passing through 3D gates; the release confirms the sequence lands directly on the existing project stack without a visual discontinuity.
- Primary behavior tested: CSS-sticky scroll stage, GSAP scrubbed chapters, camera depth progression, project texture planes, final anchor, responsive crop, single active WebGL context, offscreen disposal, and reduced-motion static fallback.
- Accessibility: axe reported 0 violations for desktop, mobile, and reduced-motion runs. Canvas-composited backgrounds remain automated manual-review items; visible text uses the established solid/controlled contrast treatment.
- Console: no runtime errors in the final pass. The renderer's development-only clock deprecation warning is inherited from the current Three.js integration and does not break the experience.

## Evidence-ledger refinement — latest QA

### Evidence

- Source visual truth: `C:\Users\Aman\AppData\Local\Temp\codex-clipboard-8f18c165-044d-401f-b46e-98eb67e724b7.png`
- Rendered desktop implementation: `C:\Users\Aman\OneDrive\Desktop\Portfolio\artifacts\evidence-ledger-desktop-final.png`
- Focused active-state implementation: `C:\Users\Aman\OneDrive\Desktop\Portfolio\artifacts\evidence-ledger-desktop-interaction.png`
- Mobile implementation: `C:\Users\Aman\OneDrive\Desktop\Portfolio\artifacts\evidence-ledger-mobile-pass1.png`
- Mobile dossier footer: `C:\Users\Aman\OneDrive\Desktop\Portfolio\artifacts\evidence-ledger-mobile-footer-pass1.png`
- Source pixels: 1920 × 1080. Desktop implementation pixels and CSS viewport: 1920 × 1080 at density 1. Mobile implementation pixels and CSS viewport: 390 × 844 at density 1.
- State: dark theme; cognitive-descent release immediately above selected work; Revive selected for the matched comparison, Autonomous Personal Agent selected for interaction verification.
- Intent normalization: the source is the incumbent page state that exposed the product problem—adjacent sections repeated the same projects with the same image-led presentation. The target was not pixel matching; it was preserving the established system while making the two regions serve clearly different jobs.

### Full-view comparison evidence

The source and final implementation were opened together in one comparison input at matching 1920 × 1080 dimensions. The source visibly moves from project imagery in the descent into another large project-image stack. The implementation preserves the black cinematic handoff, header, hairlines, oversized editorial typography, vermilion signal, and technical mono labels, then changes anatomy completely: a dark project index controls a light evidence dossier. No project image is repeated below the descent.

### Focused region comparison evidence

- `evidence-ledger-desktop-interaction.png` verifies the active row, dossier transition, four-step architecture path, failure-mode statement, verified proof list, technology labels, status, repository action, and previous/next controls.
- `evidence-ledger-mobile-pass1.png` verifies the editorial heading and project selector at 390 px without horizontal overflow.
- `evidence-ledger-mobile-footer-pass1.png` verifies the full dossier tail, source actions, and persistent previous/next navigation without collision or clipping.

### Required fidelity surfaces

- Fonts and typography: passed. Display scale continues the incumbent Space Grotesk/Cabinet-like editorial silhouette; mono labels remain secondary and legible; long project names wrap intentionally.
- Spacing and layout rhythm: passed. The descent-to-ledger pause is deliberate, the desktop split has a stable 36/64 rhythm, mobile stacks cleanly, and no horizontal overflow was detected.
- Colors and visual tokens: passed. Existing near-black, ivory, vermilion, acid, muted graphite, and hairline tokens are reused; active orange and dossier labels meet contrast requirements.
- Image quality and asset fidelity: passed. The new section intentionally uses no imagery because the adjacent descent already owns the project artifacts; no placeholder asset or fake image substitute was introduced.
- Copy and content: passed. “The spectacle ends. The evidence starts.” explicitly explains the change in mode, and each dossier is specific about architecture, failure, proof, status, and source.
- Icons and controls: passed. Phosphor arrows, checks, GitHub, and external-link icons share one family and align to square controls.
- Accessibility and responsiveness: passed. Interactive selectors are semantic buttons with pressed state; the architecture path is a labeled list; axe reports 0 violations after the label-contrast fix; desktop and 390 × 844 mobile have no horizontal overflow.

### Comparison history

1. **P2 — adjacent-section redundancy:** the source repeated the same projects and image-led case-study presentation immediately after the cognitive descent. Fixed by removing the sticky image stack and project modal, then replacing them with an evidence-ledger interaction. Post-fix evidence: `evidence-ledger-desktop-final.png`.
2. **P2 — section purpose ambiguity:** “Work with receipts” still behaved like another visual gallery, so the proof promise was not structurally fulfilled. Fixed with architecture flow, explicit failure mode, verified proof, honest status, technology, and source actions. Post-fix evidence: `evidence-ledger-desktop-interaction.png`.
3. **P2 — small-label contrast:** the first axe pass found the two 8 px evidence-grid labels at 4.16:1. Darkened the label token from `#6f7371` to `#5d615f`; the final axe run reports 0 violations.
4. **P2 — path semantics:** the first axe pass could not validate an `aria-label` on the untyped trace container. Converted the architecture path to a labeled list with list items; the final axe run reports 0 violations.

## Findings

No actionable P0, P1, or P2 findings remain. The only automated incomplete items are contrast calculations over the WebGL/gradient descent and the active-row pseudo-element, which were manually inspected against controlled dark or vermilion surfaces.

## Follow-up polish

- P3: Replace provisional biography and availability details after Aman supplies final experience, education, metrics, contact links, and preferred positioning.

final result: passed

## Project-transmission refinement — latest QA

### Evidence

- Source weak-state reference: `C:\Users\Aman\AppData\Local\Temp\codex-clipboard-40e32448-420e-4f40-9c59-5f8e55b06712.png`
- Live asset truth: `C:\Users\Aman\OneDrive\Desktop\Portfolio\public\assets\karixmc-live.png`
- Final desktop implementation: `C:\Users\Aman\OneDrive\Desktop\Portfolio\artifacts\project-transmissions-desktop-final.png`
- Final desktop system state: `C:\Users\Aman\OneDrive\Desktop\Portfolio\artifacts\project-transmissions-system-pass1.png`
- Final mobile implementation: `C:\Users\Aman\OneDrive\Desktop\Portfolio\artifacts\project-transmissions-mobile-final.png`
- Source pixels: 1920 × 1080, including browser chrome. Desktop implementation pixels and CSS viewport: 1920 × 1080 at density 1. Mobile implementation pixels and CSS viewport: 390 × 844 at density 1.
- Intent normalization: the supplied screenshot is an anti-reference for the work section's static evidence-only presentation. The target preserves the established editorial system while giving every project an immediate, authentic visual entry point and a second technical reading mode.

### Full-view comparison evidence

The weak-state screenshot, the actual KarixMC production capture, and the final implementation were reviewed in one comparison input. The prior split ledger explains projects but withholds the feeling of entering them. The replacement behaves like a project transmission console: a six-channel sticky index drives one large live interface stage, then an explicit `Interface / System` switch reveals the architecture, failure boundary, and verified proof without repeating the cognitive-descent sequence above it.

### Focused region comparison evidence

- `project-transmissions-desktop-final.png` verifies the six-channel selector, actual KarixMC production capture, one restrained scan transition, stack/status metadata, direct live/repository actions, and the large editorial case-study panel.
- `project-transmissions-system-pass1.png` verifies the alternate system anatomy: project thesis, `PLAY / SIGN / VERIFY / REWARD` path, and production proof including Nginx replicas, signed plugin traffic, and encrypted backups.
- `project-transmissions-mobile-final.png` verifies the complete production preview at 390 px with intentional containment, readable controls, no destructive crop, and no horizontal overflow.

### Required fidelity surfaces

- Fonts and typography: passed. The oversized editorial heading, compact mono channels, and readable project narrative preserve the existing hierarchy.
- Spacing and layout rhythm: passed. The 4/8 desktop console and stacked mobile hierarchy maintain strong negative space without dead zones, clipping, or overflow.
- Colors and visual tokens: passed. Existing black, ivory, graphite, acid, and per-project signal colors are reused consistently.
- Image quality and asset fidelity: passed. KarixMC uses a direct capture of `karixmc.pl`; all remaining projects use repository-grounded visuals rather than generated placeholders.
- Copy and content: passed. KarixMC is described as the deployed Minecraft reward network it is, including the Paper/Java boundary, web replicas, persistence, signed traffic, backups, repository, and live VPS deployment.
- Controls and motion: passed. Project channels, `Interface / System`, previous/next, and source actions are real controls; channel changes reset to interface mode and use one short scale/focus/scan transition.
- Accessibility and responsiveness: passed. Selector, tabs, anatomy path, and proof list have explicit semantics; the final axe run reports 0 violations; desktop and 390 × 844 mobile have no horizontal overflow.

### Comparison history

1. **P2 — static evidence-only hierarchy:** the previous work section explained the projects but did not let visitors immediately feel them. Fixed with the project-transmission console and authentic interface preview. Post-fix evidence: `project-transmissions-desktop-final.png`.
2. **P2 — missing production Minecraft project:** the portfolio omitted the deployed KarixMC system. Fixed by making it the featured channel using the real production capture, repository, live endpoint, and VPS architecture facts. Post-fix evidence: `karixmc-live.png` and `project-transmissions-desktop-final.png`.
3. **P2 — mobile destructive crop:** the first mobile preview cropped away too much of the production interface. Fixed with mobile `object-fit: contain`. Post-fix evidence: `project-transmissions-mobile-final.png`.
4. **P2 — proof semantics:** the first system-state proof region lacked explicit list semantics. Fixed with `role=list` and `role=listitem`; the final axe run reports 0 violations.

## Findings

No actionable P0, P1, or P2 findings remain. Automated contrast checks over the WebGL/gradient descent and composited transmission surfaces remain manual-review items; visible text was inspected against their controlled backgrounds.

## Follow-up polish

- P3: Replace provisional biography and availability details after Aman supplies final experience, education, metrics, contact links, and preferred positioning.

final result: passed
