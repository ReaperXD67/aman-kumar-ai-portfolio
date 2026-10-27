import { useEffect, useRef } from "react";
import { ContinuationSignal } from "./ContinuationSignal.jsx";
import { useReducedMotion } from "./useMotionPreference.js";
import { documentFrame, methodOutputProgress, readContinuation, viewportFrame } from "./continuation-motion.js";
import { smoothRange } from "./cinematic-motion.js";
import "./cinematic-continuation.css";

const STOPS = [
  [".method-visual", "method"],
  [".identity-kernel-frame", "portrait"],
  [".career-console", "record"],
  [".resume-artifact .artifact-preview", "record"],
  [".contact-form", "contact"],
];
const WORDS = ".method-heading,.method-readout,.method-stage-rail,.identity-copy,.portrait-instrument-header,.portrait-instrument-footer,.career-heading,.career-rail,.career-stage,.education-signal,.proof-vault-heading,.artifact-copy,.contact-intro,.contact-form-top,.contact-form label,.contact-submit,.contact-status";

/** One signal carrier follows native artifact bounds through the entire ending. */
export function CinematicContinuation({ children, continuation }) {
  const root = useRef(null);
  const reducedMotion = useReducedMotion();
  useEffect(() => {
    const node = root.current, shared = continuation.current;
    let frame = 0, needsMeasure = true, visible = false, disposed = false;
    let localStops = [], localExclusions = [], measuredOrigin = { left: 0, top: 0 };
    shared.reduced = Boolean(reducedMotion);
    const box = element => {
      const rect = element.getBoundingClientRect();
      return { left: rect.left - measuredOrigin.left, top: rect.top - measuredOrigin.top, width: rect.width, height: rect.height };
    };
    const measure = () => {
      measuredOrigin = node.getBoundingClientRect();
      localStops = STOPS.flatMap(([selector, act]) => {
        const element = node.querySelector(selector);
        return element ? [{ ...box(element), act }] : [];
      });
      localExclusions = [...node.querySelectorAll(WORDS)].map(box);
      needsMeasure = false;
    };
    const sync = () => {
      frame = 0;
      if (disposed) return;
      if (needsMeasure) measure();
      const y = window.scrollY, height = window.innerHeight;
      const rootBox = node.getBoundingClientRect();
      const origin = { left: rootBox.left, top: rootBox.top + y };
      const stops = localStops.map(rectangle => documentFrame(rectangle, origin));
      const exclusions = localExclusions.map(rectangle => documentFrame(rectangle, origin));
      const route = readContinuation(y, stops, height, Boolean(reducedMotion));
      shared.visible = visible && !document.hidden;
      if (route) {
        const headerBottom = document.querySelector(".site-header")?.getBoundingClientRect().bottom || 76;
        const stage = node.querySelector(".continuation-stage").getBoundingClientRect();
        const project = rectangle => viewportFrame(rectangle, y, stage);
        shared.scene = {
          from: project(route.from), to: project(route.to), progress: route.progress,
          act: route.act, phase: route.phase, points: shared.points, accent: shared.accent || "#d8ff4f",
          exclusions: [...exclusions.map(project),
            { left: -stage.left, top: -stage.top, width: window.innerWidth, height: headerBottom },
            { left: -stage.left, top: height - 84 - stage.top, width: window.innerWidth, height: 84 }],
        };
        const method = stops.find(stop => stop.act === "method");
        const contact = stops.find(stop => stop.act === "contact");
        shared.methodExit = method && !reducedMotion ? methodOutputProgress(y, method, height) : 0;
        shared.requestMethodFrame?.();
        node.dataset.continuationAct = route.act;
        node.style.setProperty("--contact-arrival", contact ? String(smoothRange(y + height * .72, contact.top, contact.top + Math.min(contact.height, height) * .5)) : "1");
      }
      shared.invalidate?.();
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(sync); };
    const refresh = () => { needsMeasure = true; schedule(); };
    const observer = new ResizeObserver(refresh);
    observer.observe(node);
    // Lazy opening content can move this entire owner without resizing it.
    if (node.parentElement) observer.observe(node.parentElement);
    const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; schedule(); }, { rootMargin: "100px" });
    intersection.observe(node);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", refresh, { passive: true });
    document.addEventListener("visibilitychange", schedule);
    document.fonts?.ready.then(() => { if (!disposed) refresh(); });
    schedule();
    return () => {
      disposed = true; observer.disconnect(); intersection.disconnect(); cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule); window.removeEventListener("resize", refresh);
      document.removeEventListener("visibilitychange", schedule); shared.visible = false;
    };
  }, [continuation, reducedMotion]);
  return <div ref={root} className="cinematic-continuation" data-continuation-act="method">
    <div className="continuation-stage" aria-hidden="true"><ContinuationSignal motion={continuation} /></div>
    <div className="continuation-content">{children}</div>
  </div>;
}
