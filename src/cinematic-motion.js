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

/** Disjoint viewport rectangles where narrative plates occlude a capture.
 * A union is necessary: overlapping even-odd holes would otherwise refill.
 */
export function captureExclusions(frame, protectedFrames, padding = 12) {
  if (![frame?.left, frame?.top, frame?.width, frame?.height].every(Number.isFinite) || frame.width <= 0 || frame.height <= 0) return [];
  const holes = protectedFrames.flatMap(box => {
    if (![box?.left, box?.top, box?.width, box?.height].every(Number.isFinite) || box.width <= 0 || box.height <= 0) return [];
    const left = Math.max(frame.left, box.left - padding), top = Math.max(frame.top, box.top - padding);
    const right = Math.min(frame.left + frame.width, box.left + box.width + padding), bottom = Math.min(frame.top + frame.height, box.top + box.height + padding);
    return right > left && bottom > top ? [{ left, top, right, bottom }] : [];
  });
  const xs = [...new Set(holes.flatMap(box => [box.left, box.right]))].sort((a, b) => a - b);
  const result = [];
  for (let index = 0; index < xs.length - 1; index++) {
    const left = xs[index], right = xs[index + 1], midpoint = (left + right) / 2;
    const intervals = holes.filter(box => midpoint > box.left && midpoint < box.right).map(box => [box.top, box.bottom]).sort((a, b) => a[0] - b[0]);
    const merged = [];
    intervals.forEach(([top, bottom]) => {
      const previous = merged[merged.length - 1];
      if (previous && top <= previous[1]) previous[1] = Math.max(previous[1], bottom);
      else merged.push([top, bottom]);
    });
    merged.forEach(([top, bottom]) => result.push({ left, top, width: right - left, height: bottom - top }));
  }
  return result;
}

/** Convert viewport exclusions to the unscaled element's local clip space. */
export function captureClipPath(frame, protectedFrames, baseWidth, baseHeight) {
  const exclusions = captureExclusions(frame, protectedFrames);
  if (!exclusions.length || !(baseWidth > 0 && baseHeight > 0)) return "none";
  const n = value => Number(value.toFixed(3));
  const rectangle = (left, top, width, height) => `M${n(left)} ${n(top)}H${n(left + width)}V${n(top + height)}H${n(left)}Z`;
  const path = rectangle(0, 0, baseWidth, baseHeight) + exclusions.map(box => rectangle((box.left - frame.left) / frame.width * baseWidth, (box.top - frame.top) / frame.height * baseHeight, box.width / frame.width * baseWidth, box.height / frame.height * baseHeight)).join("");
  return `path(evenodd, "${path}")`;
}
