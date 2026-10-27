import { clamp01 } from "./cinematic-motion.js";

const center = frame => frame.top + frame.height / 2;

/** Addressable geometry, shared by the native-scroll director and its checks. */
export function readContinuation(scrollY, stops, height, reduced = false) {
  if (!stops.length) return null;
  const focus = scrollY + height * .52;
  let index = 0;
  while (index < stops.length - 2 && focus > center(stops[index + 1])) index++;
  const from = stops[index], to = stops[Math.min(index + 1, stops.length - 1)];
  const progress = clamp01((focus - center(from)) / Math.max(1, center(to) - center(from)));
  if (reduced) {
    const nearest = progress < .5 ? from : to;
    return { from: nearest, to: nearest, progress: 1, act: nearest.act, phase: progress < .5 ? index : Math.min(index + 1, stops.length - 1) };
  }
  return { from, to, progress, act: progress < .5 ? from.act : to.act, phase: index };
}

export function viewportFrame(frame, scrollY, origin = { left: 0, top: 0 }) {
  return { left: frame.left - origin.left, top: frame.top - scrollY - origin.top, width: frame.width, height: frame.height };
}

/** The field becomes an output frame only as its lower part leaves the view. */
export function methodOutputProgress(scrollY, frame, height) {
  const start = frame.top + frame.height - height * .58;
  const end = frame.top + frame.height - height * .12;
  return clamp01((scrollY - start) / Math.max(1, end - start));
}
