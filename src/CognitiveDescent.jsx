import { Component, Suspense, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { ArrowDown, ArrowUpRight } from "@phosphor-icons/react";
import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "./useMotionPreference.js";
import { DescentWorld, FLIGHT_BAYS, FlightContextObserver } from "./DescentWorld.jsx";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./cognitive-descent.css";
import { readStory } from "./cinematic-motion.js";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const CHAPTERS = [
  { id: "atlaslm", name: "AtlasLM", title: "Signal earns a source.", line: "Dense + lexical retrieval. Evidence before an answer.", status: "LIVE WORKBENCH", repo: "https://github.com/ReaperXD67/notebooklm-rag", color: "#d8ff4f", side: "left" },
  { id: "agent", name: "Autonomous Personal Agent", title: "Intent needs an owner.", line: "Explicit approval. Leased ownership. Recorded receipts.", status: "SELF-HOSTED LOCAL ALPHA", repo: "https://github.com/ReaperXD67/autonomous-personal-agent", color: "#8bb8ff", side: "right" },
  { id: "karixmc", name: "KarixMC", title: "Trust crosses a boundary.", line: "Signed Paper activity. A delivery path that leaves a ledger.", status: "LIVE PRODUCT / VPS", repo: "https://github.com/ReaperXD67/MinePulse", color: "#ff673d", side: "left" },
];

class FlightBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFailure(); }
  render() { return this.state.failed ? null : this.props.children; }
}

function StaticFlight() {
  return <div className="flight-static">
    <header><h2>From signal<br />to a system.</h2><p>Three real builds. Follow the source through retrieval, ownership and signed delivery.</p></header>
    <div className="flight-static-builds">{CHAPTERS.map((chapter, index) => <article key={chapter.id} style={{ "--flight-color": chapter.color }}>
      <img src={FLIGHT_BAYS[index].image} alt={`${chapter.name} ${chapter.id === "agent" ? "authored architecture blueprint" : "captured interface"}`} loading="lazy" decoding="async" />
      <div><h3>{chapter.name}</h3><p>{chapter.line}</p><span>{chapter.status}</span><a href={chapter.repo} target="_blank" rel="noreferrer">Inspect source <ArrowUpRight size={16} /></a></div>
    </article>)}</div>
    <a className="flight-static-next" href="#work">Open the engineering evidence <ArrowDown size={18} /></a>
  </div>;
}

export function CognitiveDescent({ sharedScene = false, motionRef, sceneFailed = false }) {
  const sectionRef = useRef(null);
  const progressRef = useRef(0);
  const invalidateRef = useRef(null);
  const reducedMotion = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const [failed, setFailed] = useState(false);
  const staticMode = reducedMotion || failed || sceneFailed;

  useEffect(() => {
    const node = sectionRef.current;
    if (!node || staticMode || sharedScene) return undefined;
    let nearViewport = !("IntersectionObserver" in window);
    const updateVisibility = () => setVisible(nearViewport && !document.hidden);
    const observer = "IntersectionObserver" in window ? new IntersectionObserver(([entry]) => {
      nearViewport = entry.isIntersecting;
      updateVisibility();
    }, { rootMargin: "160px" }) : null;
    observer?.observe(node);
    document.addEventListener("visibilitychange", updateVisibility);
    if (!observer) updateVisibility();
    return () => { observer?.disconnect(); document.removeEventListener("visibilitychange", updateVisibility); };
  }, [staticMode, sharedScene]);

  useGSAP(() => {
    if (staticMode) { progressRef.current = 0; return undefined; }
    const section = sectionRef.current;
    const driver = { progress: 0 };
    const sync = () => {
      progressRef.current = driver.progress;
      section.style.setProperty("--journey-progress", driver.progress.toFixed(4));
      const chapter = driver.progress < .15 ? "entry" : driver.progress < .39 ? "atlaslm" : driver.progress < .66 ? "agent" : driver.progress < .89 ? "karixmc" : "evidence";
      if (section.dataset.flightChapter !== chapter) section.dataset.flightChapter = chapter;
      invalidateRef.current?.();
    };
    const timeline = gsap.timeline(sharedScene ? { paused: true } : { scrollTrigger: { trigger: section, start: "top top", end: "bottom bottom", scrub: .45, invalidateOnRefresh: true } });
    timeline.to(driver, { progress: 1, duration: 1, ease: "none", onUpdate: sync }, 0)
      .to(".flight-intro", { autoAlpha: 0, y: -55, duration: .08, ease: "power2.in" }, .035);
    [[.15, .34], [.40, .61], [.67, .85]].forEach(([start, end], index) => {
      timeline.fromTo(`.flight-chapter-${CHAPTERS[index].id}`, { autoAlpha: 0, y: 45 }, { autoAlpha: 1, y: 0, duration: .04, ease: "expo.out" }, start)
        .to(`.flight-chapter-${CHAPTERS[index].id}`, { autoAlpha: 0, y: -24, duration: .045, ease: "power2.in" }, end);
    });
    timeline.fromTo(".flight-exit", { autoAlpha: 0, y: 45 }, { autoAlpha: 1, y: 0, duration: .09, ease: "expo.out" }, .89);
    const update = progress => timeline.progress(progress);
    if (sharedScene && motionRef) {
      motionRef.current.flightNarrative = update;
      update(readStory(motionRef.current.distance, motionRef.current.measures).flight);
    }
    let active = true;
    document.fonts?.ready.then(() => { if (active) ScrollTrigger.refresh(); });
    return () => { active = false; timeline.kill(); invalidateRef.current = null; if (motionRef?.current.flightNarrative === update) motionRef.current.flightNarrative = null; };
  }, { scope: sectionRef, dependencies: [staticMode, sharedScene, motionRef], revertOnUpdate: true });

  return <section className="descent-section descent-flight" ref={sectionRef} data-shared-scene={sharedScene} data-static={staticMode} data-flight-chapter="entry" aria-label="A scroll-controlled journey through three real engineering projects">
    <StaticFlight />
    {!staticMode && <div className="descent-stage flight-stage">
      {!sharedScene && <><div className="flight-poster" aria-hidden="true"><img src="/assets/atlaslm-landing.png" alt="" /></div>
      <div className="descent-canvas flight-canvas" aria-hidden="true">
        {visible && <FlightBoundary onFailure={() => setFailed(true)}><Canvas camera={{ position: [-.8, -.25, 13], fov: 50, near: .08, far: 70 }} dpr={1} frameloop="demand" gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}>
          <FlightContextObserver onFailure={() => setFailed(true)} />
          <Suspense fallback={null}><DescentWorld progressRef={progressRef} invalidateRef={invalidateRef} /></Suspense>
        </Canvas></FlightBoundary>}
      </div></>}
      <div className="flight-shade" aria-hidden="true" />
      <header className="flight-navigation"><span>SCROLL THROUGH THE SYSTEM</span><a href="#work">Skip to evidence <ArrowDown size={15} /></a></header>
      <div className="flight-progress" aria-hidden="true"><i /></div>
      <div className="flight-intro" aria-hidden="true"><p>Follow the signal.</p><h2>Go deeper.</h2><span>Scroll to move. Stop to look.</span></div>
      {CHAPTERS.map(chapter => <div key={chapter.id} className={`flight-chapter flight-chapter-${chapter.id}`} data-side={chapter.side} style={{ "--flight-color": chapter.color }} aria-hidden="true">
        <p>{chapter.title}</p><h2>{chapter.name}</h2><span>{chapter.line}</span><small>{chapter.status} · {chapter.id === "agent" ? "AUTHORED BLUEPRINT" : "ACTUAL INTERFACE"}</small>
      </div>)}
      <div className={`flight-exit${sharedScene ? " flight-arrival" : ""}`}><h2>{sharedScene ? <>From product<br />to proof.</> : <>The system<br />becomes proof.</>}</h2><p>{sharedScene ? "Keep scrolling. Follow the interface into its engineering." : "Now inspect the choices that hold it together."}</p><a href="#work">Open the evidence <ArrowDown size={18} /></a></div>
      <footer className="flight-footer" aria-hidden="true"><span>ILLUSTRATED ARCHITECTURE · REAL PROJECT ARTIFACTS</span><span>NATIVE SCROLL / NO LIVE TELEMETRY</span></footer>
      <p className="sr-only">An authored camera journey passes through an angular signal field and real AtlasLM, Autonomous Personal Agent and KarixMC artifacts. The ordinary selected-work section below provides all project source links and decisions.</p>
    </div>}
  </section>;
}
