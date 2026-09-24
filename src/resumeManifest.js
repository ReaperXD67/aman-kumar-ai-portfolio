export const FALLBACK_RESUME = Object.freeze({
  url: "/profile/aman-kumar-resume.pdf",
  preview: "/profile/aman-kumar-resume-preview.png",
  version: "SAVED COPY",
  updated: "SEE DOCUMENT",
  source: "CANONICAL ATS PDF",
});

const LOCAL_ORIGIN = "https://aman-kumar-ai-portfolio.vercel.app";

export function safeDocumentUrl(value) {
  if (typeof value !== "string" || value !== value.trim() || /[\\\s]/.test(value)) return false;
  try {
    const url = new URL(value, LOCAL_ORIGIN);
    return !url.username && !url.password && (
      (value.startsWith("/") && !value.startsWith("//") && url.origin === LOCAL_ORIGIN) ||
      (value.startsWith("https://") && url.protocol === "https:")
    );
  } catch {
    return false;
  }
}

export function parseResumeManifest(manifest) {
  if (!manifest || typeof manifest !== "object" || !safeDocumentUrl(manifest.url)) throw new Error("Invalid résumé URL");
  if (!/^\d{4}\.\d{2}\.\d{1,2}$/.test(manifest.version) || !/^\d{2} [A-Z]{3} \d{4}$/.test(manifest.updated)) throw new Error("Invalid résumé version");
  if (manifest.preview !== undefined && !safeDocumentUrl(manifest.preview)) throw new Error("Invalid preview URL");
  if (manifest.sha256 !== undefined && !/^[a-f0-9]{64}$/.test(manifest.sha256)) throw new Error("Invalid résumé digest");
  return {
    ...FALLBACK_RESUME,
    url: manifest.url,
    preview: manifest.preview || FALLBACK_RESUME.preview,
    version: manifest.version,
    updated: manifest.updated,
    source: "CANONICAL ATS PDF",
    sha256: manifest.sha256,
  };
}

// Keep the public route stable, but request fresh local bytes after each release.
// External résumé services may use signed URLs: never rewrite those queries.
export function versionedDocumentUrl(url, digest) {
  if (!url.startsWith("/") || !digest) return url;
  const parsed = new URL(url, LOCAL_ORIGIN);
  parsed.searchParams.set("v", digest.slice(0, 12));
  return `${parsed.pathname}${parsed.search}${parsed.hash}`;
}

export function documentViewerUrl(url) {
  return url.includes("#") ? url : `${url}#view=FitH`;
}

export function normalizeCommandQuery(value) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

export function commandMatches(action, query) {
  const text = normalizeCommandQuery(`${action.label} ${action.detail} ${action.group} ${action.aliases || ""}`);
  return normalizeCommandQuery(query).split(/\s+/).every((word) => text.includes(word));
}

export function commandPriority(action, query) {
  const words = normalizeCommandQuery(query).split(/\s+/).filter(Boolean);
  if (!words.length) return 0;
  const direct = normalizeCommandQuery(`${action.label} ${action.aliases || ""}`);
  return words.every((word) => direct.includes(word)) ? 1 : 0;
}
