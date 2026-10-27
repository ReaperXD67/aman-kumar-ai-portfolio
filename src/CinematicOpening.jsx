import { Component, lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { HeroFoundry } from "./HeroFoundry.jsx";
import { useReducedMotion } from "./useMotionPreference.js";
import { containFrame, mixFrame, readStory, smoothRange } from "./cinematic-motion.js";
import "./cinematic-opening.css";

gsap.registerPlugin(ScrollTrigger, useGSAP);
const World = lazy(() => import("./CinematicWorld.jsx"));
const Descent = lazy(() => import("./CognitiveDescent.jsx").then(module => ({ default: module.CognitiveDescent })));

class CinemaBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFailure(); }
  render() { return this.state.failed ? null : this.props.children; }
}

/** One physical stage, one scroll clock, then a measured capture-to-interface dock. */
export function CinematicOpening({ children }) {
  const reducedMotion = useReducedMotion();
  const root = useRef(null), sensor = useRef(null), bridge = useRef(null), bridgeImage = useRef(null);
  const projection = useRef(null), bridgeCancelled = useRef(false), controlsRef = useRef(null);
  const motion = useRef({ distance: 0, measures: { heroEnd: 1000, flightEnd: 4600, arrivalEnd: 6000 }, invalidate: null, heroNarrative: null, flightNarrative: null });
  const [controls, setControls] = useState({ mode: 0, paused: false });
  const [visible, setVisible] = useState(true), [failed, setFailed] = useState(false);
  const fail = useCallback(() => setFailed(true), []);
  const receiveControls = useCallback(next => {
    controlsRef.current = next;
    setControls(current => current.mode === next.mode && current.paused === next.paused ? current : { mode: next.mode, paused: next.paused });
  }, []);

  const sync = useCallback(() => {
    const node = root.current;
    if (!node) return;
    const story = readStory(motion.current.distance, motion.current.measures);
    motion.current.heroNarrative?.(story.hero);
    motion.current.flightNarrative?.(story.flight);
    // Read the destination before writing frame styles. The native image uses
    // contain/top-center; its element box may include a large letterbox area.
    const instrument = node.querySelector('.xray-instrument[data-project="karixmc"][data-depth="0"]');
    const image = instrument?.querySelector(".xray-surface > img");
    const ready = Boolean(image?.complete && image.naturalWidth && bridgeImage.current?.complete && projection.current);
    const active = !failed && !bridgeCancelled.current && ready && story.arrival > 0 && story.arrival < 1;
    let frame;
    if (active) frame = mixFrame(projection.current, containFrame(image.getBoundingClientRect(), image.naturalWidth, image.naturalHeight), story.arrival);
    node.dataset.cinemaAct = story.arrival > 0 ? "evidence" : story.flight > .01 ? "projects" : story.passage > .02 ? "unfold" : "signal";
    node.dataset.bridgeActive = String(active);
    node.style.setProperty("--passage", String(story.passage));
    // The projected copy takes ownership in place, before it travels. Keeping
    // the world visible through the dock would expose two separate captures.
    node.style.setProperty("--world-opacity", String(1 - smoothRange(story.arrival, 0, .04)));
    node.style.setProperty("--surface-arrival-opacity", String(smoothRange(story.arrival, .86, 1)));
    if (bridge.current) {
      bridge.current.style.opacity = active ? String(1 - smoothRange(story.arrival, .86, 1)) : "0";
      if (frame) {
        bridge.current.style.transform = `translate3d(${frame.left}px, ${frame.top}px, 0) scale(${frame.width / projection.current.width}, ${frame.height / projection.current.height})`;
      }
    }
    motion.current.invalidate?.();
  }, [failed]);
  const receiveProjection = useCallback(frame => {
    projection.current = frame;
    if (bridge.current) { bridge.current.style.width = `${frame.width}px`; bridge.current.style.height = `${frame.height}px`; }
    sync();
  }, [sync]);

  useEffect(() => {
    if (reducedMotion || !sensor.current) return undefined;
    let near = true;
    const update = () => setVisible(near && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => { near = entry.isIntersecting; update(); }, { rootMargin: "180px" });
    observer.observe(sensor.current);
    document.addEventListener("visibilitychange", update);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", update); };
  }, [reducedMotion]);

  useGSAP(() => {
    if (reducedMotion) return undefined;
    const node = root.current, driver = { distance: motion.current.distance };
    const measure = () => {
      const origin = node.getBoundingClientRect().top + window.scrollY;
      const hero = node.querySelector(".hero-foundry"), descent = node.querySelector(".descent-flight"), lens = node.querySelector(".xray-lens");
      if (!hero || !descent || !lens) return;
      const headerBottom = document.querySelector(".site-header")?.getBoundingClientRect().bottom || 76;
      const heroEnd = descent.getBoundingClientRect().top + window.scrollY - origin;
      const flightEnd = heroEnd + Math.max(1, descent.offsetHeight - window.innerHeight);
      const arrivalEnd = Math.max(flightEnd + 1, lens.getBoundingClientRect().top + window.scrollY - origin - headerBottom - 16);
      motion.current.measures = { heroEnd, flightEnd, arrivalEnd };
      node.style.setProperty("--render-range", `${arrivalEnd + window.innerHeight + 160}px`);
    };
    measure();
    const tween = gsap.fromTo(driver, { distance: 0 }, { distance: () => Math.max(1, node.offsetHeight - window.innerHeight), ease: "none", immediateRender: false,
      onUpdate: () => { motion.current.distance = driver.distance; sync(); },
      scrollTrigger: { trigger: node, start: "top top", end: "bottom bottom", scrub: .55, invalidateOnRefresh: true, onRefreshInit: measure, onRefresh: () => { motion.current.distance = driver.distance; sync(); } } });
    let refreshFrame = 0, alive = true;
    const requestRefresh = () => { if (!refreshFrame) refreshFrame = requestAnimationFrame(() => { refreshFrame = 0; measure(); ScrollTrigger.refresh(); }); };
    const observer = new ResizeObserver(requestRefresh);
    observer.observe(node);
    document.fonts?.ready.then(() => { if (alive) requestRefresh(); });
    return () => { alive = false; observer.disconnect(); cancelAnimationFrame(refreshFrame); tween.kill(); motion.current.invalidate = null; };
  }, { scope: root, dependencies: [reducedMotion, sync], revertOnUpdate: true });

  const cancelBridge = event => {
    if (event.target.closest?.("#work button, #work input, #work a")) { bridgeCancelled.current = true; sync(); }
  };
  if (reducedMotion) return <><HeroFoundry /><Suspense fallback={null}><Descent /></Suspense>{children}</>;
  return <section ref={root} className="cinematic-opening" data-cinema-act="signal" data-bridge-active="false" data-scene-failed={failed} onPointerDownCapture={cancelBridge} onKeyDownCapture={cancelBridge}>
    <div className="cinematic-render-sensor" ref={sensor} aria-hidden="true" />
    <div className="cinematic-stage" aria-hidden="true">
      {visible && !failed && <CinemaBoundary onFailure={fail}><Suspense fallback={null}><World motion={motion} mode={controls.mode} paused={controls.paused} onCycle={() => controlsRef.current?.cycle?.()} onFailure={fail} onProjection={receiveProjection} /></Suspense></CinemaBoundary>}
      <div className="cinematic-grade cinematic-grade-hero" /><div className="cinematic-grade cinematic-grade-flight" />
      {failed && <div className="cinematic-unavailable"><strong>Observe. Reason. Execute.</strong><p>The 3D view is unavailable. The work is ready to inspect.</p></div>}
    </div>
    <div className="cinematic-hero-layer"><HeroFoundry sharedScene motionRef={motion} onSceneState={receiveControls} /></div>
    <Suspense fallback={<div className="descent-section descent-loading">CALIBRATING SCROLL FIELD</div>}><Descent sharedScene motionRef={motion} sceneFailed={failed} /></Suspense>
    <div className="cinematic-evidence">{children}</div>
    <div ref={bridge} className="cinematic-capture-dock" aria-hidden="true"><img ref={bridgeImage} src="/assets/karixmc-live.png" alt="" decoding="async" onLoad={sync} /></div>
  </section>;
}
