import { clamp01 } from "./cinematic-motion.js";

const center = frame => frame.top + frame.height / 2;

/** One monotone clock for the whole ending. Interior knots retain camera velocity;
 * easing each interval independently would visibly brake at every artifact. */
export function continuationCoordinate(focus, stops) {
  if (stops.length < 2) return 0;
  const knots = stops.map(center);
  if (focus <= knots[0]) return 0;
  if (focus >= knots.at(-1)) return stops.length - 1;
  let index = 0;
  while (index < knots.length - 2 && focus > knots[index + 1]) index++;
  const distance = Math.max(1, knots[index + 1] - knots[index]);
  const previous = Math.max(1, knots[index] - knots[Math.max(0, index - 1)]);
  const following = Math.max(1, knots[Math.min(knots.length - 1, index + 2)] - knots[index + 1]);
  const startSlope = index === 0 ? 0 : 2 / (previous + distance);
  const endSlope = index === knots.length - 2 ? 0 : 2 / (distance + following);
  const t = clamp01((focus - knots[index]) / distance), t2 = t * t, t3 = t2 * t;
  return index + (t3 - 2 * t2 + t) * distance * startSlope
    + (-2 * t3 + 3 * t2) + (t3 - t2) * distance * endSlope;
}

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
    const phase = progress < .5 ? index : Math.min(index + 1, stops.length - 1);
    return { from: nearest, to: nearest, progress: 1, act: nearest.act, phase, coordinate: phase };
  }
  return { from, to, progress, act: progress < .5 ? from.act : to.act, phase: index,
    coordinate: continuationCoordinate(focus, stops) };
}

export function viewportFrame(frame, scrollY, origin = { left: 0, top: 0 }) {
  return { left: frame.left - origin.left, top: frame.top - scrollY - origin.top, width: frame.width, height: frame.height };
}

/** Local artifact offsets survive a late-loading section above their owner. */
export function documentFrame(frame, origin) {
  return { ...frame, left: frame.left + origin.left, top: frame.top + origin.top };
}

/** A sticky stage can outlive its owner because of its negative margin.
 * Exclude the complement of the owner's visible intersection in stage pixels,
 * so the current cannot paint into the preceding content or following footer. */
export function ownerClipExclusions(owner, stage) {
  const width = Math.max(1, stage.width), height = Math.max(1, stage.height);
  if (![owner?.left, owner?.top, owner?.width, owner?.height].every(Number.isFinite)
    || owner.width <= 0 || owner.height <= 0) return [{ left: 0, top: 0, width, height }];
  const left = Math.max(0, Math.min(width, owner.left - stage.left));
  const right = Math.max(0, Math.min(width, owner.left + owner.width - stage.left));
  const top = Math.max(0, Math.min(height, owner.top - stage.top));
  const bottom = Math.max(0, Math.min(height, owner.top + owner.height - stage.top));
  if (right <= left || bottom <= top) return [{ left: 0, top: 0, width, height }];
  return [
    { left: 0, top: 0, width, height: top },
    { left: 0, top: bottom, width, height: height - bottom },
    { left: 0, top, width: left, height: bottom - top },
    { left: right, top, width: width - right, height: bottom - top },
  ].filter(rectangle => rectangle.width > 0 && rectangle.height > 0);
}

/** The field becomes an output frame only as its lower part leaves the view. */
export function methodOutputProgress(scrollY, frame, height) {
  const start = frame.top + frame.height - height * .58;
  const end = frame.top + frame.height - height * .12;
  return clamp01((scrollY - start) / Math.max(1, end - start));
}
