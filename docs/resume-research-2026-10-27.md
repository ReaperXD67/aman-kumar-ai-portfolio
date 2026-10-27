# Canonical résumé refresh — 27 October 2026

The public résumé remains one photo-free A4 page at `/profile/aman-kumar-resume.pdf`. This edition sharpens the opening positioning and the flagship project bullets without changing employers, titles, dates, education, or certification. It emphasizes mechanisms an engineer can question in an interview: recovery after interruption, stale-worker rejection, approval payloads, retrieval sufficiency, citation audits, lost acknowledgements, and authenticated game/API boundaries.

## Research and decisions

| Primary source | Applied decision |
| --- | --- |
| [Greenhouse: unsuccessful résumé parse](https://support.greenhouse.io/hc/en-us/articles/200989175-Unsuccessful-resume-parse), updated 2 March 2026 | Keep selectable text, one column, standard section headings, normal contact text in the page body, and no photograph, tables, or decorative text. |
| [Stanford Career Center: résumé guide and examples](https://careered.stanford.edu/sites/g/files/sbiybj22801/files/media/file/resume_and_cover_letter_examples_1.pdf) | Use action verbs and verifiable accomplishments; make role, organization and dates easy to find. The older examples inform writing and hierarchy, not current ATS guarantees. |
| [Harvard: create a strong résumé](https://careerservices.fas.harvard.edu/resources/create-a-strong-resume/) | Search-indexed guidance supports specific, factual, concise writing. Direct page access returned HTTP 429 during this review; no unavailable details were treated as verified. |
| [Employer AI Engineer posting on Lever](https://jobs.lever.co/Simfluent/7a1a9a01-b457-4643-91de-b72d277fbfcd) | Prioritize already-supported LLM, Python/API, RAG, evaluation, database and container evidence. This senior vacancy is a vocabulary sample, not a claim that Aman meets its experience threshold. No new technologies or seniority were inferred from it. |

The supplied `Aman_Kumar_Resume_Updated.pdf` and existing canonical source were read for career and education facts. Project descriptions were cross-checked against the current public repositories:

- [Autonomous Personal Agent](https://github.com/ReaperXD67/autonomous-personal-agent): transactional outbox, worker ownership, retries, human review, receipts, hosted routing/local fallback and isolated workers. It remains a local alpha. The résumé does not imply universal ATS execution or public multi-user production readiness.
- [AtlasLM](https://github.com/ReaperXD67/notebooklm-rag): deterministic ingestion, hybrid retrieval, pre-generation evidence checks, post-generation citation audit, evaluations, traces, local Qdrant and serverless Upstash deployment.
- [MinePulse / KarixMC](https://github.com/ReaperXD67/MinePulse): signed Paper integration, transactional ledgers, expiring claims and plugin receipts. The lost-acknowledgement bullet is deliberately conditional; it is not an exactly-once execution guarantee.

The visible degree name now spells out “Bachelor of Science in Computer Science.” The summary explicitly connects former micro1 experience to the AI engineer role, and skills retain both LLM and retrieval-augmented generation vocabulary. No impact percentages, customer counts, test-count claims, or unsupported qualifications were added. Matching a specific vacancy still requires truthful tailoring to its actual requirements; a universal ATS acceptance score cannot be established by local PDF checks.

## Verified output

- Manifest version: `2026.10.27`, displayed as `27 OCT 2026`.
- One A4 page; 494 words extracted in the intended reading order.
- Two embedded Arial fonts; 10.5 pt body, 9 pt minimum supporting text; high-contrast text.
- Ten normal URI hyperlinks; no photos, invisible text, attachments, forms, document actions or alternate content layers.
- 63,244 bytes; SHA-256 `e690160bf8cdd22b1d13b7a7086b27d4f7baba50aaee1b0e5f38e8cf741447b5`.
- Poppler rendered the final PDF at 200 dpi for the published preview. Visual review confirmed no clipping, overlap or unreadable symbols. PyMuPDF and pypdf text inspection confirmed readable content and order.
- `python scripts/verify-resume.py`: PASS.
- `node --test tests/profile-assets.test.mjs tests/resume-manifest.test.mjs`: all 14 tests passed at the time of this résumé update.

The previous PDF and manifest are privately backed up under ignored `artifacts/resume-backups/2026-10-27/`; they are not an alternate public résumé. The existing stable PDF/preview routes and runtime manifest contract remain intact. `scripts/build-resume.py` is the editable source. Install its pinned QA dependencies with `python -m pip install -r scripts/requirements-resume-qa.txt`; render with `pdftoppm -png -r 200 -singlefile public/profile/aman-kumar-resume.pdf public/profile/aman-kumar-resume-preview` after rebuilding, then update the manifest digest and run the verifier.
