# GitHub motion research and implementation — 27 October 2026

Aman's latest feedback explicitly asks for a much more animated README and the reusable repositories behind animated contribution fields. That supersedes the previous decision to omit a contribution snake. The aim here is a visibly different first screen and actual-data motion, while preserving the account avatar, canonical links and source-grounded project facts. This is a curated investigation, not a claim that every repository on the internet has been exhausted or objectively ranked.

## Reusable systems inspected

| Primary repository | What it actually supplies | Decision |
| --- | --- | --- |
| [Platane/snk](https://github.com/Platane/snk) | A solver turns GitHub contribution days into an animated snake path, exporting SVG/GIF; current npm generator supports direct rendering. | **Integrated:** exact npm `generate-snake-animation@3.5.0`; actual Aman's calendar; green cells and an acid signal; committed SVG and static calendar. |
| [github-profile-3d-contrib](https://github.com/yoshi389111/github-profile-3d-contrib) | MIT generator for isometric contribution buildings, growth animation, activity radar and language presentation. | **Integrated:** immutable revision `e235d118909be71eb7edb05482a3de4e76156df3`, executable digest checks, custom dark/green/acid palette, animated and static SVGs; MIT notice preserved. |
| [Arcade Contribution Graph Games](https://github.com/abozanona/pacman-contribution-graph) | Current library exposes Pac-Man, Breakout, Galaga, Puzzle Bobble, Bomberman and Minesweeper SVG scenes, real-data platform mode and synthetic demo mode. | Evaluated for a playful alternative. The shipped front path uses snake plus an optional skyline to avoid repeating the same calendar in six unrelated game skins. No synthetic scenario is used. |
| [lowlighter/metrics](https://github.com/lowlighter/metrics) | A mature generator with multiple plugins and configurable profile infographics. | Existing self-owned public metrics remain secondary; a second large metrics installation would duplicate data and increase maintenance. |
| [readme-typing-svg](https://github.com/DenverCoder1/readme-typing-svg) | Configurable SVG typing/deleting text. | Inspected alongside [DenverCoder1's actual profile](https://github.com/DenverCoder1/DenverCoder1), which shows how it combines with contribution and project widgets. Essential role text remains immediately visible instead of cycling out. |
| [capsule-render](https://github.com/kyechan99/capsule-render) | Dynamic configurable header/footer graphics with visual presets. | Compared against a project-owned header. Aman's original Decision Loom better connects the GitHub entrance to the portfolio's actual visual identity. |
| [github-readme-activity-graph](https://github.com/Ashutosh00710/github-readme-activity-graph) | A generated graph of recent activity. | The rolling calendar and skyline already supply activity motion; another line graph would repeat the same information. |
| [github-readme-stats](https://github.com/anuraghazra/github-readme-stats) | Repository/stat cards with self-hosting options. | Existing direct project CI/source links remain more specific engineering evidence. No popularity or language-byte score is presented as competence. |
| [skill-icons](https://github.com/tandpfun/skill-icons) | Recognizable tool and language icons. | Searchable visible stack text stays available; an icon wall is not the visual centerpiece. |
| [andreasbm/readme](https://github.com/andreasbm/readme) | Reusable README presentation/documentation patterns. | Applied the maintenance principle: current capabilities, regeneration commands, source provenance and constraints stay documented. |
| [innng's actual profile](https://github.com/innng/innng) | A strong coherent identity, small animation and role text; its source shows actual typing-SVG and image use. | Used as a composition reference; no character art, identity or biography copied. |
| [awesome-github-profile-readme](https://github.com/abhisheknaiidu/awesome-github-profile-readme) | A discovery catalog for profile techniques and source profiles. | Used as an index, then inspected the actual component repositories and source rather than treating list inclusion as proof of quality. |

## New visible composition

The current header is an original procedural three-dimensional Decision Loom rendered into a full-color APNG. Twenty-two braided strands rotate in perspective while an acid signal crosses the structure. Large name typography, the actual engineering role, the supplied portrait, and accurate career context stay readable throughout the loop. This is a substantial replacement for the earlier finite portrait scan, which became indistinguishable from a still after 1.7 seconds.

Desktop and portrait-first mobile compositions are separate. APNG retains the portrait's full RGB shading; the motion loops every 4.68 seconds. Static PNGs are chosen by reduced-motion picture sources, and direct static links remain available. The first screen's canonical portfolio, recruiter view, résumé and contact links remain ordinary Markdown.

The next section exposes the actual-calendar contribution snake by default, with a native collapse control to hide its motion. A separate disclosure raises the same calendar into a three-dimensional skyline. The native GitHub grid below the pinned repositories remains GitHub-controlled; README images do not alter its data or award account achievements.

## Reproducibility and publication integrity

The profile repository has its own private npm manifest and lockfile. The snake package is pinned; the 3D generator is fetched by immutable commit and verified against fixed SHA-256 digests. No third-party runtime code is vendored into the repository. The 3D generator's MIT notice is included. The inspected snk package/repository metadata did not declare a license; the tool is used through its documented generator interface with attribution, without relabeling its code as MIT.

The existing scheduled workflow is extended to regenerate the actual contribution artifacts and metrics in one change. GitHub checkout and Node setup actions are pinned; the repository-scoped job token is used only for the necessary read/generation/publication steps. No long-lived personal token, fake activity, artificial stars, or spoofed commit identity is created.

The skyline keeps the upstream calendar geometry while omitting repeated radar, language and popularity panels. The GitHub README's reading path places the real contribution field directly after the hero and canonical actions.

The profile shipped in [commit 61f96c5](https://github.com/ReaperXD67/ReaperXD67/commit/61f96c59fd5f17915bbef92e8f198f86be1969ce). The manually dispatched [refresh run 40532370338](https://github.com/ReaperXD67/ReaperXD67/actions/runs/40532370338) succeeded through clean install, actual snake and 3D generation, integrity verification, public metrics and bot publication. Refresh commit `4a225fa` was pulled and the 367 unique consecutive days again summed to 536 real contributions. The live public profile shows the new header and contribution artifacts. Local GitHub-rendered checks at desktop, 768 px, 390 px and 320 px confirmed loaded images, correct mobile composition and no horizontal overflow; native motion disclosures were exercised with keyboard and pointer. Static SVGs contain no animation. Full reproduction and dated evidence are recorded in the profile repository's `PROFILE_EVIDENCE.md`.
