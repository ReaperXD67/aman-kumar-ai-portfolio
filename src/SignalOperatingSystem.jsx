import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  ArrowSquareOut,
  Briefcase,
  Command,
  Copy,
  EnvelopeSimple,
  FilePdf,
  GithubLogo,
  LinkedinLogo,
  MagnifyingGlass,
  ShareNetwork,
  X,
  XLogo,
} from "@phosphor-icons/react";

const EMAIL = "amankumr3254u@gmail.com";
const PORTFOLIO_URL = "https://aman-kumar-ai-portfolio.vercel.app";
const RECRUITER_URL = `${PORTFOLIO_URL}/?view=recruiter`;

const SOCIALS = [
  {
    label: "GitHub",
    shortLabel: "GH",
    detail: "Systems, source, and proof",
    href: "https://github.com/ReaperXD67",
    icon: GithubLogo,
  },
  {
    label: "LinkedIn",
    shortLabel: "IN",
    detail: "Experience and professional context",
    href: "https://www.linkedin.com/in/aman-kumar-494601329/",
    icon: LinkedinLogo,
  },
  {
    label: "X / Twitter",
    shortLabel: "X",
    detail: "Notes, experiments, and updates",
    href: "https://x.com/Aman1181",
    icon: XLogo,
  },
];

const FLAGSHIPS = [
  {
    name: "Autonomous Personal Agent",
    status: "62 TESTS / LOCAL ALPHA",
    summary: "A self-hosted control plane for durable agents, human approvals, containerized workers, audit trails, and constrained tool access.",
    proof: "APPROVE → EXECUTE → AUDIT",
    href: "https://github.com/ReaperXD67/autonomous-personal-agent",
  },
  {
    name: "AtlasLM",
    status: "11 TESTS / LIVE",
    summary: "An evidence-first RAG workbench with hybrid retrieval, reranking, abstention, citation audits, evaluation, and visible traces.",
    proof: "RETRIEVE → RERANK → CITE",
    href: "https://notebooklm-rag-five.vercel.app",
  },
  {
    name: "MinePulse / KarixMC",
    status: "PRODUCTION / VPS",
    summary: "A live Minecraft reward network with signed Paper-plugin traffic, PostgreSQL, Redis, Nginx replicas, and recurring encrypted backups.",
    proof: "PLAY → SIGN → VERIFY → REWARD",
    href: "https://karixmc.pl",
  },
];

const DEFAULT_RESUME = {
  url: "/profile/aman-kumar-resume.pdf",
  version: "2026.09",
  updated: "01 SEP 2026",
  source: "CANONICAL ATS PDF",
};

function useActiveSection() {
  const [activeSection, setActiveSection] = useState("TOP");

  useEffect(() => {
    const sections = ["top", "work", "method", "about", "experience", "resume", "contact"]
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    if (!sections.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) setActiveSection(visible.target.id.toUpperCase());
      },
      { rootMargin: "-28% 0px -58%", threshold: [0, 0.2, 0.55] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return activeSection;
}

export function SignalOperatingSystem({ panel, onPanelChange }) {
  const reducedMotion = useReducedMotion();
  const activeSection = useActiveSection();
  const dialogRef = useRef(null);
  const searchRef = useRef(null);
  const toastTimerRef = useRef(null);
  const [query, setQuery] = useState("");
  const [activeAction, setActiveAction] = useState(0);
  const [activeFlagship, setActiveFlagship] = useState(0);
  const [resume, setResume] = useState(DEFAULT_RESUME);
  const [toast, setToast] = useState("");

  useEffect(() => {
    let alive = true;
    fetch("/profile/resume.json", { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("Résumé manifest unavailable");
        return response.json();
      })
      .then((manifest) => alive && setResume({ ...DEFAULT_RESUME, ...manifest }))
      .catch(() => alive && setResume(DEFAULT_RESUME));
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("view") === "recruiter") onPanelChange("recruiter");
  }, [onPanelChange]);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (panel === "recruiter") url.searchParams.set("view", "recruiter");
    else url.searchParams.delete("view");
    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
  }, [panel]);

  useEffect(() => () => window.clearTimeout(toastTimerRef.current), []);

  useEffect(() => {
    const onKeyDown = (event) => {
      const target = event.target;
      const isTyping = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target?.isContentEditable;
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        onPanelChange("command");
      } else if (event.key === "/" && !isTyping && !panel) {
        event.preventDefault();
        onPanelChange("command");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onPanelChange, panel]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    let focusTimer;
    if (panel && !dialog.open) dialog.showModal();
    if (!panel && dialog.open) dialog.close();
    if (panel === "command") {
      setQuery("");
      setActiveAction(0);
      focusTimer = window.setTimeout(() => searchRef.current?.focus(), 40);
    }
    return () => window.clearTimeout(focusTimer);
  }, [panel]);

  const sendToast = (message) => {
    window.clearTimeout(toastTimerRef.current);
    setToast(message);
    toastTimerRef.current = window.setTimeout(() => setToast(""), 2200);
  };

  const copyText = async (value, message) => {
    try {
      await navigator.clipboard.writeText(value);
      sendToast(message);
    } catch {
      sendToast("COPY UNAVAILABLE — OPEN THE LINK DIRECTLY");
    }
  };

  const jumpTo = (id) => {
    onPanelChange(null);
    window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" }), 90);
  };

  const openExternal = (href) => {
    window.open(href, "_blank", "noopener,noreferrer");
    onPanelChange(null);
  };

  const shareLink = async (url, title, copiedMessage) => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        sendToast("PORTFOLIO TRANSMITTED");
        return;
      } catch (error) {
        if (error?.name === "AbortError") return;
      }
    }
    await copyText(url, copiedMessage);
  };

  const sharePortfolio = () => shareLink(PORTFOLIO_URL, "Aman Kumar — AI Engineer & Full-Stack Developer", "PORTFOLIO LINK COPIED");
  const shareRecruiterView = () => shareLink(RECRUITER_URL, "Aman Kumar — Recruiter Quick-Read", "RECRUITER VIEW LINK COPIED");

  const actions = [
    { label: "Open recruiter quick-read", detail: "Three flagship systems, availability, résumé, and direct contact", group: "RECRUITER", icon: Briefcase, run: () => onPanelChange("recruiter") },
    { label: "Inspect selected work", detail: "Project previews, system anatomy, failure modes, and proof", group: "NAVIGATE", icon: ArrowRight, run: () => jumpTo("work") },
    { label: "Open canonical résumé", detail: `${resume.version} · ${resume.updated} · ${resume.source}`, group: "CAREER", icon: FilePdf, run: () => openExternal(resume.url) },
    { label: "Open GitHub", detail: "Source code, system documentation, and public activity", group: "CONNECT", icon: GithubLogo, run: () => openExternal(SOCIALS[0].href) },
    { label: "Open LinkedIn", detail: "Experience, education, and professional profile", group: "CONNECT", icon: LinkedinLogo, run: () => openExternal(SOCIALS[1].href) },
    { label: "Open X / Twitter", detail: "Technical notes, experiments, and updates", group: "CONNECT", icon: XLogo, run: () => openExternal(SOCIALS[2].href) },
    { label: "Email Aman", detail: EMAIL, group: "CONTACT", icon: EnvelopeSimple, run: () => { window.location.href = `mailto:${EMAIL}`; onPanelChange(null); } },
    { label: "Copy email address", detail: "Place the direct contact address on your clipboard", group: "CONTACT", icon: Copy, run: () => copyText(EMAIL, "EMAIL ADDRESS COPIED") },
    { label: "Share this portfolio", detail: "Use the native share sheet or copy the production URL", group: "SHARE", icon: ShareNetwork, run: sharePortfolio },
  ];

  const filteredActions = actions.filter((action) => `${action.label} ${action.detail} ${action.group}`.toLowerCase().includes(query.trim().toLowerCase()));

  const runAction = (action) => action?.run?.();

  const handleSearchKeyDown = (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveAction((value) => (value + 1) % Math.max(filteredActions.length, 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveAction((value) => (value - 1 + Math.max(filteredActions.length, 1)) % Math.max(filteredActions.length, 1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      runAction(filteredActions[activeAction]);
    }
  };

  return (
    <>
      <nav className="signal-dock" aria-label="Professional links and portfolio controls">
        <span className="signal-dock-state"><i aria-hidden="true" />{activeSection}</span>
        {SOCIALS.map(({ label, href, icon: Icon }) => (
          <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={`Open ${label}`}>
            <Icon size={17} weight="regular" /><span>{label}</span>
          </a>
        ))}
        <a href={resume.url} target="_blank" rel="noreferrer"><FilePdf size={17} /><span>Résumé</span></a>
        <button type="button" className="signal-dock-recruiter" onClick={() => onPanelChange("recruiter")}><Briefcase size={17} /><span>Recruiter view</span></button>
        <button type="button" className="signal-dock-command" onClick={() => onPanelChange("command")}><Command size={17} /><span>Signal OS</span><kbd>/</kbd></button>
      </nav>

      <nav className="signal-mobile-dock" aria-label="Professional links">
        {SOCIALS.map(({ label, shortLabel, href, icon: Icon }) => (
          <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={`Open ${label}`}><Icon size={19} /><span>{shortLabel}</span></a>
        ))}
        <a href={resume.url} target="_blank" rel="noreferrer" aria-label="Open résumé"><FilePdf size={19} /><span>CV</span></a>
        <button type="button" onClick={() => onPanelChange("command")} aria-label="Open Signal OS"><Command size={19} /><span>OS</span></button>
      </nav>

      <dialog
        ref={dialogRef}
        className="signal-dialog"
        aria-label={panel === "recruiter" ? "Recruiter quick-read" : "Portfolio command center"}
        onCancel={(event) => { event.preventDefault(); onPanelChange(null); }}
        onClose={() => onPanelChange(null)}
        onMouseDown={(event) => { if (event.target === dialogRef.current) onPanelChange(null); }}
      >
        <div className="signal-dialog-shell">
          <header className="signal-dialog-header">
            <div><i aria-hidden="true" /><span>{panel === "recruiter" ? "RECRUITER SIGNAL / 90-SECOND READ" : "SIGNAL OPERATING SYSTEM / COMMAND"}</span></div>
            <strong>{activeSection} / LIVE</strong>
            <button type="button" onClick={() => onPanelChange(null)} aria-label="Close Signal OS"><X size={20} /></button>
          </header>

          {panel === "recruiter" ? (
            <motion.div
              className="recruiter-mode"
              initial={reducedMotion ? false : { opacity: 0, y: 18, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="recruiter-hero">
                <div>
                  <h2>Three systems.<br />One production thesis.</h2>
                  <p>AI ideas are easy. Aman builds the controlled, observable, deployable layer that survives contact with real users.</p>
                </div>
                <dl>
                  <div><dt>ROLE</dt><dd>AI ENGINEER + FULL-STACK</dd></div>
                  <div><dt>BASE</dt><dd>BENGALURU / INDIA</dd></div>
                  <div><dt>STATUS</dt><dd><i /> AVAILABLE / ANY MODE</dd></div>
                  <div><dt>RÉSUMÉ</dt><dd>{resume.version} / {resume.updated}</dd></div>
                </dl>
              </div>

              <div className={`recruiter-systems active-${activeFlagship}`}>
                {FLAGSHIPS.map((project, index) => (
                  <a
                    key={project.name}
                    href={project.href}
                    target="_blank"
                    rel="noreferrer"
                    onPointerEnter={() => setActiveFlagship(index)}
                    onFocus={() => setActiveFlagship(index)}
                  >
                    <span>{project.status}</span>
                    <h3>{project.name}</h3>
                    <p>{project.summary}</p>
                    <footer><small>{project.proof}</small><ArrowSquareOut size={18} /></footer>
                  </a>
                ))}
              </div>

              <div className="recruiter-actions">
                <a href={resume.url} target="_blank" rel="noreferrer"><FilePdf size={19} /> Open canonical résumé <ArrowSquareOut size={17} /></a>
                <a href={SOCIALS[1].href} target="_blank" rel="noreferrer"><LinkedinLogo size={19} /> LinkedIn <ArrowSquareOut size={17} /></a>
                <a href={`mailto:${EMAIL}`}><EnvelopeSimple size={19} /> Email Aman <ArrowRight size={17} /></a>
                <button type="button" onClick={shareRecruiterView}><ShareNetwork size={19} /> Share recruiter view</button>
              </div>
            </motion.div>
          ) : (
            <div className="command-center">
              <div className="command-main">
                <label className="command-search">
                  <MagnifyingGlass size={22} aria-hidden="true" />
                  <span className="sr-only">Search portfolio commands</span>
                  <input
                    ref={searchRef}
                    value={query}
                    onChange={(event) => { setQuery(event.target.value); setActiveAction(0); }}
                    onKeyDown={handleSearchKeyDown}
                    placeholder="Search work, résumé, profiles, or actions…"
                  />
                  <kbd>ESC</kbd>
                </label>

                <div className="command-results" role="menu" aria-label="Portfolio actions">
                  {filteredActions.length ? filteredActions.map((action, index) => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={action.label}
                        type="button"
                        role="menuitem"
                        className={activeAction === index ? "is-active" : ""}
                        onPointerEnter={() => setActiveAction(index)}
                        onFocus={() => setActiveAction(index)}
                        onClick={() => runAction(action)}
                      >
                        <Icon size={20} />
                        <span><strong>{action.label}</strong><small>{action.detail}</small></span>
                        <em>{action.group}</em>
                        <ArrowRight size={17} />
                      </button>
                    );
                  }) : <p className="command-empty">No matching signal. Try “résumé”, “GitHub”, “work”, or “email”.</p>}
                </div>
              </div>

              <aside className="command-context">
                <div className="command-context-status"><i /><span>AVAILABLE FOR AMBITIOUS BUILDS</span></div>
                <h2>The entire portfolio, one keystroke away.</h2>
                <p>Use this interface to jump directly to proof, open professional profiles, copy contact details, or hand a recruiter the compressed version.</p>
                <dl>
                  <div><dt>RÉSUMÉ SOURCE</dt><dd>{resume.source}</dd></div>
                  <div><dt>LAST VERIFIED</dt><dd>{resume.updated}</dd></div>
                  <div><dt>KEYBOARD</dt><dd>↑ ↓ NAVIGATE / ENTER OPEN</dd></div>
                </dl>
                <button type="button" onClick={() => onPanelChange("recruiter")}><Briefcase size={18} /> Switch to recruiter quick-read <ArrowRight size={17} /></button>
              </aside>
            </div>
          )}
        </div>
      </dialog>

      <AnimatePresence>
        {toast && (
          <motion.div
            className="signal-toast"
            role="status"
            initial={reducedMotion ? false : { opacity: 0, y: 16, clipPath: "inset(100% 0 0 0)" }}
            animate={{ opacity: 1, y: 0, clipPath: "inset(0% 0 0 0)" }}
            exit={{ opacity: 0, y: 10, clipPath: "inset(0 0 100% 0)" }}
          >
            <i aria-hidden="true" />{toast}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
