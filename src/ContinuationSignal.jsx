import { useEffect, useRef } from "react";

const TAU = Math.PI * 2;
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

/** A closed, chamfered contour entirely outside the native artifact rectangle. */
function contour(frame, distance, padding, output) {
  const left = frame.left - padding, top = frame.top - padding;
  const width = frame.width + padding * 2, height = frame.height + padding * 2;
  // A larger bevel could cut through the native rectangle at its corners.
  const bevel = Math.min(padding * 1.3, 18, width * .12, height * .12);
  const horizontal = Math.max(0, width - bevel * 2);
  const vertical = Math.max(0, height - bevel * 2);
  const diagonal = bevel * Math.SQRT2;
  let arc = wrap(distance) * (horizontal * 2 + vertical * 2 + diagonal * 4);
  let x, y, dx, dy, length;
  for (let side = 0; side < 8; side += 1) {
    length = side % 2 ? diagonal : side % 4 === 0 ? horizontal : vertical;
    if (arc <= length || side === 7) {
      const t = length ? clamp(arc / length) : 0;
      if (side === 0) { x = left + bevel + horizontal * t; y = top; dx = 1; dy = 0; }
      else if (side === 1) { x = left + width - bevel + bevel * t; y = top + bevel * t; dx = Math.SQRT1_2; dy = Math.SQRT1_2; }
      else if (side === 2) { x = left + width; y = top + bevel + vertical * t; dx = 0; dy = 1; }
      else if (side === 3) { x = left + width - bevel * t; y = top + height - bevel + bevel * t; dx = -Math.SQRT1_2; dy = Math.SQRT1_2; }
      else if (side === 4) { x = left + width - bevel - horizontal * t; y = top + height; dx = -1; dy = 0; }
      else if (side === 5) { x = left + bevel - bevel * t; y = top + height - bevel * t; dx = -Math.SQRT1_2; dy = -Math.SQRT1_2; }
      else if (side === 6) { x = left; y = top + height - bevel - vertical * t; dx = 0; dy = -1; }
      else { x = left + bevel * t; y = top + bevel - bevel * t; dx = Math.SQRT1_2; dy = -Math.SQRT1_2; }
      output.x = x; output.y = y; output.dx = dx; output.dy = dy;
      return output;
    }
    arc -= length;
  }
  return output;
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

function traceContour(context, frame, padding, wave, phase, scratch, start = 0, span = 1, steps = 144) {
  context.beginPath();
  for (let step = 0; step <= steps; step += 1) {
    const u = start + span * step / steps;
    const offset = padding + Math.sin(u * TAU * 3 + phase) * wave;
    contour(frame, u, offset, scratch);
    if (step) context.lineTo(scratch.x, scratch.y);
    else context.moveTo(scratch.x, scratch.y);
  }
  context.stroke();
}

function drawFrame(context, scene, points, width, height, reduced) {
  if (!validFrame(scene?.from) || !validFrame(scene?.to)) return;
  const t = reduced ? 1 : ease(Number.isFinite(scene.progress) ? scene.progress : 0);
  const frame = {
    left: mix(scene.from.left, scene.to.left, t), top: mix(scene.from.top, scene.to.top, t),
    width: mix(scene.from.width, scene.to.width, t), height: mix(scene.from.height, scene.to.height, t),
  };
  if (frame.left > width + 24 || frame.top > height + 24 || frame.left + frame.width < -24 || frame.top + frame.height < -24) return;
  const narrow = width < 700, lanes = narrow ? 4 : 8;
  // Semantic copy changes halfway through a passage; only the interval index
  // addresses geometry, so that label change cannot jump the carrier.
  const phase = Number.isFinite(scene.phase) ? Math.max(0, Math.min(3, Math.trunc(scene.phase))) : ACTS[scene.act] ?? 0;
  const travel = (phase + t) / 4;
  const accent = /^#[\da-f]{3,8}$/i.test(scene.accent || "") ? scene.accent : "#d8ff4f";
  const scratch = { x: 0, y: 0, dx: 0, dy: 0 };
  const fold = reduced ? 0 : Math.sin(t * Math.PI);
  const perimeter = Math.max(1, (frame.width + frame.height) * 2);

  // Machined edge, with a shallow reflective return. No fill covers the image.
  const metal = context.createLinearGradient(frame.left, frame.top, frame.left + frame.width, frame.top + frame.height);
  metal.addColorStop(0, "rgba(209,225,219,.77)");
  metal.addColorStop(.22, "rgba(75,99,95,.48)");
  metal.addColorStop(.47, "rgba(226,237,231,.86)");
  metal.addColorStop(.62, "rgba(49,73,69,.35)");
  metal.addColorStop(1, "rgba(163,185,174,.62)");
  context.lineJoin = "bevel";
  context.lineCap = "butt";
  context.strokeStyle = metal; context.lineWidth = 1.4;
  traceContour(context, frame, 3.5, 0, 0, scratch);
  context.strokeStyle = "rgba(110,143,131,.28)"; context.lineWidth = .7;
  traceContour(context, frame, 5.5, 0, 0, scratch);

  // A woven return changes torsion with scroll, confined to an 18px edge band.
  for (let lane = 0; lane < lanes; lane += 1) {
    const padding = 7 + lane * (narrow ? 2.1 : 1.25);
    context.globalAlpha = .26 + .2 * (lane % 3 === 0);
    context.strokeStyle = lane % 3 === 0 ? accent : metal;
    context.lineWidth = lane % 3 === 0 ? .8 : .6;
    traceContour(context, frame, padding, fold * (narrow ? .65 : 1.3), travel * TAU * 1.8 + lane * .8, scratch);
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
    const padding = 6.2 + (index % lanes) * (narrow ? 2.1 : 1.25);
    contour(frame, u, padding, scratch);
    const light = Math.max(0, 1 - Math.abs(wrap(u - travel * .88 + .5) - .5) * 18);
    context.strokeStyle = light > .12 ? accent : "rgba(192,211,200,.61)";
    context.globalAlpha = .27 + light * .65;
    context.lineWidth = light > .12 ? 1.8 : 1;
    context.beginPath();
    const length = 1.2 + light * 3;
    context.moveTo(scratch.x - scratch.dx * length, scratch.y - scratch.dy * length);
    context.lineTo(scratch.x + scratch.dx * length, scratch.y + scratch.dy * length);
    context.stroke();
  }
  context.globalAlpha = 1;

  // A finite scroll-addressed packet; it never autoplays or requests more frames.
  const packet = travel * .88;
  context.strokeStyle = accent; context.lineWidth = 2;
  traceContour(context, frame, 3.5, 0, 0, scratch, packet, Math.min(.055, 46 / perimeter), 15);
  context.strokeStyle = "rgba(239,248,226,.96)"; context.lineWidth = 2.4;
  traceContour(context, frame, 3.5, 0, 0, scratch, packet + Math.min(.055, 46 / perimeter), Math.min(.008, 5 / perimeter), 3);

  // Eight precision corner witnesses are part of the same outside edge band.
  for (let corner = 0; corner < 4; corner += 1) {
    const right = corner % 2, bottom = corner > 1;
    const x = frame.left + (right ? frame.width + 19 : -19);
    const y = frame.top + (bottom ? frame.height + 19 : -19);
    const dx = right ? -1 : 1, dy = bottom ? -1 : 1;
    context.strokeStyle = "rgba(146,174,160,.58)";
    context.lineWidth = 1;
    context.beginPath(); context.moveTo(x + dx * 12, y); context.lineTo(x, y); context.lineTo(x, y + dy * 12); context.stroke();
    const witness = clamp(1 - Math.abs(corner - phase - t));
    if (witness) {
      context.globalAlpha = witness;
      context.strokeStyle = accent; context.stroke();
      context.globalAlpha = 1;
    }
  }

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
