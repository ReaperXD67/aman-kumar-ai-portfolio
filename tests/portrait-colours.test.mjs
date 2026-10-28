import test from "node:test";
import assert from "node:assert/strict";
import { createPortraitColours, portraitCoverCrop, portraitSeedUV } from "../src/portrait-colours.js";

const close = (actual, expected, epsilon = 1e-6) => assert(Math.abs(actual - expected) < epsilon, `${actual} ≈ ${expected}`);

test("portrait samples use the native cover crop at tall and wide viewport ratios", () => {
  assert.deepEqual(portraitCoverCrop(1000, 1000, 300, 500), [200, 0, 600, 1000]);
  const wide = portraitCoverCrop(1000, 1000, 500, 300);
  assert.deepEqual(wide, [0, 128, 1000, 600]);
  const thumb = portraitCoverCrop(160, 160, 300, 500);
  thumb.forEach((value, index) => close(value / 160, portraitCoverCrop(1000, 1000, 300, 500)[index] / 1000));
  for (const invalid of [0, -1, NaN, Infinity]) assert.equal(portraitCoverCrop(invalid, 1000, 300, 500), null);
});

test("birth colours follow the complete continuous photo edge with an exact registration seed", () => {
  assert.deepEqual(portraitSeedUV(.2, 0, 0, .4), [.88, .52]);
  const last = portraitSeedUV(.2, 1, 1, .4);
  close(last[0], .995); close(last[1], .88);
  assert.equal(portraitSeedUV(0, .5, .5, .01)[1], .69);
  assert(portraitSeedUV(.1, .5001, .5, .5)[1] > portraitSeedUV(.1, .5, .5, .5)[1]);
});

test("bilinear RGB samples retain the photograph's actual edge colours", () => {
  const seeds = new Float32Array([.2, .5, 0, .4, .4, .5, 1, .8]);
  const pixels = new Uint8ClampedArray([255, 0, 0, 255, 0, 255, 0, 255, 0, 0, 255, 255, 255, 255, 0, 255]);
  const before = seeds.slice();
  const colours = createPortraitColours(seeds, pixels, 2, 2);
  const [u, v] = portraitSeedUV(...seeds.subarray(0, 4));
  close(colours[0], (1 - u) * (1 - v) + u * v);
  close(colours[1], u);
  close(colours[2], (1 - u) * v);
  assert.notDeepEqual(colours.slice(0, 3), colours.slice(3, 6));
  assert.deepEqual(seeds, before, "sampling must not change the static motion seeds");
  assert(colours.every(value => value >= 0 && value <= 1));
});

test("dark photo grain receives a bounded hue-preserving lift and missing pixels remain finite", () => {
  const seeds = new Float32Array([.2, .5, .5, .4]);
  const colours = createPortraitColours(seeds, new Uint8ClampedArray([20, 10, 5, 255]), 1, 1);
  close(colours[0] / colours[1], 2); close(colours[1] / colours[2], 2);
  close(colours[0], 20 / 255 * 2.5);
  assert(createPortraitColours(seeds, null, 0, 0).every(Number.isFinite));
  assert.deepEqual(createPortraitColours(new Float32Array(), null, 0, 0), new Float32Array());
});
