# Aman Portfolio Design System

## Direction

Cinematic intelligence interface: near-black canvas, white/graphite typography, dense monospace telemetry, editorial scale, hairline borders, and one live procedural Three.js object. The MotionSites screenshot is inspiration for atmosphere and contrast only; no brand, layout, or copy is duplicated. Runway-inspired principles strengthen the current system: the visual artifact leads, interface chrome recedes, imagery is cinematic, and depth comes from light and composition rather than decorative shadows.

## Tokens

- Canvas: `#050505`; raised surfaces: `#0b0b0b` and `#111212`.
- Text: `#f5f5f1`; muted: `#8b8f91`; hairlines: `#252728`.
- Primary signal: vermilion `#ff5f38`; proof/success: acid `#d8ff4f`; secondary signal: blue `#7ea8ff`.
- Display/body: Cabinet Grotesk with Space Grotesk Variable as the fallback, regular-to-medium weights, tight tracking no tighter than `-0.04em`.
- Technical labels: JetBrains Mono Variable, uppercase, wide tracking.
- Shape: square functional controls and image frames; only status lights are circular.
- Elevation: borders and surface contrast, never drop shadows on content cards.

## Layout

- Desktop hero is a wide editorial split: a three-line statement with a real project image embedded in the typography, and an interactive directional Decision Loom on the right. Its sensor array, reasoning braid, and execution vector must never resemble the identity kernel's orbital reactor.
- Proof moves into a gapless 12-column band below the hero (`3 + 3 + 3 + 3`) with a restrained continuous signal ticker.
- Selected work is a full-width project-transmission console: a six-channel selector controls a large real product preview, an Interface/System switch, architecture flow, failure mode, verified proof, technology, and source links. KarixMC leads with a capture from the live production site and its game-to-web trust boundary.
- Method is a black Validation Chamber embedded in the light editorial surface. Its live canvas convergence field changes with four semantic stages while a dedicated readout explains the engineering law and trace.
- Identity uses no portrait. A procedural WebGL Systems Kernel combines a neural reactor, agent-routing topology, and compiler monolith inside the original editorial frame, with real system telemetry surrounding the artifact.
- Experience is a horizontal three-signal career selector feeding one large operating-evidence stage, followed by a separate education signal. It must not reuse the selected-work console’s left-index anatomy.
- Résumé and micro1 certification live in a two-artifact proof vault. Both open their original source in a focused native dialog, and the résumé reads its URL/version from `/profile/resume.json` at runtime.
- Contact is a light editorial split with a real validated form that hands a pre-filled brief directly to Aman’s email client, plus visible email and phone fallbacks.
- Mobile collapses to one deliberate column with 44px minimum touch targets and no horizontal page overflow.

## Motion

- Entrance and hover motion uses short directional movement with exponential easing.
- The hero Decision Loom responds to pointer position, can be clicked directly, and morphs forty directional shards through three spatially distinct states without using a central globe or orbital rings.
- The primary authored moment is the scroll-controlled cognitive descent between proof and work: the hero core fractures, the camera passes through signal/reason/action gates and real project artifacts, then the sequence releases into evidence inspection.
- The project-transmission console is the analytical counterpoint to that descent. Channel changes use a single signal wipe, image scale/focus transition, and card replacement; the interface/system switch reveals the build without adding another pinned spectacle.
- The identity kernel boots in four authored acts: signal corruption, voxel convergence, topology mapping, and stack compilation. The assembled system responds magnetically to the pointer and exposes a user-triggered overclock state. Career and artifact changes remain subordinate.
- WebGL scenes mount only when near the viewport so the hero and descent do not compete for GPU resources.
- Continuous ticker and WebGL rendering pause or become static under reduced-motion/offscreen conditions.
- `prefers-reduced-motion` disables continuous movement, bloom, and decorative transitions while preserving the final readable state.

## Content Rules

- Claims may come from Aman’s supplied résumé and certificate as well as his public GitHub profile or repository documentation.
- Always label prototype/local-alpha/research work honestly.
- Prefer proof (tests, architecture, constraints, deployed links) over generic adjectives.
- Treat KarixMC as a production system: `karixmc.pl`, two loopback app replicas behind Nginx, PostgreSQL, Redis, encrypted recurring backups, and HMAC-signed Paper-plugin traffic are grounded in the local project documentation.
- Do not invent employers, degrees, client outcomes, awards, or personal metrics.
- Verified personal source facts include SIP Organization (Project Lead Developer Intern, Jul 2026-present), micro1 (AI Engineer Intern, Aug 2025-Jul 2026), independent AI/ML development (2025-present), and Scaler School of Technology in collaboration with BITS Pilani (BSc Computer Science, Aug 2024-Sep 2028).
