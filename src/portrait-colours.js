const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const unit = value => Number.isFinite(value) ? clamp(value, 0, 1) : .5;
export const portraitContourRows = 32;
const validPixels = (pixels, width, height) => Number.isInteger(width) && Number.isInteger(height) && width > 0 && height > 0
  && pixels?.length >= width * height * 4;

const sampleLine = (values, v) => {
  const y = unit(v) * (values.length - 1), low = Math.floor(y), high = Math.min(low + 1, values.length - 1);
  return values[low] + (values[high] - values[low]) * (y - low);
};

/** Derive the actual right silhouette from a cached alpha read. Missing rows
 * inherit the nearest occupied row, while an empty/opaque image stays in the
 * original rectangular fallback. The source photograph is never modified. */
export function createPortraitContour(pixels, width, height) {
  const fallback = { enabled: false, right: new Float32Array(portraitContourRows).fill(1), edges: null, colourEdges: null, coverage: null };
  if (!validPixels(pixels, width, height)) return fallback;
  let transparent = 0, occupied = 0, solid = 0;
  const edges = new Float32Array(height).fill(-1), colourEdges = new Float32Array(height).fill(-1);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const alpha = pixels[(y * width + x) * 4 + 3];
      if (alpha < 8) transparent++;
      if (alpha >= 48) { edges[y] = (x + 1) / width; occupied++; }
      if (alpha >= 192) { colourEdges[y] = x / Math.max(width - 1, 1); solid++; }
    }
  }
  if (transparent < width * height * .01 || occupied < width * height * .01 || solid < width * height * .01) return fallback;
  const repair = line => {
    const original = line.slice();
    for (let y = 0; y < height; y++) {
      if (line[y] >= 0) continue;
      for (let distance = 1; distance < height; distance++) {
        const above = y - distance, below = y + distance;
        if (above >= 0 && original[above] >= 0) { line[y] = original[above]; break; }
        if (below < height && original[below] >= 0) { line[y] = original[below]; break; }
      }
      if (line[y] < 0) line[y] = edges[y] >= 0 ? edges[y] : 1;
    }
  };
  repair(edges); repair(colourEdges);
  const right = new Float32Array(portraitContourRows);
  for (let row = 0; row < right.length; row++) right[row] = sampleLine(edges, row / (right.length - 1));
  return { enabled: true, right, edges, colourEdges, coverage: occupied / (width * height) };
}

/** Static per-particle UVs register to the silhouette, not the asset rectangle. */
export function createPortraitBirths(seeds, contour) {
  const count = Math.floor((seeds?.length || 0) / 4), births = new Float32Array(count * 2);
  for (let index = 0; index < count; index++) {
    const [, v] = portraitSeedUV(...seeds.subarray(index * 4, index * 4 + 4));
    births.set([contour?.enabled ? sampleLine(contour.edges, v) : 1, v], index * 2);
  }
  return births;
}

/** The same cover crop as the native photograph (object-position: 50% 32%). */
export function portraitCoverCrop(naturalWidth, naturalHeight, width, height) {
  if (![naturalWidth, naturalHeight, width, height].every(value => Number.isFinite(value) && value > 0)) return null;
  const scale = Math.max(width / naturalWidth, height / naturalHeight);
  const sw = width / scale, sh = height / scale;
  return [(naturalWidth - sw) * .5, (naturalHeight - sh) * .32, sw, sh];
}

/** Stable birth colour coordinates match the shader's continuous peel roots. */
export function portraitSeedUV(seedX, seedY, seedDepth, seedRole) {
  const v = seedX === 0 && seedRole < .5 ? .69 : .7 + (unit(seedY) * 2 - 1) * .18;
  return [.88 + unit(seedDepth) * .115, v];
}

/** One small image read feeds a static colour attribute, never a per-frame read.
 * Samples stay in sRGB, matching this custom shader's direct sRGB output.
 * Exposure lifts dark grain uniformly, preserving its channel ratios. */
export function createPortraitColours(seeds, pixels, width, height, contour = null) {
  const count = Math.floor((seeds?.length || 0) / 4);
  const colours = new Float32Array(count * 3);
  const valid = validPixels(pixels, width, height);
  for (let index = 0; index < count; index++) {
    let r = .82, g = .67, b = .37;
    if (valid) {
      let [u, v] = portraitSeedUV(...seeds.subarray(index * 4, index * 4 + 4));
      if (contour?.enabled) {
        // Sample inside solid alpha so transparent RGB and edge matting cannot
        // replace the actual skin/kurta colour with black or background grey.
        u = clamp(sampleLine(contour.colourEdges, v) - (1 + unit(seeds[index * 4 + 2]) * 2) / Math.max(width - 1, 1), 0, 1);
      }
      const x = u * (width - 1), y = v * (height - 1);
      const x0 = Math.floor(x), y0 = Math.floor(y), x1 = Math.min(x0 + 1, width - 1), y1 = Math.min(y0 + 1, height - 1);
      const tx = x - x0, ty = y - y0;
      const taps = [[x0,y0,(1-tx)*(1-ty)], [x1,y0,tx*(1-ty)], [x0,y1,(1-tx)*ty], [x1,y1,tx*ty]];
      const alphaWeight = taps.reduce((sum, [sx,sy,weight]) => sum + pixels[(sy * width + sx) * 4 + 3] / 255 * weight, 0);
      const sample = channel => {
        const colour = taps.reduce((sum, [sx,sy,weight]) => {
          const offset = (sy * width + sx) * 4;
          return sum + pixels[offset + channel] / 255 * pixels[offset + 3] / 255 * weight;
        }, 0);
        return clamp(colour / Math.max(alphaWeight, .001), 0, 1);
      };
      r = sample(0); g = sample(1); b = sample(2);
      // The native photo is deliberately low key. Grain needs a higher exposure
      // on the black stage, not a different tint or additive white bloom. A
      // single bounded gain preserves every nonzero channel ratio and leaves
      // already-bright kurta highlights unchanged.
      const gain = Math.max(1, Math.min(12, .86 / Math.max(r, g, b, .001)));
      r *= gain; g *= gain; b *= gain;
    }
    colours.set([r, g, b], index * 3);
  }
  return colours;
}
