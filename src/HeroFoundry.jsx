import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowSquareOut, Pause, Play } from "@phosphor-icons/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { PortraitSignature } from "./PortraitSignal.jsx";
import { useReducedMotion } from "./useMotionPreference.js";
import "./hero-foundry.css";

gsap.registerPlugin(ScrollTrigger, useGSAP);
const SignalCore = lazy(() => import("./SignalCore.jsx").then(module => ({ default: module.SignalCore })));
const MODES = ["Observe", "Reason", "Execute"];
const CAPTIONS = ["From noise, a signal.", "From evidence, a decision.", "From intent, controlled action."];

export function HeroFoundry() {
  const root = useRef(null);
  const reducedMotion = useReducedMotion();
  const [mode, setMode] = useState(0);
  const [paused, setPaused] = useState(false);
  const [interacted, setInteracted] = useState(false);
  const choose = useCallback(index => { setInteracted(true); setMode(index); }, []);
  const cycle = useCallback(() => { setInteracted(true); setMode(value => (value + 1) % 3); }, []);

  // One opening performance. Any visitor input owns the instrument immediately.
  useEffect(() => {
    if (reducedMotion || paused || interacted) return undefined;
    const timers = [[1900, 1], [4300, 2], [6900, 1]].map(([time, next]) => window.setTimeout(() => setMode(next), time));
    const stop = () => { if (document.hidden) setInteracted(true); };
    const observer = new IntersectionObserver(([entry]) => { if (!entry.isIntersecting) setInteracted(true); });
    observer.observe(root.current);
    document.addEventListener("visibilitychange", stop);
    return () => { timers.forEach(window.clearTimeout); observer.disconnect(); document.removeEventListener("visibilitychange", stop); };
  }, [interacted, paused, reducedMotion]);

  useGSAP(() => {
    if (reducedMotion) return;
    gsap.from(".foundry-title .hero-line > span", { yPercent: 105, rotationX: 12, filter: "blur(5px)", duration: 1.25, stagger: 0.13, ease: "expo.out", delay: 0.15 });
    gsap.from(".foundry-role, .foundry-caption-row, .foundry-console", { y: 18, opacity: 0, duration: 0.9, stagger: 0.1, ease: "power3.out", delay: 0.55 });
    gsap.to(".foundry-title", { y: -85, opacity: 0.25, ease: "none", scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: 0.7 } });
    gsap.to(".foundry-art", { scale: 1.12, yPercent: 8, ease: "none", scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: 0.7 } });
  }, { scope: root, dependencies: [reducedMotion], revertOnUpdate: true });

  return (
    <section className="hero hero-foundry" id="top" ref={root} data-loom-mode={MODES[mode].toLowerCase()} data-motion-paused={paused || reducedMotion}>
      <div className="scene-panel foundry-art">
        <Suspense fallback={<div className="scene-fallback">ASSEMBLING THE DECISION LOOM</div>}>
          <SignalCore mode={mode} reducedMotion={reducedMotion} paused={paused} onCycle={cycle} />
        </Suspense>
      </div>
      <div className="foundry-shade" aria-hidden="true" />
      <div className="foundry-topline">
        <PortraitSignature />
        <div className="foundry-art-caption"><span>DECISION LOOM</span><strong>Noise → structure → action</strong><small>Move through the field. Click to transform.</small></div>
      </div>
      <div className="hero-copy">
        <p className="foundry-role">AI Engineer <span>&</span> Full-Stack Developer</p>
        <h1 className="foundry-title" aria-label="Intelligence, engineered.">
          <span className="hero-line"><span>Intelligence,</span></span>
          <span className="hero-line"><span>engineered.</span></span>
        </h1>
        <div className="foundry-caption-row">
          <p className="hero-lede">I build AI systems that earn trust beyond the demo—from the model and its guardrails to the product people actually use.</p>
          <div className="hero-actions">
            <a className="button button-solid" href="#work">Enter the work <ArrowDown size={18} /></a>
            <a className="button button-outline" href="#resume">View résumé <ArrowSquareOut size={18} /></a>
          </div>
        </div>
      </div>
      <footer className="foundry-console">
        <div className="foundry-state"><span className="foundry-state-dot" aria-hidden="true" /><p>{CAPTIONS[mode]}</p><small>AUTHORED WEBGL FIELD</small></div>
        <div className="scene-modes" role="group" aria-label="Cognitive core mode">
          {MODES.map((name, index) => <button key={name} type="button" aria-pressed={mode === index} onClick={() => choose(index)}><span>0{index + 1}</span>{name}</button>)}
        </div>
        <button className="foundry-pause" type="button" aria-label={paused ? "Resume hero motion" : "Pause hero motion"} aria-pressed={paused} disabled={reducedMotion} onClick={() => { setInteracted(true); setPaused(value => !value); }}>{paused || reducedMotion ? <Play size={17} /> : <Pause size={17} />}<span>{reducedMotion ? "Reduced motion" : paused ? "Resume" : "Pause"}</span></button>
      </footer>
    </section>
  );
}
