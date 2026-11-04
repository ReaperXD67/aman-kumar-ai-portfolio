import { smoothRange } from "./cinematic-motion.js";

const finite = value => Number.isFinite(value);
const clamp01 = value => Math.max(0, Math.min(1, finite(value) ? value : 0));

/** Reversible native-scroll phases measured from the stage reaching the upper
 * reading line, independently of the photo's viewport-dependent depth clock.
 * AMAN releases first; KUMAR follows while its lower row is still in view.
 * Reduced motion keeps both native names whole. */
export function portraitNameDissolve(progress, reduced = false) {
  if (reduced) return { first: 0, last: 0 };
  const value = clamp01(progress);
  return { first: clamp01(smoothRange(value, .04, .40)), last: clamp01(smoothRange(value, .18, .62)) };
}

/** One glyph grain's release clock, mirrored in the vertex shader. The sweep
 * crosses 60% of the clock; a 4% lead and 2.5% grain stagger leave 33.5% for
 * travel after the last glyph starts. No time/history term means reversal is exact. */
export function sharedNameRelease(phase, u, noise = 0) {
  const threshold = .04 + .60 * clamp01(u) + .025 * clamp01(noise);
  return clamp01((clamp01(phase) - threshold) / .335);
}

/** Project a glyph UV through CSS translate3d(...) rotateY(...) with a centered
 * transform-origin and the rear layer's perspective-origin in viewport pixels.
 * UVs may extend beyond [0,1] because glyph ink can overscan its CSS line box. */
export function projectNamePoint(uv, frame, origin, pose, perspective = 1200) {
  if (![uv?.u, uv?.v, frame?.left, frame?.top, frame?.width, frame?.height,
    origin?.x, origin?.y, pose?.x, pose?.y, pose?.z, pose?.angle, perspective].every(finite)
    || frame.width <= 0 || frame.height <= 0 || perspective <= 0) return null;
  const radians = pose.angle * Math.PI / 180;
  const localX = (uv.u - .5) * frame.width;
  const localY = (uv.v - .5) * frame.height;
  const x = frame.left + frame.width / 2 + pose.x + Math.cos(radians) * localX;
  const y = frame.top + frame.height / 2 + pose.y + localY;
  const z = pose.z - Math.sin(radians) * localX;
  const denominator = perspective - z;
  if (denominator <= .000001) return null;
  const scale = perspective / denominator;
  return { x: origin.x + (x - origin.x) * scale,
    y: origin.y + (y - origin.y) * scale, z, scale };
}

/** Sample once into a static BufferAttribute. Both rows get equal representation
 * and deterministic glyph coverage without adding geometry or per-frame pixels.
 * Missing rows use the available row; no samples use row=-1 to disable release. */
export function createNameOrigins(seeds, samples) {
  const count = seeds && Number.isFinite(seeds.length) ? Math.max(0, Math.floor(seeds.length / 4)) : 0;
  const origins = new Float32Array(count * 3);
  const rows = [0, 1].map(row => Array.isArray(samples?.[row])
    ? samples[row].filter(point => finite(point?.u) && finite(point?.v)) : []);
  for (let index = 0; index < count; index++) {
    let row = index % 2;
    if (!rows[row].length) row = 1 - row;
    if (!rows[row].length) { origins[index * 3 + 2] = -1; continue; }
    const sample = rows[row][Math.min(rows[row].length - 1, Math.floor(clamp01(seeds[index * 4]) * rows[row].length))];
    origins[index * 3] = sample.u;
    origins[index * 3 + 1] = sample.v;
    origins[index * 3 + 2] = row;
  }
  return origins;
}
