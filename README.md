# Aman Kumar — AI / Full-Stack Engineering Portfolio

> A cinematic, inspectable portfolio for an engineer who builds accountable AI systems—not disposable demos.

[![Live portfolio](https://img.shields.io/website?url=https%3A%2F%2Faman-kumar-ai-portfolio.vercel.app&style=flat-square&label=PORTFOLIO&up_message=ONLINE&down_message=OFFLINE&color=d8ff4f&labelColor=090909)](https://aman-kumar-ai-portfolio.vercel.app)
[![Verify](https://github.com/ReaperXD67/aman-kumar-ai-portfolio/actions/workflows/verify.yml/badge.svg)](https://github.com/ReaperXD67/aman-kumar-ai-portfolio/actions/workflows/verify.yml)
[![React 19](https://img.shields.io/badge/React-19-7ea8ff?style=flat-square&logo=react&logoColor=white&labelColor=090909)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-Procedural_WebGL-ff5f38?style=flat-square&logo=threedotjs&logoColor=white&labelColor=090909)](https://threejs.org/)

[Live experience](https://aman-kumar-ai-portfolio.vercel.app) · [One-page résumé](https://aman-kumar-ai-portfolio.vercel.app/profile/aman-kumar-resume.pdf) · [LinkedIn](https://www.linkedin.com/in/aman-kumar-494601329/) · [GitHub profile](https://github.com/ReaperXD67)

![Aman Kumar's full-stage Decision Loom](docs/portfolio-foundry-2026-10-27.jpg)

## The idea

Most portfolios list claims. This one lets visitors inspect the system behind them.

The opening carries a fluid **Decision Loom** into a curved project world through one shared WebGL renderer and camera. The final KarixMC capture docks into its interactive **Engineering X-ray** lens; the proof band follows selected work. The inspected architecture seeds the **Validation Chamber**. The ending's **Signal Current** peels from the real portrait in colours sampled from the photograph, follows scrolling through a continuous 3D curve and gathers at the contact form. These surfaces share a dark world while their native controls and readable content remain in normal flow. The **Systems Kernel** remains the portrait's optional second view.

![Aman Kumar — AI Engineer and Full-Stack Developer](public/assets/portfolio-social-preview-v3.png)

## Authored interactions

| Surface | What it communicates |
| --- | --- |
| **Decision Loom** | Nine bevelled titanium apertures and 144 GPU ribbons deform through sensor array → reasoning braid → execution vector. Bounded elastic strain and traveling waves reshape the metal and field; the same geometry opens into longitudinal entry rails. Direct mode controls, pause and a settled reduced-motion composition remain available. |
| **Cognitive descent** | The opening's shared camera continues through 31 instanced angular gates and twelve braided rails toward AtlasLM, the autonomous agent and KarixMC. One measured document route drives the passage, flight and arrival. The flight settles at rest; native skip links and a source-linked static collection preserve direct access. |
| **Engineering X-ray** | The final KarixMC artifact docks to the measured, contain-fit DOM capture while measured exclusions protect arrival text, navigation and controls. Project switches use a bounded 1.04-second image-plane handoff. Twenty-four source-linked decisions, finite route playback and failure walkthroughs expose the engineering. Keyboard, touch and reduced-motion controls remain available. |
| **Validation Chamber** | The selected project's actual circuit nodes and routes seed 84 particles, then transfer once into the active principle's pattern. Pointer or principle-tab input takes control immediately. Its native field retains a finite boundary exit; Signal Current continues the reading route with independent GPU geometry. |
| **Systems Kernel** | A voxel/pixel boot sequence compiles neural, agent, and infrastructure topology into one role-specific artifact. |
| **Person / System** | A finite 2.85-second raster scan assembles Aman's approved portrait, then holds a clear photograph. Particles peel from a gold seam spanning 52–88% of its right edge after assembly; the face stays fixed. Replay or switch to the interactive kernel with keyboard and touch controls. |
| **Signal Current** | One foreground points object carries 12,000 desktop / 4,000 phone particles from a continuous portrait-edge peel into the measured contact receiver. Each particle retains a colour sampled at its birth point in the photograph. A moving root cohort, helical volume and tightening final curl connect scroll-driven travel to the camera's orbit/dolly. Opaque native surfaces and shader guards protect the photograph, text and form. Contact stays connected until the footer enters. A Method button and command-palette action pause flow; reduced motion shows a still. |
| **Living résumé** | One stable runtime manifest keeps the canonical one-page résumé replaceable without rewriting interface code. Selectable text, embedded fonts, and source links remain independently verifiable. |
| **Signal Operating System** | Persistent GitHub, LinkedIn, X, and résumé access plus `/` command search, a recruiter quick-read, native sharing, and a mobile action tray. |

## Selected systems inside the portfolio

- **KarixMC / MinePulse** — live VPS-hosted Minecraft network with a Paper-plugin boundary and an inspectable production surface.
- **AtlasLM** — evidence-grounded document intelligence with dense + sparse retrieval, reranking, and citations.
- **Autonomous Personal Agent** — controlled agent architecture with tool boundaries, memory, and safe execution paths.
- **Revive** — explainable payment-recovery orchestration with deterministic policies and verified test evidence.
- **GPT Prototype** — a twelve-layer decoder-only transformer implemented from first principles as a learning and systems artifact.

## Engineering surface

- **Interface:** React 19, Vite, TypeScript/JavaScript, responsive semantic UI
- **Spatial system:** Three.js, React Three Fiber, Drei, postprocessing
- **Motion:** GSAP, Motion, scroll-linked timelines, reduced-motion fallbacks
- **Rendering:** the demand-rendered opening caps base pixels at 1.8 million; the standalone hero retains 2.2 million. Signal Current caps backing pixels at 1.2 million and DPR at 1.35. Static seeds and an analytic path derivative avoid CPU mesh rebuilds and a second path evaluation per particle. Masks and camera matrices are cached when unchanged; diagnostics update at 150ms intervals or on state changes. Flow suspends offscreen, in hidden tabs or on pause.
- **Loading:** the ending renderer loads within 900px of its range, with direct ending links ready immediately. Those links avoid initially mounting the opening renderer. The full portrait loads lazily at approximately 149 KiB; the first-screen thumbnail is 4.6 KiB. Native text, links and controls render independently of the spatial scenes.
- **Portrait colour:** a cached 64 × 64 read of the already-decoded photograph supplies a static RGB particle attribute. Sampling uses the native cover crop and birth locations across the right edge. The existing thumbnail supplies colours on a cold contact link until the full portrait is available. Normal alpha blending retains those hues; sampling introduces no asset request, GPU texture or per-frame image read.
- **Typography:** Space Grotesk + JetBrains Mono
- **Delivery:** Vercel production deployment, Sites-compatible worker output, automated build verification

The preceding loading optimization reduced the entry bootstrap from 1,415,077 to 667,034 raw bytes (52.9%), with scene chunks loaded separately. This is a prior release baseline, not a measurement of total transfer, loading time or frame rate for the colour revision.

## Run locally

```bash
npm install
npm run dev
```

Production verification:

```bash
npm run build
npm run test:sites
npm run test:profile
npm run test:motion
```

The build must emit `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.

`test:motion` includes 33 source/math checks covering native portrait crop and RGB sampling, edge registration, contact and footer exit, Signal Current seeds/camera/damping, capture protection, contain-fit and Loom invariants. Four Sites checks and fourteen profile checks bring the suite total to 51. Build, browser and release verification for the colour revision are recorded in the [current verification record](docs/signal-current-verification-2026-10-28.md); the production build and desktop/mobile browser checks pass. Automated checks alone do not establish visual quality or deployment status.

## Release integrity

Production changes pass the Vite build and Sites worker contract before deployment. The public résumé uses one stable route and a versioned runtime manifest; releases verify that the deployed PDF is byte-identical to the canonical local artifact, so portfolio, GitHub, and recruiter links cannot silently drift apart.

The October 2026 refresh uses Aman's supplied yellow-kurta portrait with a charcoal studio background and identity-preserving lighting, plus new versioned 1200 × 630 shared-link artwork. The canonical résumé remains photo-free: one column, readable text, embedded fonts, and specific engineering decisions grounded in project sources. Its PDF, preview, and digest manifest are generated together. See [résumé research and validation](docs/resume-research-2026-10-27.md) and [portfolio reference research](docs/portfolio-research-2026-10-27.md).

The shared résumé resolver validates the runtime manifest, refreshes local document URLs when the PDF digest changes, and exposes a retryable fallback when a version check fails. The command palette supports accent-insensitive search (`resume`), `CV` aliases, ranked direct matches, and keyboard selection. Recruiter actions precede the project detail cards; mobile professional links use full labels.

The [motion upgrade record](docs/motion-upgrade-2026-10-27.md) covers the full-stage hero, project transmissions, real GitHub contribution animations, installed official GSAP guides, research provenance and verification. The [earlier identity delivery](docs/profile-upgrade-2026-10-27.md) records the portrait, canonical résumé and saved LinkedIn copy. Existing LinkedIn and GitHub account photos are intentionally retained.

The opening uses a shared renderer and blended viewport lighting; its capture dock clips around measured narrative plates before reaching Work. Its mobile captions, footer and progress reserve space for the fixed professional-action tray. Signal Current peels from the actual portrait edge and follows scrolling into contact. Endpoint measurements update immediately while the camera settles independently. Native opaque surfaces sit at layer 3 above the current's layer 2, covering it during compositor scrolling before the next shader mask update. See the [Signal Current research](docs/signal-current-research-2026-10-28.md) and [current verification](docs/signal-current-verification-2026-10-28.md), alongside the [continuity research](docs/continuous-experience-research-2026-10-28.md), [Loom geometry contract](docs/continuous-loom-geometry-2026-10-28.md) and [opening verification](docs/continuous-experience-verification-2026-10-28.md). The [earlier ending record](docs/cinematic-ending-verification-2026-10-28.md) is historical and describes the superseded contour/sheet iterations. A source or math check is not a browser or deployment result.

The [hero research](docs/immersive-hero-research-2026-10-27.md), [curved camera research](docs/immersive-scroll-research-2026-10-27.md), and [project handoff research](docs/project-transition-research-2026-10-27.md) document the references behind the original geometry and owned artifacts. Explicit project selection brings an offscreen stage into view before its handoff plays. GitHub ends with an original Contribution Loom made from the actual daily calendar; the snake and skyline remain optional closed disclosures after it.

The [earlier Signal Foundry verification](docs/signal-foundry-verification-2026-10-28.md) records the preceding iteration's browser findings, fixes and build checks.

The GitHub reading path also has a dedicated [project-showcase source investigation](docs/github-showcase-research-2026-10-27.md) and [body design audit](docs/github-body-design-audit-2026-10-27.md). These address the text-heavy project sections below the animated entrance: real product captures, illustrated engineering boundaries, compact visible decisions and direct source proof. The separate profile repository owns its generators, responsive assets and publication evidence.

PDF structural checks also run in CI. To rebuild, run `python scripts/build-resume.py`; install `scripts/requirements-resume-qa.txt` in a Python environment and run `python scripts/verify-resume.py` for structural checks. The PDF is checked for image-free structure, text order, embedded fonts, legible text, links, and ordinary metadata; this is not an ATS vendor certification.

Portrait delivery exports use `node scripts/export-profile-photo.mjs <source-png> <YYYYMMDD>`. The current social artwork is reproducible with `pwsh -File scripts/render-portfolio-social-preview-v3.ps1`. These mechanical exports preserve the generated portrait treatment. Earlier versioned originals remain available.

## Project structure

```text
src/                     portfolio application and procedural scenes
public/                  project captures, résumé, certificate, runtime manifest
worker/                  Sites-compatible production worker
scripts/                 build preparation
tests/                   production handoff verification
docs/portfolio-foundry-2026-10-27.jpg
```

## Status

Actively maintained. The deployed experience is the canonical version; this repository is its inspectable source and verification trail.
