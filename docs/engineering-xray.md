# Engineering X-ray

The selected-work section is an inspection instrument, not a simulated production console. It combines a real product capture (or an explicitly labeled project blueprint), four architectural layers, and implementation-linked engineering notes.

## Interaction contract

- Surface, Structure, and Decisions controls set inspection depth directly.
- A native range input supports touch and Home/End/arrow keys.
- Project tabs use roving focus with Left/Right/Home/End navigation.
- Selecting a layer opens its failure mode, design choice, trade-off, and source file.
- The short desktop scroll reveal stops as soon as a visitor takes control. Scrolling is never captured or pinned.
- Reduced motion removes transitions and automatic peeling; all content and controls remain usable.
- An unavailable project image leaves the architecture, implementation links, and project links available.

## Content maintenance

Project metadata and status live in `src/App.jsx`. The 24 source notes and schematic component names live in `src/project-xray-data.js`. Keep source paths and operational limitations aligned with the linked repositories. Never label an illustrative diagram as live traffic or use demo outcomes as customer results.

Revive is explicitly a live prototype. AtlasLM distinguishes local Qdrant from its Upstash serverless deployment. Autonomous Personal Agent remains a local alpha. GPT Prototype uses the verified twelve-layer specification rather than the former approximate parameter count.

## Verification — 5 September 2026

- Production build and all four Sites packaging tests passed.
- Six projects and all 24 layer controls exercised; source links and pressed state followed each selection.
- Project keyboard navigation, slider Home/End, manual override, and image-failure fallback checked.
- No page overflow at 320, 390, 768, 844, 1024, 1440, and 1920 pixels; architecture sheets fit the inspection lens at the extreme widths.
- New interaction targets meet the 44px minimum. Reduced-motion transitions resolve to zero duration.
- Approved portrait loads; canonical résumé manifest references the September 5 PDF. The single-column PDF has selectable text, embedded subset fonts, ten links, and a SHA-256 recorded in the manifest.

Testing used an isolated local preview. It did not access a signed-in browser profile, alter LinkedIn, upload an account avatar, send messages, or publish posts.
