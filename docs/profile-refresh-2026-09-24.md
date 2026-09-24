# Profile refresh — 24 September 2026

## Visual decisions

The supplied red-shirt photograph replaces the prior portrait in the first-screen signature, finite raster reveal, favicon, structured data, and GitHub README identity. The latest request restores a photo-free résumé. The real person remains recognizable on identity surfaces; the procedural Systems Kernel is still an optional second view, not a substitute face.

The shared-link card deliberately removes the machinery, grid, telemetry, and tiny labels. It contains a large name, professional role, one short value line, portrait, location, and canonical domain. The versioned image URL is `/assets/portfolio-social-preview-v2.png` (1200 × 630). Existing messages may retain their platform's cached preview; a new image URL cannot erase all previously cached messages.

## Portrait provenance

Source: Aman's supplied `818074743_3076210742569626_3720072734967766631_n (1).jpg`.

Identity-preserving retouch brief: retain the exact subject, recognizable facial features, hairstyle, expression, red shirt, and emblem. Replace only the distracting corridor background with restrained charcoal; gently balance lighting, white balance, and detail. Use a square head-and-shoulders composition. No suit, facial reshaping, beauty filter, invented face, text, or decorative overlays.

The original supplied file is untouched. The edited master is `public/profile/aman-portrait-20260924.png`. `scripts/export-profile-photo.mjs` performs only mechanical delivery sizing and encoding:

- Main photograph: 1000 × 1000 WebP, 74,260 bytes.
- First-screen thumbnail: 160 × 160 WebP, 3,178 bytes.
- Account-upload photograph: 800 × 800 JPEG, 121,976 bytes (not included in the résumé).

The social graphic is authored with `scripts/render-portfolio-social-preview-v2.ps1`, using the bundled OFL-licensed Space Grotesk font. Run it on Windows with System.Drawing. These asset builders are maintenance tools, not part of the production build.

## Canonical résumé

Aman's latest request supersedes the earlier portrait-header edition: the canonical résumé is again **photo-free**, with selectable single-column text, embedded fonts, standard section labels, and source/live links. Main body text is 10.5 pt Arial; supporting text is at least 9 pt. Text is high-contrast black with restrained dark-blue links. The previous portrait edition and its builder are preserved privately, not promoted as a second résumé.

Flagship projects remain Autonomous Personal Agent, AtlasLM, and MinePulse / KarixMC. Their bullets emphasize implementation choices and recovery/security boundaries rather than unsupported impact metrics. Visible keywords include large language models (LLMs), retrieval-augmented generation (RAG), human-in-the-loop approvals, Python, TypeScript, FastAPI, Next.js, PostgreSQL, Redis, Docker and CI/CD. Ordinary PDF title, author, subject and short keyword metadata describe this same visible content. No evaluator instructions, hidden keywords or automatic-shortlisting promises are embedded.

- Canonical route: `/profile/aman-kumar-resume.pdf`.
- Manifest: `/profile/resume.json`, version `2026.09.24`.
- File size: 62,873 bytes.
- SHA-256: `58c40bc34b8ea38afc61dc3bda84438a099b02677fa230a9badc44f79edeb977`.
- Structural check: one A4 page, 490 extracted words, ten link annotations, embedded fonts, no off-page text, zero images.

`scripts/build-resume.py` is the editable source (Python, PyMuPDF, and Windows Arial). Use `--output` to build a review candidate. `scripts/verify-resume.py` checks text order, fonts, links, geometry, and manifest integrity using PyMuPDF and pypdf. Replacing the PDF also requires a regenerated preview and matching manifest hash. No résumé can guarantee acceptance by every ATS or employer.

Formatting research: [Greenhouse's resume parsing guidance](https://support.greenhouse.io/hc/en-us/articles/200989175-Unsuccessful-resume-parse) identifies photos, columns, image-based documents and complex layouts as parsing risks. Current primary employer postings at [Qualysoft](https://jobs.lever.co/qualysoft/6c7d7c1f-d724-4561-8416-1a7fa5882aa6), [InstaLILY](https://job-boards.greenhouse.io/instalilyai/jobs/4261595009) and [Wonderschool](https://job-boards.greenhouse.io/wonderschool/jobs/6359139003) informed emphasis on skills already supported by Aman's work—not new claimed qualifications. These are dated research sources, not applications or endorsements.

One App-owned runtime resolver now serves the résumé viewer, professional-link dock, command center and footer. It validates local/HTTPS destinations, rejects executable URLs, uses a PDF-digest query for fresh local assets, preserves external signed URLs, and reports version-check failure honestly with a retry action. Vercel revalidates `/profile/` resources. The canonical public PDF path stays stable.

## Verification

- Desktop and 390 px phone browser inspection: portrait signature and identity panel render correctly; the scan settles into a clear photograph.
- No captured console errors or Vite error overlay during the checked flows.
- Mobile document width does not exceed the viewport.
- `npm run test:profile`: asset integrity plus manifest URL validation, query versioning, fallback honesty, viewer fragments, and command-search aliases/ranking.
- `npm run test:sites`: preserved worker/handoff contract.
- `npm run build`: production and Sites-compatible artifacts.
- Profile assets and Python PDF structural checks run in GitHub Actions alongside the existing build and Sites checks. The Python verifier rejects images, invisible/transparent/tiny text, optional layers, attachments, forms, document actions and unexpected metadata.

### ATS follow-up acceptance pass

- Restored the initial `#resume` fragment after React mounts; the lazy scroll scene reserves its real height, preventing a later layout jump. On the checked desktop load, the section begins at the 76 px header offset.
- One shared manifest supplied the same digest-versioned PDF to the footer, dock, quick-read and viewer. The embedded viewer retains an always-visible direct PDF link, including at 320 px.
- `resume` and `CV` both locate the document. Direct résumé results rank above incidental mentions in recruiter descriptions. Arrow keys update the active option and Escape closes the dialog.
- Desktop, 390 px and 320 px viewport checks covered the changed surfaces. A pre-existing 320 px body minimum caused overflow when a desktop scrollbar consumed viewport width; removing that floor fixed it without hiding content. Final narrow-screen document width equals the available viewport.
- Recruiter résumé/contact actions now appear before the three system detail cards. Mobile links read GitHub, LinkedIn, X, Résumé and Menu instead of ambiguous initials.
- No browser console errors were captured in the checked flows. The existing Three.js clock deprecation warning and large-chunk build warning remain; this pass is not a whole-site performance certification.
- GitHub README preview checked at desktop and phone sizes, with no missing images or horizontal overflow. The separate profile maintenance audit resolved 33 of 35 HTTPS destinations; LinkedIn and X remain signed-in/manual checks.

## GitHub companion

The separate `ReaperXD67/ReaperXD67` profile repository receives the matching portrait, restrained desktop/mobile headers, a finite 1.7-second pixel reveal, reduced-motion stills, clearer project narratives, and prominent canonical links. Its badges link to actual Agent CI, AtlasLM quality gates, the Agent repository's MIT license, and the supplied micro1 certificate. They are evidence links, not fabricated GitHub achievements or independent endorsements.

The GitHub account avatar is a separate browser-upload setting; publishing the README photograph does not change that account setting.
