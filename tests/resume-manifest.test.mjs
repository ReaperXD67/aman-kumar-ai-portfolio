import assert from "node:assert/strict";
import test from "node:test";
import { FALLBACK_RESUME, commandMatches, commandPriority, documentViewerUrl, normalizeCommandQuery, parseResumeManifest, safeDocumentUrl, versionedDocumentUrl } from "../src/resumeManifest.js";

const manifest = { ...FALLBACK_RESUME, version: "2026.09.24", updated: "24 SEP 2026", sha256: "a".repeat(64) };

test("canonical and external HTTPS document links are accepted", () => {
  for (const url of ["/profile/aman-kumar-resume.pdf", "https://example.com/resume?key=abc"]) assert.equal(safeDocumentUrl(url), true);
});

test("manifest rejects executable, ambiguous, insecure and credential-bearing URLs", () => {
  for (const url of ["javascript:alert(1)", "data:text/html,test", "//evil.test", "/\\evil.test/x", "http://example.com", "https://user:pass@example.com", " https://example.com", "https://example.com/\nx", "file:///resume.pdf", "resume.pdf"]) {
    assert.equal(safeDocumentUrl(url), false, url);
    assert.throws(() => parseResumeManifest({ ...manifest, url }));
  }
});

test("manifest requires version metadata and validates optional preview and digest", () => {
  assert.deepEqual(parseResumeManifest(manifest), manifest);
  for (const change of [{ version: "latest" }, { updated: "" }, { sha256: "bad" }, { preview: "javascript:void(0)" }]) assert.throws(() => parseResumeManifest({ ...manifest, ...change }));
  assert.throws(() => parseResumeManifest(null));
  assert.equal(parseResumeManifest({ ...manifest, source: "UNTRUSTED CLAIM", unexpected: true }).source, "CANONICAL ATS PDF");
  assert.equal(parseResumeManifest({ ...manifest, unexpected: true }).unexpected, undefined);
});

test("new PDF bytes get a fresh query without breaking anchors or stable public routes", () => {
  assert.equal(versionedDocumentUrl(manifest.url, manifest.sha256), "/profile/aman-kumar-resume.pdf?v=aaaaaaaaaaaa");
  assert.equal(versionedDocumentUrl("/resume.pdf?lang=en&v=old#page=1", "b".repeat(64)), "/resume.pdf?lang=en&v=bbbbbbbbbbbb#page=1");
  assert.equal(versionedDocumentUrl(manifest.url), manifest.url);
});

test("external signed document URLs are not rewritten", () => {
  const url = "https://example.com/resume.pdf?signature=abc#page=1";
  assert.equal(versionedDocumentUrl(url, manifest.sha256), url);
});

test("embedded viewer preserves existing PDF options and external fragments", () => {
  assert.equal(documentViewerUrl("/resume.pdf?v=abc"), "/resume.pdf?v=abc#view=FitH");
  assert.equal(documentViewerUrl("/resume.pdf?v=abc#page=1"), "/resume.pdf?v=abc#page=1");
  assert.equal(documentViewerUrl("https://example.com/#resume"), "https://example.com/#resume");
});

test("failed manifest fallback never invents a verification date", () => {
  assert.equal(FALLBACK_RESUME.updated, "SEE DOCUMENT");
  assert.equal(FALLBACK_RESUME.version, "SAVED COPY");
});

test("command search accepts unaccented resume, CV aliases, and multiword search", () => {
  const action = { label: "Open ATS résumé", detail: "One-page photo-free PDF", group: "CAREER", aliases: "cv curriculum vitae download canonical" };
  for (const query of ["resume", "  RÉSUMÉ  ", "cv", "download pdf", "curriculum vitae", ""]) assert.equal(commandMatches(action, query), true, query);
  assert.equal(commandMatches(action, "github"), false);
  assert.equal(normalizeCommandQuery("RÉSUMÉ"), "resume");
});

test("direct command matches rank above incidental description matches", () => {
  const resume = { label: "Open ATS résumé", aliases: "cv" };
  const recruiter = { label: "Recruiter view", detail: "Experience and résumé" };
  assert.ok(commandPriority(resume, "resume") > commandPriority(recruiter, "resume"));
  assert.equal(commandPriority(resume, ""), 0);
  assert.equal(commandPriority(resume, "CV"), 1);
});
