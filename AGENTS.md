# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.

## Durable visual direction

- Preserve the cinematic black, industrial, editorial AI-system identity established in `DESIGN.md`.
- Favor a small number of high-impact, technically authored interactions over generic card decoration or scattered effects.
- The portfolio should feel surprising and premium—especially the procedural hero object and project-scroll experience—while remaining responsive, accessible, and honest about project status.
- When pushing the experience further, combine ambitious effects into one coherent authored sequence. The preferred direction is maximal and cinematic—scroll-controlled spatial storytelling, WebGL depth, and project artifacts—without scattering unrelated decorative animations across the page.
- Adjacent major sections must not repeat the same project imagery or interaction anatomy. Treat the cognitive descent as the cinematic overview and the selected-work section as an evidence-inspection surface: architecture path, failure mode, verified proof, and source links.
- The selected-work surface must not feel like a static ledger. Lead with a real project preview, let visitors switch between interface and system anatomy, and reveal proof through an authored “project transmission” interaction. KarixMC is a featured production project and should be presented with its real live-site capture, VPS status, Paper-plugin boundary, and source links.
- Personal positioning is “AI Engineer & Full-Stack Developer,” based in Bengaluru, India, available for AI engineering, full-stack roles, internships, and freelance/contract builds in any work mode.
- Never use a human portrait in the identity section. The approved identity visual is a role-specific procedural Systems Kernel: neural reactor + agent topology + compiler monolith, reconstructed through a dramatic pixel/voxel boot sequence and made pointer-reactive with an explicit overclock state.
- Hero and identity procedural objects must use clearly different geometry and motion languages. The hero is a directional Decision Loom that changes from sensor array to reasoning braid to execution vector; the identity artifact remains the spherical Systems Kernel.
- Method is an interactive Validation Chamber rather than a row of principle cards: visitors should see evidence, control, infrastructure, and interface rules reorganize a live signal field.
- The identity thesis is “Not artificial intelligence. Accountable intelligence.” and should compile visibly from rejected language into the final accountable position.
- Experience, education, dates, links, and credential claims must remain grounded in `Aman_Kumar_Resume_ATS.pdf` and the supplied micro1 certificate. Strong writing is welcome; fabricated employers, dates, outcomes, or metrics are not.
- Keep the résumé at one canonical stable route with a small runtime manifest so Aman can replace the PDF or point the portfolio to a permanent external source without editing interface code.
- The preferred public deployment target is Vercel. Sites may remain a secondary preview, but future production handoffs should return the Vercel URL unless Aman says otherwise.
- GitHub profile and repository surfaces should mirror the portfolio's evidence-first positioning, use the canonical Vercel and résumé URLs, and favor authored system graphics plus verifiable proof over generic badge walls.
