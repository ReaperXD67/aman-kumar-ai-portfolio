import { lazy, Suspense, useEffect, useState } from "react";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
} from "motion/react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowSquareOut,
  Brain,
  Check,
  Database,
  GithubLogo,
  List,
  ShieldCheck,
  Stack,
  X,
} from "@phosphor-icons/react";
import { Contact, IdentityVault } from "./IdentityVault.jsx";
import { SignalOperatingSystem } from "./SignalOperatingSystem.jsx";
const SignalCore = lazy(() => import("./SignalCore.jsx").then((module) => ({ default: module.SignalCore })));
const CognitiveDescent = lazy(() => import("./CognitiveDescent.jsx").then((module) => ({ default: module.CognitiveDescent })));
const MethodField = lazy(() => import("./MethodField.jsx").then((module) => ({ default: module.MethodField })));

const PROJECTS = [
  {
    id: "karixmc",
    index: "01",
    name: "KarixMC",
    eyebrow: "MINECRAFT / DISTRIBUTED SYSTEMS",
    headline: "Real play becomes portable value.",
    summary:
      "A production Minecraft reward network where signed Paper-plugin activity becomes wallet value across funded servers, with a two-sided marketplace for players and server owners.",
    image: "/assets/karixmc-live.png",
    imageAlt: "Live KarixMC production homepage showing the verified Minecraft reward network",
    tags: ["Next.js", "PostgreSQL", "Redis", "Paper / Java"],
    groups: ["Product", "Systems"],
    status: "LIVE / VPS",
    proof: ["Two app replicas behind Nginx", "HMAC-signed plugin traffic", "Encrypted recurring backups"],
    flow: ["PLAY", "SIGN", "VERIFY", "REWARD"],
    failure: "Browser-trusted playtime, forged activity, and rewards trapped inside a single server.",
    repo: "https://github.com/ReaperXD67/MinePulse",
    live: "https://karixmc.pl",
    feed: "PRODUCTION CAPTURE / KARIXMC.PL",
    accent: "#d8ff4f",
  },
  {
    id: "revive",
    index: "02",
    name: "Revive",
    eyebrow: "FINTECH / EXPLAINABLE AI",
    headline: "Revenue recovery that can explain every move.",
    summary:
      "A live Razorpay recovery engine that classifies payment failures, chooses rail-aware actions, enforces deterministic trust policies, and proves uplift against a holdout.",
    image: "/assets/revive-cinematic-core.png",
    imageAlt: "Revive cinematic 3D revenue recovery product interface",
    tags: ["Next.js", "Three.js", "Vercel", "Policy engine"],
    groups: ["AI", "Product", "Systems"],
    status: "LIVE",
    proof: ["16 passing tests", "95.75% core coverage", "Immutable audit proof"],
    flow: ["FAILURE", "CLASSIFY", "ROUTE", "PROVE"],
    failure: "Failed payments without opaque recovery decisions.",
    repo: "https://github.com/ReaperXD67/revive-ai",
    live: "https://revive-revenue.vercel.app",
    feed: "LIVE PRODUCT / REVIVE",
    accent: "#ff5f38",
  },
  {
    id: "agent",
    index: "03",
    name: "Autonomous Personal Agent",
    eyebrow: "AGENTS / SECURITY",
    headline: "Useful autonomy, bounded by explicit trust.",
    summary:
      "A self-hosted control plane for durable tasks, approval gates, containerized workers, audit trails, local inference, and a curated tool policy layer.",
    image: "/assets/autonomous-agent.svg",
    imageAlt: "Autonomous Personal Agent architecture overview",
    tags: ["FastAPI", "PostgreSQL", "Redis", "Docker"],
    groups: ["AI", "Systems"],
    status: "LOCAL ALPHA",
    proof: ["Human approval gates", "Durable task state", "Local model fallback"],
    flow: ["REQUEST", "APPROVE", "EXECUTE", "AUDIT"],
    failure: "Autonomous tasks crossing an explicit trust boundary.",
    repo: "https://github.com/ReaperXD67/autonomous-personal-agent",
    feed: "SYSTEM BLUEPRINT / LOCAL ALPHA",
    accent: "#7ea8ff",
  },
  {
    id: "atlaslm",
    index: "04",
    name: "AtlasLM",
    eyebrow: "RAG / DOCUMENT INTELLIGENCE",
    headline: "Answers with the evidence left on.",
    summary:
      "An inspectable RAG workbench with hybrid retrieval, RRF fusion, reranking, abstention, citation audits, continuous evaluations, and visible execution traces.",
    image: "/assets/atlaslm-landing.png",
    imageAlt: "AtlasLM evidence-first document intelligence landing page",
    tags: ["Next.js", "Qdrant", "BM25", "Evaluation"],
    groups: ["AI", "Product", "Systems"],
    status: "LIVE",
    proof: ["Hybrid dense + BM25", "Citation audit", "Inspectable traces"],
    flow: ["QUERY", "RETRIEVE", "RERANK", "CITE"],
    failure: "Answers that cannot show enough evidence to be trusted.",
    repo: "https://github.com/ReaperXD67/notebooklm-rag",
    live: "https://notebooklm-rag-five.vercel.app",
    feed: "LIVE PRODUCT / ATLASLM",
    accent: "#d8ff4f",
  },
  {
    id: "atlasforge",
    index: "05",
    name: "AtlasForge AI",
    eyebrow: "GEN AI / MEDIA PIPELINE",
    headline: "A production line for original video, not a demo script.",
    summary:
      "A local-first pipeline that researches, scripts, narrates, storyboards, edits, captions, packages, and optionally publishes original long-form video with explicit cost controls.",
    image: "/assets/atlasforge-ai.svg",
    imageAlt: "AtlasForge AI automated video production overview",
    tags: ["Python", "FFmpeg", "Gemini", "YouTube API"],
    groups: ["AI", "Systems"],
    status: "OPEN SOURCE",
    proof: ["Provider fallbacks", "Editorial gates", "Cost-bounded generation"],
    flow: ["RESEARCH", "SCRIPT", "RENDER", "PUBLISH"],
    failure: "Provider failures and runaway generation cost.",
    repo: "https://github.com/ReaperXD67/atlasforge-ai",
    feed: "PIPELINE BLUEPRINT / OPEN SOURCE",
    accent: "#ff5f38",
  },
  {
    id: "gpt",
    index: "06",
    name: "GPT Prototype",
    eyebrow: "RESEARCH / DEEP LEARNING",
    headline: "A 125M parameter transformer built from first principles.",
    summary:
      "A decoder-only language model with RoPE, RMSNorm, QK normalization, a SwiGLU-style MLP, memory-mapped training, and Muon + AdamW optimization.",
    image: "/assets/gpt-prototype.svg",
    imageAlt: "GPT Prototype model and training overview",
    tags: ["PyTorch", "RoPE", "Muon", "Transformers"],
    groups: ["AI"],
    status: "RESEARCH",
    proof: ["12 layers / 12 heads", "1,024 token context", "4,096-token BPE"],
    flow: ["TOKENIZE", "ATTEND", "OPTIMIZE", "EVALUATE"],
    failure: "Model architecture hidden behind a framework abstraction.",
    repo: "https://github.com/ReaperXD67/GPT-Prototype",
    feed: "MODEL BLUEPRINT / FROM SCRATCH",
    accent: "#7ea8ff",
  },
];

const CAPABILITIES = [
  {
    icon: Brain,
    label: "INTELLIGENCE",
    title: "Evidence-first AI",
    body: "Hybrid retrieval, evaluation loops, model routing, citations, and abstention before confident-looking nonsense.",
    law: "A claim does not leave the system without its evidence.",
    trace: ["RETRIEVE", "CITE", "ABSTAIN"],
  },
  {
    icon: ShieldCheck,
    label: "CONTROL",
    title: "Safe agent systems",
    body: "Approval gates, least privilege, durable state, idempotency, audit proof, and human override by construction.",
    law: "Autonomy ends exactly where the permission boundary begins.",
    trace: ["GATE", "LOG", "OVERRIDE"],
  },
  {
    icon: Database,
    label: "INFRASTRUCTURE",
    title: "Production foundations",
    body: "FastAPI, PostgreSQL, Redis, Docker, queues, observability, strict schemas, and failure-aware workflows.",
    law: "Failure is handled as a state—not discovered as a surprise.",
    trace: ["QUEUE", "RETRY", "OBSERVE"],
  },
  {
    icon: Stack,
    label: "INTERFACE",
    title: "Systems you can feel",
    body: "Interactive products that expose what the system is doing instead of hiding complexity behind decorative chrome.",
    law: "The interface reveals what the system knows, does, and cannot do.",
    trace: ["STATUS", "CONTEXT", "RECOVERY"],
  },
];

function useIstClock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const update = () =>
      setTime(
        new Intl.DateTimeFormat("en-GB", {
          timeZone: "Asia/Kolkata",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }).format(new Date()),
      );
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, []);
  return time;
}

function AppHeader({ menuOpen, setMenuOpen, onOpenSignal }) {
  return (
    <header className="site-header">
      <a className="brand" href="#top" aria-label="Aman Kumar — home">
        <span className="brand-mark" aria-hidden="true">AK</span>
        <span className="brand-copy">
          <strong>AMAN KUMAR</strong>
          <small>AI SYSTEMS / INDIA</small>
        </span>
      </a>
      <nav className={menuOpen ? "site-nav is-open" : "site-nav"} aria-label="Primary navigation">
        <a href="#work" onClick={() => setMenuOpen(false)}>Selected work</a>
        <a href="#method" onClick={() => setMenuOpen(false)}>Method</a>
        <a href="#experience" onClick={() => setMenuOpen(false)}>Experience</a>
        <a href="#resume" onClick={() => setMenuOpen(false)}>Résumé</a>
        <a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a>
        <div className="mobile-nav-professional" aria-label="Professional profiles">
          <a href="https://github.com/ReaperXD67" target="_blank" rel="noreferrer"><GithubLogo size={18} /> GitHub</a>
          <a href="https://www.linkedin.com/in/aman-kumar-494601329/" target="_blank" rel="noreferrer">LinkedIn <ArrowSquareOut size={16} /></a>
          <a href="https://x.com/Aman1181" target="_blank" rel="noreferrer">X / Twitter <ArrowSquareOut size={16} /></a>
        </div>
        <button className="mobile-nav-signal" type="button" onClick={() => { setMenuOpen(false); onOpenSignal(); }}>Open Signal OS <span>/</span></button>
      </nav>
      <div className="header-actions">
        <a className="header-cta" href="mailto:amankumr3254u@gmail.com">
          <span className="status-dot" aria-hidden="true" /> Available for ambitious builds
        </a>
        <button className="header-signal" type="button" onClick={onOpenSignal}>Signal OS <kbd>/</kbd></button>
      </div>
      <button
        className="menu-button"
        type="button"
        aria-label={menuOpen ? "Close navigation" : "Open navigation"}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((value) => !value)}
      >
        {menuOpen ? <X size={21} /> : <List size={21} />}
      </button>
    </header>
  );
}

function Hero() {
  const reducedMotion = useReducedMotion();
  const time = useIstClock();
  const [sceneMode, setSceneMode] = useState(0);
  const modes = ["OBSERVE", "REASON", "EXECUTE"];
  const modeCopy = [
    "Map weak signals",
    "Test the evidence",
    "Move with control",
  ];

  return (
    <section className="hero" id="top">
      <div className="hero-rail" aria-hidden="true">
        <span>PORTFOLIO / 2026</span>
        <span>28.6139° N</span>
      </div>
      <motion.div
        className="hero-copy"
        initial={reducedMotion ? false : { opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <h1>
          <span>I engineer systems</span>
          <span className="hero-image-line">
            that
            <span className="hero-inline-image" aria-hidden="true">
              <img src="/assets/revive-cinematic-core.png" alt="" />
            </span>
            think
          </span>
          <em>before they act.</em>
        </h1>
        <div className="hero-roleline" role="group" aria-label="Professional focus">
          <span>AI ENGINEER</span>
          <span>FULL-STACK DEVELOPER</span>
          <span>BENGALURU / AVAILABLE</span>
        </div>
        <p className="hero-lede">
          I turn ambitious AI ideas into production-ready products—across model behavior,
          APIs, databases, integrations, infrastructure, and the interface people trust.
        </p>
        <div className="hero-actions">
          <a className="button button-solid" href="#work">Inspect selected work <ArrowDown size={17} weight="bold" /></a>
          <a className="button button-outline" href="#resume">
            Open living résumé <ArrowSquareOut size={18} />
          </a>
        </div>
      </motion.div>
      <motion.div
        className="scene-panel"
        initial={reducedMotion ? false : { opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      >
        <Suspense fallback={<div className="scene-fallback"><span>INITIALIZING VISUAL CORE</span></div>}>
          <SignalCore
            mode={sceneMode}
            reducedMotion={reducedMotion}
            onCycle={() => setSceneMode((value) => (value + 1) % modes.length)}
          />
        </Suspense>
        <div className="scene-corner scene-corner-left"><span>DECISION LOOM / D-01</span><strong>{modes[sceneMode]}</strong></div>
        <div className="scene-corner scene-corner-right"><span>IST / {time || "--:--:--"}</span><span>POINTER REACTIVE</span></div>
        <div className="scene-mode-copy" aria-live="polite">
          <span>{String(sceneMode + 1).padStart(2, "0")}</span>
          <strong>{modeCopy[sceneMode]}</strong>
        </div>
        <div className="scene-modes" role="group" aria-label="Cognitive core mode">
          {modes.map((mode, index) => (
            <button
              key={mode}
              type="button"
              className={sceneMode === index ? "is-active" : ""}
              onClick={() => setSceneMode(index)}
              aria-pressed={sceneMode === index}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>{mode}
            </button>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

const SIGNALS = [
  "26 PUBLIC REPOSITORIES",
  "125M PARAMETER GPT",
  "16 PASSING TESTS",
  "95.75% CORE COVERAGE",
  "HUMAN APPROVAL GATES",
  "HYBRID RETRIEVAL",
  "IMMUTABLE AUDIT PROOF",
];

function SignalBand() {
  const proof = [
    ["26", "PUBLIC REPOSITORIES"],
    ["125M", "PARAMETER GPT / FROM SCRATCH"],
    ["06", "SELECTED SYSTEMS"],
    ["95.75%", "REVIVE CORE COVERAGE"],
  ];
  return (
    <section className="signal-band" aria-label="Selected proof points">
      <div className="signal-marquee" aria-hidden="true">
        <div className="signal-track">
          {[...SIGNALS, ...SIGNALS].map((signal, index) => (
            <span key={`${signal}-${index}`}>{signal}<i /></span>
          ))}
        </div>
      </div>
      <div className="proof-mosaic" role="group" aria-label="Portfolio metrics">
        {proof.map(([value, label]) => (
          <div key={label}><strong>{value}</strong><span>{label}</span></div>
        ))}
      </div>
    </section>
  );
}

function Work() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [viewMode, setViewMode] = useState("preview");
  const activeProject = PROJECTS[activeIndex];
  const selectProject = (index) => {
    setActiveIndex(index);
    setViewMode("preview");
  };
  const selectRelative = (delta) => {
    setActiveIndex((current) => (current + delta + PROJECTS.length) % PROJECTS.length);
    setViewMode("preview");
  };

  return (
    <section className="work-section section" id="work">
      <header className="work-ledger-heading">
        <h2><span>Pick a world.</span><em>Enter the build.</em></h2>
        <p>Tune into six working systems. See the interface first, then cut through it to the architecture, failure boundary, and proof.</p>
      </header>

      <div className="transmission-console" style={{ "--project-accent": activeProject.accent }}>
        <div className="transmission-index" role="group" aria-label="Select a project transmission">
          <div className="transmission-index-heading" aria-hidden="true"><span>TUNE A BUILD</span><span>{String(PROJECTS.length).padStart(2, "0")} CHANNELS</span></div>
          {PROJECTS.map((project, index) => (
            <button
              key={project.id}
              type="button"
              className={activeIndex === index ? "transmission-row is-active" : "transmission-row"}
              onClick={() => selectProject(index)}
              aria-pressed={activeIndex === index}
              aria-controls="active-project-transmission"
            >
              <span className="transmission-row-number">{project.index}</span>
              <span className="transmission-row-name">{project.name}</span>
              <span className="transmission-row-domain">{project.eyebrow}</span>
              <span className="transmission-row-status"><i aria-hidden="true" />{project.status}</span>
              <ArrowRight size={19} aria-hidden="true" />
            </button>
          ))}
        </div>

        <div className="transmission-stage">
          <div className="transmission-toolbar">
            <span><i aria-hidden="true" />{activeProject.feed}</span>
            <div className="transmission-mode-switch" role="group" aria-label="Choose project view">
              <button type="button" className={viewMode === "preview" ? "is-active" : ""} onClick={() => setViewMode("preview")} aria-pressed={viewMode === "preview"}>Interface</button>
              <button type="button" className={viewMode === "anatomy" ? "is-active" : ""} onClick={() => setViewMode("anatomy")} aria-pressed={viewMode === "anatomy"}>System</button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.article
              className="project-transmission"
              id="active-project-transmission"
              key={`${activeProject.id}-${viewMode}`}
              aria-live="polite"
              initial={{ opacity: 0, scale: 0.985, clipPath: "inset(0 0 12% 0)" }}
              animate={{ opacity: 1, scale: 1, clipPath: "inset(0 0 0% 0)" }}
              exit={{ opacity: 0, scale: 1.01, clipPath: "inset(12% 0 0 0)" }}
              transition={{ duration: 0.48, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="transmission-viewport">
                {viewMode === "preview" ? (
                  <motion.figure className="transmission-media" initial={{ filter: "blur(12px)", scale: 1.08 }} animate={{ filter: "blur(0px)", scale: 1 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
                    <img src={activeProject.image} alt={activeProject.imageAlt} />
                    <figcaption><span>NOW TRANSMITTING</span><strong>{activeProject.name}</strong><small>{activeProject.eyebrow}</small></figcaption>
                  </motion.figure>
                ) : (
                  <div className="transmission-anatomy">
                    <div className="anatomy-declaration"><span>THE SYSTEM BENEATH THE SCREEN</span><h3>{activeProject.headline}</h3><p>{activeProject.failure}</p></div>
                    <div className="anatomy-path" role="list" aria-label={`${activeProject.name} system path`}>
                      {activeProject.flow.map((step, index) => (
                        <span role="listitem" key={step}><small>{String(index + 1).padStart(2, "0")}</small><b>{step}</b>{index < activeProject.flow.length - 1 && <i aria-hidden="true" />}</span>
                      ))}
                    </div>
                    <div className="anatomy-proof" role="list" aria-label={`${activeProject.name} proof`}>
                      {activeProject.proof.map((item) => <span role="listitem" key={item}><Check size={16} weight="bold" aria-hidden="true" />{item}</span>)}
                    </div>
                  </div>
                )}
                <motion.span className="transmission-scan" aria-hidden="true" initial={{ top: "8%", opacity: 0 }} animate={{ top: "92%", opacity: [0, 0.9, 0] }} transition={{ duration: 1.25, ease: "easeInOut" }} />
              </div>

              <div className="transmission-story">
                <div className="transmission-story-main">
                  <span>{activeProject.name} / {activeProject.status}</span>
                  <h3>{activeProject.headline}</h3>
                  <p>{activeProject.summary}</p>
                </div>
                <div className="transmission-story-proof">
                  <div><span>WHAT IT REFUSES TO FAKE</span><p>{activeProject.failure}</p></div>
                  <div><span>WHAT PROVES IT</span>
                  <ul>{activeProject.proof.map((item) => <li key={item}><Check size={15} weight="bold" aria-hidden="true" />{item}</li>)}</ul>
                  </div>
                </div>
              </div>

              <footer className="transmission-footer">
                <div className="transmission-tags">{activeProject.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
                <div className="transmission-links">
                  {activeProject.live && <a href={activeProject.live} target="_blank" rel="noreferrer">Open live <ArrowSquareOut size={17} /></a>}
                  <a href={activeProject.repo} target="_blank" rel="noreferrer">Repository <GithubLogo size={18} /></a>
                </div>
              </footer>
            </motion.article>
          </AnimatePresence>

          <div className="transmission-navigation" role="group" aria-label="Browse project transmissions">
            <span>{String(activeIndex + 1).padStart(2, "0")} / {String(PROJECTS.length).padStart(2, "0")}</span>
            <button type="button" onClick={() => selectRelative(-1)} aria-label="Previous project"><ArrowLeft size={19} /></button>
            <button type="button" onClick={() => selectRelative(1)} aria-label="Next project"><ArrowRight size={19} /></button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Method() {
  const reducedMotion = useReducedMotion();
  const [activeCapability, setActiveCapability] = useState(0);
  const current = CAPABILITIES[activeCapability];
  const CurrentIcon = current.icon;
  return (
    <section className="method-section section" id="method">
      <div className="method-heading">
        <h2><span>Magic is cheap.</span><em>Proof is the product.</em></h2>
        <p>Move through the chamber. Every principle changes the live system—not just the caption—because trustworthy engineering should be visible under pressure.</p>
      </div>
      <div className="method-chamber" style={{ "--method-accent": ["#ff5f38", "#d8ff4f", "#7ea8ff", "#f2f2ec"][activeCapability] }}>
        <div className="method-visual" role="img" aria-label={`Live system view: ${current.title}`}>
          <Suspense fallback={<div className="method-field-fallback">ROUTING SYSTEM SIGNAL</div>}>
            <MethodField activeIndex={activeCapability} reducedMotion={reducedMotion} />
          </Suspense>
          <span className="method-visual-index">0{activeCapability + 1}</span>
          <div className="method-visual-hud"><span>VALIDATION CHAMBER / LIVE</span><strong><i /> SIGNAL ROUTED</strong></div>
          <div className="method-visual-axis" aria-hidden="true"><span>CHAOS</span><i /><span>CONTROL</span></div>
        </div>
        <div className="method-readout">
          <AnimatePresence mode="wait">
            <motion.article
              key={current.label}
              id="capability-readout"
              role="tabpanel"
              initial={reducedMotion ? false : { opacity: 0, y: 22, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={reducedMotion ? undefined : { opacity: 0, y: -12, filter: "blur(5px)" }}
              transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
            >
              <header><span>{current.label} / SYSTEM LAW</span><CurrentIcon size={27} weight="thin" /></header>
              <h3>{current.title}</h3>
              <blockquote>{current.law}</blockquote>
              <p>{current.body}</p>
              <div className="method-trace">{current.trace.map((item, index) => <span key={item}><i>{String(index + 1).padStart(2, "0")}</i>{item}</span>)}</div>
            </motion.article>
          </AnimatePresence>
        </div>
        <div className="method-stage-rail" role="tablist" aria-label="Engineering principles">
          {CAPABILITIES.map((capability, index) => {
            const Icon = capability.icon;
            return (
              <button
                key={capability.label}
                type="button"
                role="tab"
                className={activeCapability === index ? "is-active" : ""}
                aria-selected={activeCapability === index}
                aria-controls="capability-readout"
                onClick={() => setActiveCapability(index)}
                onPointerEnter={() => setActiveCapability(index)}
                onFocus={() => setActiveCapability(index)}
              >
                <span>0{index + 1}</span><Icon size={18} weight="thin" /><strong>{capability.label}</strong>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [signalPanel, setSignalPanel] = useState(null);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 130, damping: 24, mass: 0.2 });
  useEffect(() => {
    const closeOnDesktop = () => window.innerWidth > 860 && setMenuOpen(false);
    window.addEventListener("resize", closeOnDesktop);
    return () => window.removeEventListener("resize", closeOnDesktop);
  }, []);
  return (
    <MotionConfig reducedMotion="user">
      <motion.div className="scroll-progress" style={{ scaleX }} aria-hidden="true" />
      <AppHeader menuOpen={menuOpen} setMenuOpen={setMenuOpen} onOpenSignal={() => setSignalPanel("command")} />
      <SignalOperatingSystem panel={signalPanel} onPanelChange={setSignalPanel} />
      <main>
        <Hero />
        <SignalBand />
        <Suspense fallback={<div className="descent-loading">CALIBRATING SCROLL FIELD</div>}><CognitiveDescent /></Suspense>
        <Work />
        <Method />
        <IdentityVault />
        <Contact />
      </main>
      <footer className="site-footer">
        <span>© 2026 AMAN KUMAR</span>
        <nav aria-label="Footer professional profiles">
          <a href="https://github.com/ReaperXD67" target="_blank" rel="noreferrer">GitHub</a>
          <a href="https://www.linkedin.com/in/aman-kumar-494601329/" target="_blank" rel="noreferrer">LinkedIn</a>
          <a href="https://x.com/Aman1181" target="_blank" rel="noreferrer">X / Twitter</a>
          <a href="/profile/aman-kumar-resume.pdf" target="_blank" rel="noreferrer">Résumé</a>
        </nav>
        <a href="#top">RETURN TO ORIGIN</a>
      </footer>
    </MotionConfig>
  );
}
