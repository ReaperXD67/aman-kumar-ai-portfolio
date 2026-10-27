export const clamp01 = value => Math.max(0, Math.min(1, value));
export function smoothRange(value, start = 0, end = 1) {
  const t = clamp01((value - start) / Math.max(.0001, end - start));
  return t * t * t * (t * (t * 6 - 15) + 10);
}

/** Distances are document pixels; resize changes the measures, never the route. */
export function readStory(distance, measures) {
  const hero = clamp01(distance / Math.max(1, measures.heroEnd));
  const flight = clamp01((distance - measures.heroEnd) / Math.max(1, measures.flightEnd - measures.heroEnd));
  const arrival = clamp01((distance - measures.flightEnd) / Math.max(1, measures.arrivalEnd - measures.flightEnd));
  return { hero, passage: smoothRange(hero, .12, 1), flight, arrival };
}

/** CSS object-fit:contain; object-position:top center, matching the real lens. */
export function containFrame(box, naturalWidth, naturalHeight) {
  const scale = Math.min(box.width / Math.max(1, naturalWidth), box.height / Math.max(1, naturalHeight));
  const width = naturalWidth * scale, height = naturalHeight * scale;
  return { left: box.left + (box.width - width) / 2, top: box.top, width, height };
}

export function mixFrame(from, to, progress) {
  const t = smoothRange(progress);
  return Object.fromEntries(["left", "top", "width", "height"].map(key => [key, from[key] + (to[key] - from[key]) * t]));
}
