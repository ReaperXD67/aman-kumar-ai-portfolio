import { clamp01 } from "./cinematic-motion.js";

const center = frame => frame.top + frame.height / 2;

/** One monotone clock for the whole film. Interior knots retain camera velocity;
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

/** A continuous composition hint from actual negative space, not a fitted box.
 * Soft coverage weights prevent snapping between competing empty regions.
 * The centroid may lie within content, so the renderer MUST still clip every
 * exclusion. Availability is metadata, never permission to cover text. */
export function safeFilmFocus(viewport, exclusions, padding = 8) {
  const width = Math.max(1, viewport.width), height = Math.max(1, viewport.height);
  const holes = exclusions.flatMap(rectangle => {
    if (![rectangle?.left, rectangle?.top, rectangle?.width, rectangle?.height].every(Number.isFinite)
      || rectangle.width <= 0 || rectangle.height <= 0) return [];
    const left = Math.max(0, rectangle.left - padding), top = Math.max(0, rectangle.top - padding);
    const right = Math.min(width, rectangle.left + rectangle.width + padding);
    const bottom = Math.min(height, rectangle.top + rectangle.height + padding);
    return right > left && bottom > top ? [{ left, top, right, bottom }] : [];
  });
  let total = 0, sumX = 0, sumY = 0, clearance = 0;
  const columns = 17, rows = 13, feather = 32;
  for (let row = 0; row < rows; row++) for (let column = 0; column < columns; column++) {
    const x = (column + .5) / columns * width, y = (row + .5) / rows * height;
    let distance = Math.min(x, width - x, y, height - y);
    for (const hole of holes) {
      const dx = Math.max(hole.left - x, x - hole.right, 0);
      const dy = Math.max(hole.top - y, y - hole.bottom, 0);
      distance = Math.min(distance, Math.hypot(dx, dy));
    }
    clearance = Math.max(clearance, distance);
    const t = clamp01(distance / feather), weight = t * t * (3 - 2 * t);
    total += weight; sumX += x / width * weight; sumY += y / height * weight;
  }
  const support = total / (columns * rows);
  // Blend toward a fixed composition as space disappears, so an empty field
  // never creates an unstable division or a last-pixel camera relocation.
  const influence = Math.min(1, support * 3);
  return { x: .5 + (total ? sumX / total - .5 : 0) * influence,
    y: .5 + (total ? sumY / total - .5 : 0) * influence,
    clearance, available: clearance >= 48, support };
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
 * so the film cannot paint into the preceding content or following footer. */
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
