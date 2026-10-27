# Portfolio direction research — 27 October 2026

Research brief: improve Aman's existing cinematic engineering portfolio with authored interaction and recruiter clarity. These are selected references, not an objective ranking of the world's best portfolios. Research inspected the owners' sites, public content, and source repositories. No third-party artwork, branding, or implementation was copied into the portfolio by this research pass.

## References and what transfers

| Primary reference | Observed strength | Application to this portfolio |
| --- | --- | --- |
| [Bruno Simon](https://bruno-simon.com/) · [2025 source](https://github.com/brunosimon/folio-2025) | One coherent interactive world with explicit navigation and controls; the author exposes the build's source and production context. | Preserve the Decision Loom / descent world. Make each visitor action produce a legible change in the same system, rather than adding unrelated effects. |
| [Brittany Chiang](https://brittanychiang.com/) · [v4 source and attribution policy](https://github.com/bchiang7/v4) | Immediate role positioning, accessible content, chronological experience, direct work and résumé links. | Keep role, location, current internship, résumé, and direct source visible without requiring the cinematic journey. Retain semantic navigation and keyboard access. |
| [Dennis Snellenberg](https://dennissnellenberg.com/) | Large personal introduction, concise positioning, selective project presentation, and a direct contact close. | Increase the prominence of the person and actual project captures; keep surrounding chrome subordinate to the work. No source reuse is proposed. |
| [Lusion](https://lusion.co/) | A clear focus on 3D storytelling backed by a selected-work surface and explicit project disciplines. | Each motion sequence should explain a particular engineering idea and resolve into inspectable evidence. The existing descent remains the primary spatial sequence. |
| [Josh W. Comeau — Squash and Stretch](https://www.joshwcomeau.com/animation/squash-and-stretch/) | Interactive controls make an abstract behavior observable; examples account for keyboard use and reduced motion. | Let a visitor challenge an engineering boundary and immediately see a source-grounded response. Use restrained state transitions, readable final states, and accessible controls. |
| [Eugene Yan](https://eugeneyan.com/) | A short engineering position connects to prototypes, technical writing, and implementation resources. | Link each strongest project to a specific decision and implementation, with honest status. The source is a destination, not a decorative icon. |
| [Chip Huyen](https://huyenchip.com/) | A focused personal thesis is supported by named work and public artifacts. | Carry one consistent evidence-first engineering thesis across the portfolio, GitHub, résumé, and LinkedIn. Aman's career claims remain his own. |

The raw [Bruno package manifest](https://raw.githubusercontent.com/brunosimon/folio-2025/main/package.json) was also inspected: the work uses Three.js, GSAP, Rapier, camera controls, and an asset-processing toolchain. That does not imply this portfolio needs those extra dependencies. Its existing React/Three.js/GSAP foundation already supports the proposed interaction. Bruno's site and repository license file describe MIT licensing; package metadata separately says ISC. Inspect the relevant license before any future code reuse. Brittany explicitly requests visible attribution for forks. This pass borrows principles and writes no copied source.

## Implementation decision: challenge the boundary

The highest-value next feature is a compact failure-inspection interaction inside the existing Engineering X-ray. It develops the current interface rather than adding a second long pinned section.

1. Begin with the real project capture and the existing Surface / Structure / Decisions controls.
2. Offer one focused challenge for that project: replay a signed message, return a stale worker, or ask a question without sufficient evidence.
3. Show a short authored sequence of the request, the relevant boundary, the response, and the direct source link. Label it an explanatory scenario, not telemetry or a request to the production system.
4. Keep the failure, decision, and limitation readable in the same stage. A visitor should understand why the control exists without reading a full repository.
5. Allow immediate replay/reset and keyboard control. With reduced motion, show the completed explanation directly. Use 44px touch targets and a single-column arrangement on narrow screens.

Suggested source-grounded scenarios from `src/project-xray-data.js`:

- **KarixMC:** signed message reaches the boundary twice → nonce/replay check rejects reuse → follow `lib/plugin-auth.ts`. Do not imply live fraud detection or real money movement.
- **Autonomous Personal Agent:** worker loses ownership → stale completion is refused → follow the durable-lifecycle decision record. Do not promise universal exactly-once side effects.
- **AtlasLM:** retrieved passages do not sufficiently support a question → evidence gate can stop generation → follow the retrieval/grounding implementation. Do not promise zero hallucinations.
- **Revive:** proposed recovery violates consent/approval policy → proposal is held or blocked → follow the policy engine. Public outcomes remain simulated.

## Delivery criteria

- The new portrait remains recognizable after its brief pixel assembly; no continuous degradation effect obscures it.
- The role and professional links remain available within the first screen and through the Signal Operating System.
- No duplicated major project imagery or second competing pinned sequence.
- Controls operate by touch and keyboard. Reduced motion preserves all content and decisions.
- Check 320px phone, tablet landscape, and desktop layouts for overflow, clipped labels, focus visibility, and readable source paths.
- Treat project status and illustrative sequences as explicit content, never invented metrics.

This document records research and the recommended direction. Actual shipped behavior and browser verification belong in the main README and delivery record.
