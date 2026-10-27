# Motion audit and skill review — 27 October 2026

The user rejected the first refresh as too restrained. The requested result is a visibly more animated GitHub profile and an ambitious portfolio, while retaining the existing industrial AI-system world, truthful evidence, current account avatars and recruiter access.

## Why the current first impression reads quietly

Code inspection found that the hero's artifact lives inside a conventional bordered right-hand panel. Forty narrow box meshes and five fine rails occupy that panel. The camera is fixed; pointer input changes rotation by only about 0.13/0.2 radians. The three different configurations are largely hidden behind manual bottom controls. This is functional, but the artifact's visible amplitude and material richness do not match the cinematic promise.

The selected-work instrument has a different problem: six text tabs are the entrance to large real project captures, so the real visual evidence is withheld until after a reading decision. Switching projects replaces content immediately without a spatial handoff. The 24 source decisions and explicit failure walkthroughs are useful and should remain; the entrance and transition need stronger authorship.

## Three decisive changes

1. **Let the hero artifact lead the first viewport.** Unbox the composition and make a directional field visibly organize into sensor array, reasoning braid and execution vector during a finite first entrance. Use instanced geometry and camera framing rather than hundreds of independent React mesh components. Preserve direct control and a legible static composition with reduced motion. The identity Systems Kernel remains geometrically distinct.
2. **Make project selection a capture-led contact sheet.** Use the six existing project captures/blueprints as the actual navigation material, preserve project status and roving keyboard focus, and show the selected project name at editorial scale. Visitors can recognize a product before reading its implementation notes.
3. **Give each project switch an optical handoff.** A short segmented shutter carries the previous real capture away while the next instrument is already present underneath. This makes the project change visible without adding another long pinned sequence, remote request, fabricated telemetry or loading interstitial.

Changes 2 and 3 are implemented in `src/ProjectXRay.jsx`, `src/ProjectPortal.jsx` and `src/project-xray.css`. The shutter sequence lasts less than one second, cancels on remount, never intercepts pointer events, and is omitted under reduced motion. Existing 24 notes, source paths, failure traces and project actions remain intact. The filmstrip uses local real assets and works through ordinary tab buttons, keyboard arrows/Home/End, and touch. On phones it becomes a native horizontal snap rail with a visible next-frame cue, keeping the selected instrument close instead of stacking six cards above it.

## Skill discovery

The installed **Impeccable** skill already supplies focused `animate`, `bolder`, `overdrive` and craft guidance. The implementation used its scoped animate/bolder guidance: one meaningful transition, bounded mask/transform work, default-visible content and no extra dependency. Its pinned visual rules are subordinate to this project's explicit industrial instrument direction.

The current official [OpenAI curated skill catalog](https://github.com/openai/skills/tree/main/skills/.curated) was queried through the bundled skill-installer helper. It does not currently offer a dedicated frontend-animation skill, so installing unrelated curated skills would not improve this task.

A focused additional source is [GreenSock's official GSAP skills](https://github.com/greensock/gsap-skills), inspected at commit `aed9cfd3277740755f6bfc1155c7aa645403b760` (MIT). Its `gsap-react`, `gsap-scrolltrigger`, `gsap-timeline` and `gsap-performance` files are relevant to the existing runtime. Source review confirmed scoped `useGSAP`, cleanup, bounded simultaneous work, transform/opacity preference, and `quickTo` for pointer-driven updates. Installation was coordinated with the root agent rather than adding an unreviewed bundle.

Primary references inspected:

- [GSAP React skill](https://github.com/greensock/gsap-skills/blob/aed9cfd3277740755f6bfc1155c7aa645403b760/skills/gsap-react/SKILL.md)
- [GSAP ScrollTrigger skill](https://github.com/greensock/gsap-skills/blob/aed9cfd3277740755f6bfc1155c7aa645403b760/skills/gsap-scrolltrigger/SKILL.md)
- [GSAP performance skill](https://github.com/greensock/gsap-skills/blob/aed9cfd3277740755f6bfc1155c7aa645403b760/skills/gsap-performance/SKILL.md)
- [Impeccable source](https://github.com/pbakaus/impeccable)
- [React Three Fiber source](https://github.com/pmndrs/react-three-fiber): the current React 19 / Fiber 9 pairing is supported; the existing rendering stack is sufficient.

No third-party artwork or animation source was copied into the project-switch implementation. The transition uses the project's own captures and authored CSS geometry. No additional runtime package was installed for it.

## Verification scope

Both changed JSX modules parsed with the project's installed esbuild. The Impeccable mechanical detector reported only the pre-existing grid inside the architectural inspection canvas; that grid belongs to an actual blueprint/measurement surface and is retained intentionally. Final browser verification should batch desktop/mobile project switching, rapid repeated selection, keyboard focus, 24 layer controls, reduced motion and image failure with the root agent's hero changes. This document does not claim those final integration checks have already passed.
