import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  ArrowSquareOut,
  Briefcase,
  Check,
  Copy,
  DownloadSimple,
  EnvelopeSimple,
  FilePdf,
  GithubLogo,
  GraduationCap,
  LinkedinLogo,
  Phone,
  SealCheck,
  X,
  XLogo,
} from "@phosphor-icons/react";

const CAREER = [
  {
    id: "sip",
    period: "JUL 2026 — PRESENT",
    role: "Project Lead Developer Intern",
    organization: "SIP Organization",
    location: "Remote",
    thesis: "Leading the delivery of AI-powered WhatsApp products from conversational logic through production services.",
    details: [
      "Building an intelligent onboarding bot and customer assistant with context-aware response orchestration.",
      "Coordinating backend integrations and distributed AI microservices across the end-to-end delivery path.",
      "Improving reliability, performance, and the operating experience around LLM-powered customer workflows.",
    ],
    stack: ["Conversational AI", "Distributed services", "Backend integrations", "WhatsApp"],
  },
  {
    id: "micro1",
    period: "AUG 2025 — JUL 2026",
    role: "AI Engineer Intern",
    organization: "micro1",
    location: "Remote",
    thesis: "Helped build a biologically inspired AI architecture that changes its own worker topology as demand changes.",
    details: [
      "Implemented automatic worker spawning for dynamic task allocation in a self-adaptive architecture.",
      "Designed modular cell components for worker creation, inter-cell communication, and workload distribution.",
      "Added resource management and performance monitoring for adaptive execution under changing compute demand.",
    ],
    stack: ["Agent architecture", "Dynamic workers", "Resource control", "Monitoring"],
  },
  {
    id: "independent",
    period: "2025 — PRESENT",
    role: "Independent AI / ML Developer",
    organization: "Freelance",
    location: "Remote",
    thesis: "Turning open-ended AI ideas into versioned, deployable systems with explicit data and inference pipelines.",
    details: [
      "Delivering LLM, machine-learning, and automation workflows with PyTorch, FastAPI, Dify, n8n, and REST integrations.",
      "Building modular model-training, evaluation, inference, and data-processing pipelines.",
      "Shipping deployment-ready code across Vercel, Linux VPS, Docker, and Git-based workflows.",
    ],
    stack: ["PyTorch", "FastAPI", "Dify / n8n", "Vercel / VPS"],
  },
];

const DEFAULT_RESUME = {
  url: "/profile/aman-kumar-resume.pdf",
  preview: "/profile/aman-kumar-resume-preview.png",
  dossierUrl: "/profile/aman-kumar-systems-dossier.pdf",
  dossierPreview: "/profile/aman-kumar-dossier-preview.png",
  version: "2026.09",
  updated: "01 SEP 2026",
  source: "ATS + SYSTEMS DOSSIER",
};

const PROFILE_LINKS = [
  { label: "GitHub", href: "https://github.com/ReaperXD67", icon: GithubLogo },
  { label: "LinkedIn", href: "https://linkedin.com/in/aman-kumar-494601329", icon: LinkedinLogo },
  { label: "X / Twitter", href: "https://x.com/Aman1181", icon: XLogo },
];

const IdentityKernel = lazy(() =>
  import("./IdentityKernel.jsx").then((module) => ({ default: module.IdentityKernel })),
);

function CompiledIdentityHeading({ reducedMotion }) {
  const letters = "ACCOUNTABLE".split("");
  const glyphVariants = {
    hidden: { opacity: 0, y: 28, clipPath: "inset(100% 0 0 0)" },
    visible: (index) => ({
      opacity: 1,
      y: 0,
      clipPath: "inset(0% 0 0 0)",
      transition: { duration: 0.48, delay: 0.35 + index * 0.045, ease: [0.16, 1, 0.3, 1] },
    }),
  };
  return (
    <h2 className="identity-thesis">
      <span className="sr-only">Not artificial intelligence. Accountable intelligence.</span>
      <span className="identity-thesis-visual" aria-hidden="true">
        <span className="identity-thesis-reject">
          <motion.i
            initial={reducedMotion ? false : { scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, amount: 0.8 }}
            transition={{ duration: 0.5, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          />
          <span>ARTIFICIAL</span>
          <small>NOT THE THESIS</small>
        </span>
        <motion.span
          className="identity-thesis-build"
          aria-label="Accountable"
          initial={reducedMotion ? false : "hidden"}
          whileInView="visible"
          viewport={{ once: true, amount: 0.35 }}
        >
          {letters.map((letter, index) => (
            <motion.span
              key={`${letter}-${index}`}
              custom={index}
              variants={glyphVariants}
            >
              {letter}
            </motion.span>
          ))}
        </motion.span>
        <motion.span
          className="identity-thesis-object"
          initial={reducedMotion ? false : { opacity: 0, x: -18 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.8 }}
          transition={{ duration: 0.55, delay: 1.05, ease: [0.16, 1, 0.3, 1] }}
        >
          intelligence.
        </motion.span>
      </span>
    </h2>
  );
}

function ArtifactDialog({ artifact, resume, onClose }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (artifact && dialog && !dialog.open) dialog.showModal();
    if (!artifact && dialog?.open) dialog.close();
  }, [artifact]);

  const close = () => {
    dialogRef.current?.close();
    onClose();
  };

  return (
    <dialog
      className="artifact-dialog"
      ref={dialogRef}
      onClose={onClose}
      onClick={(event) => event.target === event.currentTarget && close()}
    >
      <div className="artifact-dialog-shell">
        <header>
          <div>
            <span>{artifact === "resume" ? "CAREER SOURCE / PDF" : "VERIFIED CREDENTIAL / IMAGE"}</span>
            <strong>{artifact === "resume" ? "AMAN KUMAR — RÉSUMÉ" : "MICRO1 — AI / ML DEVELOPER"}</strong>
          </div>
          <button type="button" onClick={close} aria-label="Close document viewer"><X size={20} /></button>
        </header>
        <div className="artifact-dialog-content">
          {artifact === "resume" ? (
            <iframe title="Aman Kumar résumé" src={`${resume.url}#view=FitH`} />
          ) : (
            <img src="/assets/micro1-certification.jpg" alt="micro1 certification awarded to Aman Kumar" />
          )}
        </div>
      </div>
    </dialog>
  );
}

export function IdentityVault() {
  const reducedMotion = useReducedMotion();
  const [activeCareer, setActiveCareer] = useState(0);
  const [artifact, setArtifact] = useState(null);
  const [resume, setResume] = useState(DEFAULT_RESUME);

  useEffect(() => {
    let alive = true;
    fetch("/profile/resume.json", { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("Resume manifest unavailable");
        return response.json();
      })
      .then((manifest) => alive && setResume({ ...DEFAULT_RESUME, ...manifest }))
      .catch(() => alive && setResume(DEFAULT_RESUME));
    return () => { alive = false; };
  }, []);

  const current = CAREER[activeCareer];

  return (
    <>
      <section className="identity-section section" id="about">
        <motion.div
          className="identity-kernel-frame"
          initial={reducedMotion ? false : { opacity: 0.72, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.28 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <Suspense fallback={<div className="identity-kernel-fallback"><span>COMPILING SYSTEMS KERNEL</span></div>}>
            <IdentityKernel reducedMotion={reducedMotion} />
          </Suspense>
        </motion.div>

        <div className="identity-copy">
          <CompiledIdentityHeading reducedMotion={reducedMotion} />
          <p>
            I build AI products that can explain their state, survive failure, and earn trust after the demo ends—from model behavior and backend systems to infrastructure and the interface people actually use.
          </p>
          <div className="identity-facts">
            <div><span>BASE</span><strong>BENGALURU / INDIA</strong></div>
            <div><span>POSITION</span><strong>AI + FULL-STACK</strong></div>
            <div><span>AVAILABILITY</span><strong>OPEN / ANY MODE</strong></div>
          </div>
          <nav className="identity-links" aria-label="Professional profiles">
            {PROFILE_LINKS.map(({ label, href, icon: Icon }) => (
              <a key={label} href={href} target="_blank" rel="noreferrer">
                <Icon size={18} /> {label} <ArrowSquareOut size={14} />
              </a>
            ))}
          </nav>
        </div>
      </section>

      <section className="career-section" id="experience">
        <div className="career-heading">
          <h2>Experience, decrypted into operating evidence.</h2>
          <p>Not a chronology of titles. A trace of increasingly difficult systems, wider ownership, and code expected to keep working after the demo.</p>
        </div>

        <div className="career-console">
          <div className="career-rail" role="tablist" aria-label="Experience timeline">
            {CAREER.map((item, index) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={activeCareer === index}
                aria-controls={`career-panel-${item.id}`}
                className={activeCareer === index ? "is-active" : ""}
                onClick={() => setActiveCareer(index)}
              >
                <span>{item.period}</span>
                <strong>{item.organization}</strong>
                <small>{item.role}</small>
                <ArrowRight size={18} />
              </button>
            ))}
          </div>

          <div className="career-stage">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                id={`career-panel-${current.id}`}
                role="tabpanel"
                initial={reducedMotion ? false : { opacity: 0, x: 24, filter: "blur(8px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                exit={reducedMotion ? undefined : { opacity: 0, x: -14, filter: "blur(5px)" }}
                transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
              >
                <header>
                  <span>{current.period} / {current.location}</span>
                  <Briefcase size={28} weight="thin" />
                </header>
                <h3>{current.role}</h3>
                <p>{current.thesis}</p>
                <ul className="career-details">
                  {current.details.map((detail) => <li key={detail}><Check size={15} weight="bold" />{detail}</li>)}
                </ul>
                <div className="career-stack">{current.stack.map((item) => <span key={item}>{item}</span>)}</div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="education-signal">
          <GraduationCap size={31} weight="thin" />
          <div><span>EDUCATION / AUG 2024 — SEP 2028</span><strong>Scaler School of Technology × BITS Pilani</strong></div>
          <p>Bachelor of Science in Computer Science · Bengaluru, Karnataka</p>
        </div>
      </section>

      <section className="proof-vault-section" id="resume">
        <div className="proof-vault-heading">
          <h2>The source file is alive.</h2>
          <p>Résumé and certification are presented as inspectable artifacts. No decorative badge wall, no claims without a document behind them.</p>
        </div>

        <div className="proof-vault-grid">
          <article className="resume-artifact">
            <button className="artifact-preview" type="button" onClick={() => setArtifact("resume")} aria-label="Inspect Aman Kumar résumé">
              <img src={resume.preview} alt="Preview of Aman Kumar's résumé" loading="lazy" />
              <span><FilePdf size={20} /> INSPECT SOURCE</span>
            </button>
            <div className="artifact-copy">
              <h3>One career source. Two recruiter modes.</h3>
              <header><span>RÉSUMÉ / {resume.version}</span><strong>LIVE SOURCE</strong></header>
              <p>The ATS edition is tuned for applications and parsing. The cinematic systems dossier exposes the same verified experience as a designed proof artifact. Both stay synchronized through one runtime manifest.</p>
              <dl>
                <div><dt>LAST VERIFIED</dt><dd>{resume.updated}</dd></div>
                <div><dt>SOURCE MODE</dt><dd>{resume.source}</dd></div>
                <div><dt>UPDATE PATH</dt><dd>REPLACE FILE / CHANGE URL</dd></div>
              </dl>
              <div className="artifact-actions">
                <button type="button" onClick={() => setArtifact("resume")}>Open résumé <ArrowSquareOut size={17} /></button>
                <a href={resume.url} download>Download PDF <DownloadSimple size={17} /></a>
                <a href={resume.dossierUrl} target="_blank" rel="noreferrer">Systems dossier <ArrowSquareOut size={17} /></a>
              </div>
            </div>
          </article>

          <article className="certificate-artifact">
            <button className="artifact-preview" type="button" onClick={() => setArtifact("certificate")} aria-label="Inspect micro1 certification">
              <img src="/assets/micro1-certification.jpg" alt="micro1 AI and machine learning developer certificate awarded to Aman Kumar" loading="lazy" />
              <span><SealCheck size={20} /> VERIFY CREDENTIAL</span>
            </button>
            <div className="artifact-copy">
              <h3>Certified Freelance AI / Machine Learning Developer.</h3>
              <header><span>MICRO1 / 11 MAR 2026</span><strong>VERIFIED</strong></header>
              <p>Awarded after successfully passing micro1’s AI Interview. The original credential remains available as the proof surface.</p>
              <div className="credential-stamp"><SealCheck size={27} weight="fill" /><span>INTERVIEW PASSED</span><strong>AI / ML DEVELOPER</strong></div>
              <div className="artifact-actions"><button type="button" onClick={() => setArtifact("certificate")}>Inspect certificate <ArrowSquareOut size={17} /></button></div>
            </div>
          </article>
        </div>
      </section>

      <ArtifactDialog artifact={artifact} resume={resume} onClose={() => setArtifact(null)} />
    </>
  );
}

export function Contact() {
  const email = "amankumr3254u@gmail.com";
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState("");
  const [fields, setFields] = useState({ name: "", sender: "", brief: "" });

  const copyEmail = async () => {
    await navigator.clipboard.writeText(email);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const submit = (event) => {
    event.preventDefault();
    const subject = `Portfolio enquiry from ${fields.name}`;
    const body = `Name: ${fields.name}\nEmail: ${fields.sender}\n\nProject / opportunity:\n${fields.brief}`;
    setStatus("Opening your email client with the brief attached…");
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <section className="contact-section section" id="contact">
      <div className="contact-intro">
        <h2>Bring me the problem that doesn’t fit in a tutorial.</h2>
        <p>AI engineering, full-stack systems, internships, product delivery, and ambitious freelance builds. If the problem is messy but meaningful, send it.</p>
        <div className="contact-direct">
          <a href={`mailto:${email}`}><EnvelopeSimple size={18} />{email}</a>
          <a href="tel:+917667116926"><Phone size={18} />+91 76671 16926</a>
          <button type="button" onClick={copyEmail}>{copied ? <Check size={18} weight="bold" /> : <Copy size={18} />}{copied ? "Copied" : "Copy email"}</button>
        </div>
      </div>

      <form className="contact-form" onSubmit={submit}>
        <div className="contact-form-top"><span>PROJECT INTAKE / EMAIL HANDOFF</span><strong>AVAILABLE</strong></div>
        <label>
          <span>Your name</span>
          <input value={fields.name} onChange={(event) => setFields({ ...fields, name: event.target.value })} name="name" autoComplete="name" required placeholder="Who am I speaking with?" />
        </label>
        <label>
          <span>Your email</span>
          <input value={fields.sender} onChange={(event) => setFields({ ...fields, sender: event.target.value })} name="email" type="email" autoComplete="email" required placeholder="you@company.com" />
        </label>
        <label>
          <span>The problem</span>
          <textarea value={fields.brief} onChange={(event) => setFields({ ...fields, brief: event.target.value })} name="brief" required minLength={20} rows={6} placeholder="What are you trying to build, repair, or prove?" />
        </label>
        <button className="contact-submit" type="submit">Send the brief <ArrowRight size={19} /></button>
        <p className="contact-status" role="status">{status || "Submitting opens a pre-filled email so the message goes directly to Aman."}</p>
      </form>
    </section>
  );
}
