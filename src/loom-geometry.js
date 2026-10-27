/** Shared physical contract between the hero sculpture and the descent tunnel. */
export const LOOM_ENTRY = Object.freeze({
  length: 9.2, height: 2.6, depth: 3.6, railY: 2.07, railZ: 3.35,
  x: 0, y: 0, z: 6, rotationY: Math.PI / 2, hideAfterFlight: 0.2,
});

export const clamp01 = value => Math.min(1, Math.max(0, value));
const smooth = value => { const t = clamp01(value); return t * t * (3 - 2 * t); };
const mix = (a, b, t) => a + (b - a) * t;

/** C1 mode interpolation: the intermediate reasoning form has no velocity kink. */
export function loomModeWeights(mode) {
  const observe = 1 - smooth(mode);
  const execute = smooth(mode - 1);
  return [observe, 1 - observe - execute, execute];
}

/** No per-frame vertex arrays: nine shared rigid sections follow one elastic wave. */
export function sampleLoomFrame(t, mode, time, morph, passage, intro = 1, result = {}) {
  const observe = 1 - smooth(mode), execute = smooth(mode - 1), reason = 1 - observe - execute;
  const p = clamp01(passage), remaining = 1 - p;
  const taper = Math.pow(Math.max(0, 1 - t), 1.1);
  const sweep = Math.sin(t * Math.PI);
  const phase = t * 4.2 - time * 0.62;
  const elastic = Math.sin(phase) * sweep * (0.03 + 0.12 * morph) * remaining;
  const height = (observe * (2.95 + sweep * 0.25) + reason * 2.4 + execute * (0.65 + taper * 2.7)) * (1 + elastic);
  const depth = (observe * 1.05 + reason * 2.02 + execute * (0.48 + taper)) * (1 - elastic * 0.6);
  result.x = (t - 0.5) * LOOM_ENTRY.length * (1 + (1 - intro) * 0.35 * remaining);
  result.y = Math.sin(phase * 0.75) * sweep * (0.065 + morph * 0.12) * remaining;
  result.z = Math.cos(phase * 0.8) * sweep * (0.04 + morph * 0.09) * remaining;
  result.height = mix(height * (1 + (1 - intro) * 0.25 * remaining), LOOM_ENTRY.height, p);
  result.depth = mix(depth, LOOM_ENTRY.depth, p);
  result.rotationX = (reason * Math.sin(t * 4 + time * 0.28) * 0.16 + elastic * 0.8) * remaining;
  result.rotationY = Math.sin(phase) * 0.045 * morph * remaining;
  return result;
}

/** Final longitudinal rails fit inside the actual bevelled aperture's open area. */
export function sampleLoomRail(t, lane) {
  const angle = lane * Math.PI;
  return [(t - 0.5) * LOOM_ENTRY.length, Math.sin(angle) * LOOM_ENTRY.railY, Math.cos(angle) * LOOM_ENTRY.railZ];
}
