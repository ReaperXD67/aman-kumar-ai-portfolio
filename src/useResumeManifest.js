import { useEffect, useState } from "react";
import { FALLBACK_RESUME, parseResumeManifest, versionedDocumentUrl } from "./resumeManifest.js";

// Owned once by App so the dock, viewer, and footer never disagree.
export function useResumeManifest() {
  const [manifest, setManifest] = useState(FALLBACK_RESUME);
  const [status, setStatus] = useState("loading");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setStatus("loading");
    const timeout = window.setTimeout(() => controller.abort(), 5000);
    fetch("/profile/resume.json", { cache: "no-store", signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Résumé manifest unavailable");
        return response.json();
      })
      .then(parseResumeManifest)
      .then((next) => {
        if (!active) return;
        setManifest(next);
        setStatus("ready");
      })
      .catch(() => { if (active) setStatus("offline"); })
      .finally(() => window.clearTimeout(timeout));
    return () => {
      active = false;
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [attempt]);

  return {
    ...manifest,
    url: versionedDocumentUrl(manifest.url, manifest.sha256),
    preview: versionedDocumentUrl(manifest.preview, manifest.sha256),
    status,
    statusLabel: status === "ready" ? "CURRENT MANIFEST" : status === "loading" ? "CHECKING VERSION" : "VERSION CHECK UNAVAILABLE",
    retry: () => setAttempt((value) => value + 1),
  };
}
