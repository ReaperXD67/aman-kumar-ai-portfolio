const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const unit = value => Number.isFinite(value) ? clamp(value, 0, 1) : .5;

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
export function createPortraitColours(seeds, pixels, width, height) {
  const count = Math.floor((seeds?.length || 0) / 4);
  const colours = new Float32Array(count * 3);
  const valid = Number.isInteger(width) && Number.isInteger(height) && width > 0 && height > 0
    && pixels?.length >= width * height * 4;
  for (let index = 0; index < count; index++) {
    let r = .82, g = .67, b = .37;
    if (valid) {
      const [u, v] = portraitSeedUV(...seeds.subarray(index * 4, index * 4 + 4));
      const x = u * (width - 1), y = v * (height - 1);
      const x0 = Math.floor(x), y0 = Math.floor(y), x1 = Math.min(x0 + 1, width - 1), y1 = Math.min(y0 + 1, height - 1);
      const tx = x - x0, ty = y - y0;
      const sample = channel => {
        const top = pixels[(y0 * width + x0) * 4 + channel] * (1 - tx) + pixels[(y0 * width + x1) * 4 + channel] * tx;
        const bottom = pixels[(y1 * width + x0) * 4 + channel] * (1 - tx) + pixels[(y1 * width + x1) * 4 + channel] * tx;
        return clamp((top * (1 - ty) + bottom * ty) / 255, 0, 1);
      };
      r = sample(0); g = sample(1); b = sample(2);
      const gain = Math.max(1, Math.min(2.5, .30 / Math.max(r, g, b, .001)));
      r *= gain; g *= gain; b *= gain;
    }
    colours.set([r, g, b], index * 3);
  }
  return colours;
}
