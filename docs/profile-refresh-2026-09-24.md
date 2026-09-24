# Profile refresh — 24 September 2026

## Visual decisions

The supplied red-shirt photograph replaces the prior portrait in the first-screen signature, finite raster reveal, favicon, structured data, résumé header, and GitHub README identity. The real person remains recognizable; the procedural Systems Kernel is still an optional second view, not a substitute face.

The shared-link card deliberately removes the machinery, grid, telemetry, and tiny labels. It contains a large name, professional role, one short value line, portrait, location, and canonical domain. The versioned image URL is `/assets/portfolio-social-preview-v2.png` (1200 × 630). Existing messages may retain their platform's cached preview; a new image URL cannot erase all previously cached messages.

## Portrait provenance

Source: Aman's supplied `818074743_3076210742569626_3720072734967766631_n (1).jpg`.

Identity-preserving retouch brief: retain the exact subject, recognizable facial features, hairstyle, expression, red shirt, and emblem. Replace only the distracting corridor background with restrained charcoal; gently balance lighting, white balance, and detail. Use a square head-and-shoulders composition. No suit, facial reshaping, beauty filter, invented face, text, or decorative overlays.

The original supplied file is untouched. The edited master is `public/profile/aman-portrait-20260924.png`. `scripts/export-profile-photo.mjs` performs only mechanical delivery sizing and encoding:

- Main photograph: 1000 × 1000 WebP, 74,260 bytes.
- First-screen thumbnail: 160 × 160 WebP, 3,178 bytes.
- Upload/résumé photograph: 800 × 800 JPEG, 121,976 bytes.

The social graphic is authored with `scripts/render-portfolio-social-preview-v2.ps1`, using the bundled OFL-licensed Space Grotesk font. Run it on Windows with System.Drawing. These asset builders are maintenance tools, not part of the production build.

## Canonical résumé

The new explicit portrait request supersedes the earlier photo-free design preference. The photograph is confined to the header. Experience and qualifications remain selectable, single-column text with embedded fonts, standard section labels, and source/live links.

Flagship projects remain Autonomous Personal Agent, AtlasLM, and MinePulse / KarixMC. Their bullets emphasize implementation choices and recovery/security boundaries rather than unsupported impact metrics. The prior photo-free document remains a private dated backup, not a competing public résumé.

- Canonical route: `/profile/aman-kumar-resume.pdf`.
- Manifest: `/profile/resume.json`, version `2026.09.24`.
- File size: 187,873 bytes.
- SHA-256: `3d4dfff589d36002a735d615794aa6dfd05c60046d0876f52b78444e410f1395`.
- Structural check: one A4 page, 500 extracted words, ten link annotations, embedded fonts, no off-page text, one header image.

`scripts/build-resume.py` is the editable source (Python, PyMuPDF, and Windows Arial). Use `--output` to build a review candidate. `scripts/verify-resume.py` checks text order, fonts, links, geometry, and manifest integrity using PyMuPDF and pypdf. Replacing the PDF also requires a regenerated preview and matching manifest hash. No résumé can guarantee acceptance by every ATS or employer.

## Verification

- Desktop and 390 px phone browser inspection: portrait signature and identity panel render correctly; the scan settles into a clear photograph.
- No captured console errors or Vite error overlay during the checked flows.
- Mobile document width does not exceed the viewport.
- `npm run test:profile`: five checks covering PDF/manifest integrity, preview PNG, social-card dimensions, OG/Twitter metadata, and portrait delivery assets.
- `npm run test:sites`: preserved worker/handoff contract.
- `npm run build`: production and Sites-compatible artifacts.
- Profile asset checks run in GitHub Actions alongside the existing build and Sites checks.

## GitHub companion

The separate `ReaperXD67/ReaperXD67` profile repository receives the matching portrait, restrained desktop/mobile headers, a finite 1.7-second pixel reveal, reduced-motion stills, clearer project narratives, and prominent canonical links. Its badges link to actual Agent CI, AtlasLM quality gates, the Agent repository's MIT license, and the supplied micro1 certificate. They are evidence links, not fabricated GitHub achievements or independent endorsements.

The GitHub account avatar is a separate browser-upload setting; publishing the README photograph does not change that account setting.
