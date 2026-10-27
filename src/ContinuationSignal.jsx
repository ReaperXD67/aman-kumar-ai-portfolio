import { useEffect, useRef } from "react";
import { createContinuationVolume } from "./continuation-geometry.js";

const ACTS = { method: 0, portrait: 1, record: 2, contact: 3 };
const FACETS = 84;
const clamp = value => Math.min(1, Math.max(0, value));
const ease = value => { const t = clamp(value); return t * t * t * (t * (t * 6 - 15) + 10); };
const mix = (from, to, t) => from + (to - from) * t;
const wrap = value => ((value % 1) + 1) % 1;

function validFrame(frame) {
  return frame && [frame.left, frame.top, frame.width, frame.height].every(Number.isFinite)
    && frame.width > 0 && frame.height > 0;
}

/** Retain the source point's nearest boundary, rather than inventing a cloud. */
function sourceArc(point, frame, fallback) {
  if (!point || !Number.isFinite(point.x) || !Number.isFinite(point.y)) return fallback;
  const x = clamp(point.x), y = clamp(point.y);
  const distances = [y * frame.height, (1 - x) * frame.width, (1 - y) * frame.height, x * frame.width];
  const edge = distances.indexOf(Math.min(...distances));
  const total = (frame.width + frame.height) * 2;
  if (edge === 0) return x * frame.width / total;
  if (edge === 1) return (frame.width + y * frame.height) / total;
  if (edge === 2) return (frame.width + frame.height + (1 - x) * frame.width) / total;
  return (frame.width * 2 + frame.height + (1 - y) * frame.height) / total;
}

function drawFrame(context, scene, points, width, height, reduced) {
  if (!validFrame(scene?.from) || !validFrame(scene?.to)) return;
  const t = reduced ? 1 : ease(Number.isFinite(scene.progress) ? scene.progress : 0);
  const frame = {
    left: mix(scene.from.left, scene.to.left, t), top: mix(scene.from.top, scene.to.top, t),
    width: mix(scene.from.width, scene.to.width, t), height: mix(scene.from.height, scene.to.height, t),
  };
  if (frame.left > width + 90 || frame.top > height + 90 || frame.left + frame.width < -90 || frame.top + frame.height < -90) return;
  const narrow = width < 700;
  // Semantic copy changes halfway through a passage; only the interval index
  // addresses geometry, so that label change cannot jump the carrier.
  const phase = Number.isFinite(scene.phase) ? Math.max(0, Math.min(3, Math.trunc(scene.phase))) : ACTS[scene.act] ?? 0;
  const coordinate = reduced ? Math.max(0, Math.min(4, scene.phase || 0)) : phase + t;
  const travel = coordinate / 4;
  const accent = /^#[\da-f]{3,8}$/i.test(scene.accent || "") ? scene.accent : "#d8ff4f";
  const perimeter = Math.max(1, (frame.width + frame.height) * 2);
  const volume = createContinuationVolume(frame, coordinate, width, reduced);
  const { rings, panels, segments } = volume;
  const trace = vertices => {
    vertices.forEach((point, index) => index ? context.lineTo(point.x, point.y) : context.moveTo(point.x, point.y));
  };
  const ringPoint = (ring, u) => {
    const address = wrap(u) * segments, index = Math.floor(address), amount = address - index;
    const from = ring.points[index], to = ring.points[index + 1];
    return { x: mix(from.x, to.x, amount), y: mix(from.y, to.y, amount) };
  };

  // The mesh has genuine z/perspective and torsion, but its aperture is empty.
  // This is a single hole, not an overlapping even-odd exclusion mask.
  context.save();
  context.beginPath(); context.rect(0, 0, width, height);
  context.rect(frame.left, frame.top, frame.width, frame.height);
  context.clip("evenodd");

  // Transparent folded membranes reveal the volume between the projected rails.
  // Batch material bands instead of issuing a fill for every individual facet.
  for (let band = 0; band < 4; band++) {
    context.beginPath();
    for (const panel of panels) {
      if (Math.min(3, Math.floor(panel.light * 4)) !== band) continue;
      trace(panel.points); context.closePath();
    }
    context.fillStyle = `rgba(169,197,181,${.018 + band * .014})`;
    context.fill();
  }
  context.beginPath();
  for (const panel of panels) if (panel.accent) { trace(panel.points); context.closePath(); }
  context.fillStyle = accent; context.globalAlpha = reduced ? .025 : .055; context.fill(); context.globalAlpha = 1;

  // Cool metal catches light differently across the near and far depth rails.
  const metal = context.createLinearGradient(frame.left, frame.top, frame.left + frame.width, frame.top + frame.height);
  metal.addColorStop(0, "rgba(209,225,219,.77)");
  metal.addColorStop(.22, "rgba(75,99,95,.48)");
  metal.addColorStop(.47, "rgba(226,237,231,.86)");
  metal.addColorStop(.62, "rgba(49,73,69,.35)");
  metal.addColorStop(1, "rgba(163,185,174,.62)");
  context.lineJoin = "bevel";
  context.lineCap = "butt";
  for (let lane = 0; lane < rings.length; lane++) {
    context.globalAlpha = lane === 0 || lane === rings.length - 1 ? .9 : .36 + lane / rings.length * .2;
    context.strokeStyle = lane === rings.length - 2 ? accent : metal;
    context.lineWidth = lane === 0 ? 1.5 : lane === rings.length - 1 ? 1.15 : .65;
    context.beginPath(); trace(rings[lane].points); context.stroke();
  }
  context.globalAlpha = 1;

  // These depth ribs change azimuth across the extrusion: the object folds,
  // rather than a set of two-dimensional outlines merely changing size.
  for (let rib = 0; rib < segments; rib += narrow ? 8 : 6) {
    context.beginPath(); trace(rings.map(ring => ring.points[rib]));
    context.strokeStyle = rib % 3 === 0 ? accent : "rgba(175,201,184,.48)";
    context.globalAlpha = rib % 3 === 0 ? .48 : .34;
    context.lineWidth = .8; context.stroke();
  }
  context.globalAlpha = 1;

  for (let index = 0; index < FACETS; index += 1) {
    const uniform = index / FACETS;
    const source = phase === 0
      ? sourceArc(points?.[index % Math.max(1, points?.length || 0)], scene.from, uniform)
      : uniform + .035 * phase;
    // Shortest-arc interpolation remains deterministic when scrolling backward.
    const target = uniform + .035 * (phase + 1);
    const delta = wrap(target - source + .5) - .5;
    const u = source + delta * t;
    const ring = rings[index % rings.length];
    const point = ringPoint(ring, u), next = ringPoint(ring, u + 2 / perimeter);
    const light = Math.max(0, 1 - Math.abs(wrap(u - travel * .88 + .5) - .5) * 18);
    context.strokeStyle = light > .12 ? accent : "rgba(192,211,200,.61)";
    context.globalAlpha = .27 + light * .65;
    context.lineWidth = light > .12 ? 1.8 : 1;
    context.beginPath();
    context.moveTo(point.x, point.y);
    context.lineTo(next.x, next.y);
    context.stroke();
  }
  context.globalAlpha = 1;

  // A finite scroll-addressed packet; it never autoplays or requests more frames.
  const packet = travel * .88;
  const packetRing = rings[Math.floor(rings.length * .55)], packetSpan = Math.min(.055, 46 / perimeter);
  context.strokeStyle = accent; context.lineWidth = 2;
  context.beginPath(); trace(Array.from({ length: 16 }, (_, index) => ringPoint(packetRing, packet + packetSpan * index / 15))); context.stroke();
  context.strokeStyle = "rgba(239,248,226,.96)"; context.lineWidth = 2.4;
  context.beginPath(); trace([ringPoint(packetRing, packet + packetSpan), ringPoint(packetRing, packet + packetSpan + Math.min(.008, 5 / perimeter))]); context.stroke();
  context.restore();

  // Clear each forbidden rectangle independently: overlaps remain excluded,
  // unlike an even-odd hole mask that can reveal their overlapping region.
  for (const rectangle of scene.exclusions || []) {
    if (!validFrame(rectangle)) continue;
    context.clearRect(rectangle.left - 8, rectangle.top - 8, rectangle.width + 16, rectangle.height + 16);
  }
}

/** Background artifact handoff. The owner supplies every scroll-addressed pose. */
export function ContinuationSignal({ motion }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current, context = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !context || !motion?.current) return undefined;
    let request = 0, disposed = false, width = 1, height = 1, ratio = 1;
    const clear = () => context.clearRect(0, 0, width, height);
    const draw = () => {
      request = 0;
      if (disposed) return;
      clear();
      const current = motion.current;
      if (!current.visible || document.hidden) return;
      canvas.dataset.continuationAct = current.scene?.act || "method";
      canvas.dataset.continuationAccent = current.scene?.accent || current.accent || "#d8ff4f";
      canvas.dataset.continuationGeometry = current.reduced ? "settled-aperture" : "perspective-torsion-volume";
      canvas.dataset.continuationPhase = String(current.scene?.phase || 0);
      drawFrame(context, current.scene, current.scene?.points || current.points, width, height, current.reduced);
    };
    const invalidate = () => {
      if (disposed) return;
      if (!motion.current.visible || document.hidden) { cancelAnimationFrame(request); request = 0; clear(); return; }
      if (!request) request = requestAnimationFrame(draw);
    };
    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      width = Math.max(1, bounds.width); height = Math.max(1, bounds.height);
      ratio = Math.min(window.devicePixelRatio || 1, 1.35, Math.sqrt(1_500_000 / (width * height)));
      canvas.width = Math.max(1, Math.floor(width * ratio));
      canvas.height = Math.max(1, Math.floor(height * ratio));
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      invalidate();
    };
    motion.current.invalidate = invalidate;
    const observer = typeof ResizeObserver === "function" ? new ResizeObserver(resize) : null;
    observer?.observe(canvas);
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", invalidate);
    resize();
    return () => {
      disposed = true; cancelAnimationFrame(request); observer?.disconnect();
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", invalidate);
      if (motion.current.invalidate === invalidate) motion.current.invalidate = null;
      clear();
    };
  }, [motion]);
  return <canvas className="continuation-signal-canvas" ref={canvasRef} aria-hidden="true" />;
}
