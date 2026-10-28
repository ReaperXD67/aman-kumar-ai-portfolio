import { useEffect, useRef } from "react";
import { ContinuationSignal } from "./ContinuationSignal.jsx";
import { useReducedMotion } from "./useMotionPreference.js";
import { documentFrame, methodOutputProgress, ownerClipExclusions, readContinuation, viewportFrame } from "./continuation-motion.js";
import { smoothRange } from "./cinematic-motion.js";
import "./cinematic-continuation.css";

const STOPS = [
  [".method-visual", "method"],
  [".identity-kernel-frame", "portrait"],
  [".career-console", "record"],
  [".resume-artifact .artifact-preview", "record"],
  [".contact-form", "contact"],
];
const PROTECTED = ".signal-band,.method-heading,.method-visual,.method-readout,.method-stage-rail,.identity-kernel-frame,.identity-copy,.career-heading,.career-console,.education-signal,.proof-vault-heading,.artifact-preview,.artifact-copy,.contact-intro,.contact-form";

/** Native content supplies a reading clock and occlusion, never sculpture shape. */
export function CinematicContinuation({ children, continuation, paused = false }) {
  const root = useRef(null);
  const reducedMotion = useReducedMotion();
  useEffect(() => {
    continuation.current.paused = paused;
    continuation.current.invalidate?.();
  }, [continuation, paused]);
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
      localExclusions = [...node.querySelectorAll(PROTECTED)].map(box);
      needsMeasure = false;
    };
    const sync = (notify = true) => {
      cancelAnimationFrame(frame);
      frame = 0;
      if (disposed) return;
      if (needsMeasure) measure();
      const y = window.scrollY, height = window.innerHeight;
      shared.scrollY = y;
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
        // Measure the real tray, including its safe-area padding and landscape
        // height. A fixed reserve can be shorter than a phone's bottom inset.
        const docks = [...document.querySelectorAll(".signal-mobile-dock,.signal-dock")]
          .map(element => element.getBoundingClientRect())
          .filter(rectangle => rectangle.width > 0 && rectangle.height > 0)
          .map(rectangle => ({ left: rectangle.left - stage.left, top: rectangle.top - stage.top, width: rectangle.width, height: rectangle.height }));
        const viewport = { width: Math.max(1, stage.width), height: Math.max(1, stage.height) };
        const hardExclusions = [
          { left: -stage.left, top: -stage.top, width: window.innerWidth, height: headerBottom },
          ...docks, ...ownerClipExclusions(rootBox, stage)];
        // Face, copy and evidence dim the current before it reaches them.
        // Only the owner's limits and fixed UI require a hard clip.
        const protectedFrames = exclusions.map(project).filter(rectangle => rectangle.top < viewport.height + 100
          && rectangle.top + rectangle.height > -100);
        shared.scene = {
          from: project(route.from), to: project(route.to), progress: route.progress,
          coordinate: route.coordinate, viewport,
          act: route.act, phase: route.phase, points: shared.points, accent: shared.accent || "#d8ff4f",
          exclusions: protectedFrames, hardExclusions,
        };
        const method = stops.find(stop => stop.act === "method");
        const contact = stops.find(stop => stop.act === "contact");
        shared.methodExit = method && !reducedMotion ? methodOutputProgress(y, method, height) : 0;
        shared.requestMethodFrame?.();
        node.dataset.continuationAct = route.act;
        node.dataset.continuationCoordinate = route.coordinate.toFixed(4);
        node.style.setProperty("--contact-arrival", contact ? String(smoothRange(y + height * .72, contact.top, contact.top + Math.min(contact.height, height) * .5)) : "1");
      }
      if (notify) shared.invalidate?.();
    };
    // A live GPU frame can precede the scheduled scroll callback. Let it refresh
    // protection first, without scheduling a second renderer or damping masks.
    const refreshScene = () => sync(false);
    shared.refreshScene = refreshScene;
    const schedule = () => { if (!frame) frame = requestAnimationFrame(() => sync()); };
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
      if (shared.refreshScene === refreshScene) shared.refreshScene = null;
    };
  }, [continuation, reducedMotion]);
  return <div ref={root} className="cinematic-continuation" data-continuation-act="method">
    <div className="continuation-stage" aria-hidden="true"><ContinuationSignal motion={continuation} /></div>
    <div className="continuation-content">{children}</div>
  </div>;
}
