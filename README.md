# Aman Kumar — AI / Full-Stack Engineering Portfolio

> A cinematic, inspectable portfolio for an engineer who builds accountable AI systems—not disposable demos.

[![Live portfolio](https://img.shields.io/website?url=https%3A%2F%2Faman-kumar-ai-portfolio.vercel.app&style=flat-square&label=PORTFOLIO&up_message=ONLINE&down_message=OFFLINE&color=d8ff4f&labelColor=090909)](https://aman-kumar-ai-portfolio.vercel.app)
[![Verify](https://github.com/ReaperXD67/aman-kumar-ai-portfolio/actions/workflows/verify.yml/badge.svg)](https://github.com/ReaperXD67/aman-kumar-ai-portfolio/actions/workflows/verify.yml)
[![React 19](https://img.shields.io/badge/React-19-7ea8ff?style=flat-square&logo=react&logoColor=white&labelColor=090909)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-Procedural_WebGL-ff5f38?style=flat-square&logo=threedotjs&logoColor=white&labelColor=090909)](https://threejs.org/)

[Live experience](https://aman-kumar-ai-portfolio.vercel.app) · [ATS résumé](https://aman-kumar-ai-portfolio.vercel.app/profile/aman-kumar-resume.pdf) · [LinkedIn](https://www.linkedin.com/in/aman-kumar-494601329/) · [GitHub profile](https://github.com/ReaperXD67)

![Aman Kumar's cinematic AI engineering portfolio](docs/portfolio-preview.png)

## The idea

Most portfolios list claims. This one lets visitors inspect the system behind them.

The experience moves through a procedural **Decision Loom**, cinematic project depth, real interface previews, and a **Validation Chamber**. The identity instrument reveals the person behind the engineering: Aman's portrait assembles from pixels, with the **Systems Kernel** available as its second view.

![The Person / System identity instrument in Aman Kumar's portfolio](docs/portrait-preview.png)

## Authored interactions

| Surface | What it communicates |
| --- | --- |
| **Decision Loom** | A scroll-controlled sensor → reasoning → execution sequence built with React Three Fiber. |
| **Cognitive descent** | Project systems move through cinematic depth without repeating the evidence surfaces below. |
| **Engineering X-ray** | Peel a real interface into four architecture layers. Inspect 24 implementation-linked decisions, failure boundaries and trade-offs across six builds—with keyboard, touch and reduced-motion controls. |
| **Validation Chamber** | Evidence, control, infrastructure, and interface constraints reshape one live signal field. |
| **Systems Kernel** | A voxel/pixel boot sequence compiles neural, agent, and infrastructure topology into one role-specific artifact. |
| **Person / System** | A finite raster scan assembles Aman's approved portrait, then holds a clear photograph. Replay or switch to the interactive kernel with keyboard and touch controls. |
| **Living résumé** | One stable runtime manifest keeps the canonical ATS résumé replaceable without rewriting interface code. |
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
- **Performance:** viewport-aware rendering, hidden-tab suspension, finite portrait animation, 72 KB main portrait, and a 2.6 KB first-screen thumbnail
- **Typography:** Space Grotesk + JetBrains Mono
- **Delivery:** Vercel production deployment, Sites-compatible worker output, automated build verification

## Run locally

```bash
npm install
npm run dev
```

Production verification:

```bash
npm run build
npm run test:sites
```

The build must emit `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.

## Release integrity

Production changes pass the Vite build and Sites worker contract before deployment. The public résumé uses one stable route and a versioned runtime manifest; releases verify that the deployed PDF is byte-identical to the canonical local artifact, so portfolio, GitHub, and recruiter links cannot silently drift apart.

## Project structure

```text
src/                     portfolio application and procedural scenes
public/                  project captures, résumé, certificate, runtime manifest
worker/                  Sites-compatible production worker
scripts/                 build preparation
tests/                   production handoff verification
docs/portfolio-preview.png
```

## Status

Actively maintained. The deployed experience is the canonical version; this repository is its inspectable source and verification trail.
