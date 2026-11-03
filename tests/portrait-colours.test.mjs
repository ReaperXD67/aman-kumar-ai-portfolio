import test from "node:test";
import assert from "node:assert/strict";
import { createPortraitBirths, createPortraitColours, createPortraitContour, portraitContourRows, portraitCoverCrop, portraitSeedUV } from "../src/portrait-colours.js";

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
  close(colours[0], .62);
  assert(colours[0] > 20 / 255 * 2.5 * 3, "low-key photo grain must be materially brighter than the previous exposure");
  const nearBlack = createPortraitColours(seeds, new Uint8ClampedArray([2, 1, 0, 255]), 1, 1);
  close(nearBlack[0], 2 / 255 * 8);
  close(nearBlack[0] / nearBlack[1], 2);
  const highlights = createPortraitColours(seeds, new Uint8ClampedArray([245, 177, 15, 255]), 1, 1);
  close(highlights[0], 245 / 255); close(highlights[1], 177 / 255); close(highlights[2], 15 / 255);
  assert(highlights.every(value => value >= 0 && value <= 1), "bright kurta colours are never clipped to white");
  assert(createPortraitColours(seeds, null, 0, 0).every(Number.isFinite));
  assert.deepEqual(createPortraitColours(new Float32Array(), null, 0, 0), new Float32Array());
});

const cutout = (width = 128, height = 128) => {
  const pixels = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) {
    const edge = Math.floor(width * (.43 + y / height * .45));
    for (let x = 0; x < width; x++) {
      const inside = x >= Math.floor(width * .18) && x <= edge;
      // Deliberately toxic transparent RGB catches colour sampling outside alpha.
      pixels.set(inside ? [240, 154, 28, 255] : [255, 0, 255, 0], (y * width + x) * 4);
    }
  }
  return pixels;
};

test("alpha contours follow real occupied pixels and opaque/empty fallbacks remain rectangular", () => {
  const pixels = cutout(), copy = pixels.slice();
  const contour = createPortraitContour(pixels, 128, 128);
  assert.equal(contour.enabled, true);
  assert.equal(contour.right.length, portraitContourRows);
  assert.equal(contour.edges.length, 128);
  for (let y = 0; y < 128; y++) {
    const edge = Math.floor(128 * (.43 + y / 128 * .45));
    close(contour.edges[y], (edge + 1) / 128);
    close(contour.colourEdges[y], edge / 127);
  }
  assert.deepEqual(pixels, copy, "derivation must not change the portrait or alpha");
  const opaque = pixels.slice();
  for (let index = 3; index < opaque.length; index += 4) opaque[index] = 255;
  for (const [data,width,height] of [[opaque,128,128], [new Uint8ClampedArray(128*128*4),128,128], [null,0,0], [pixels,0,128], [pixels,128,Infinity]]) {
    const fallback = createPortraitContour(data, width, height);
    assert.equal(fallback.enabled, false);
    assert(fallback.right.every(value => value === 1));
  }
});

test("each static birth traces the curved alpha edge while colours remain inside opaque pixels", () => {
  const pixels = cutout(), contour = createPortraitContour(pixels, 128, 128);
  const seeds = new Float32Array([0,.5,.5,.01, .2,0,0,.1, .2,.5,.7,.1, .2,1,1,.1]);
  const copy = seeds.slice();
  const births = createPortraitBirths(seeds, contour);
  close(births[1], .69);
  close(births[3], .52); close(births[7], .88);
  assert(births[2] < births[4] && births[4] < births[6], "roots must travel across the shoulder contour instead of a fixed vertical edge");
  assert(births.every(value => Number.isFinite(value) && value >= 0 && value <= 1));
  const colours = createPortraitColours(seeds, pixels, 128, 128, contour);
  for (let index = 0; index < colours.length; index += 3) {
    close(colours[index], 240/255); close(colours[index+1], 154/255); close(colours[index+2], 28/255);
  }
  assert.deepEqual(seeds, copy);
  const rectangle = createPortraitBirths(seeds, null);
  for (let index = 0; index < rectangle.length; index += 2) assert.equal(rectangle[index], 1);
  assert.deepEqual(createPortraitBirths(new Float32Array(), contour), new Float32Array());
});

test("isolated transparent rows inherit nearest real edge without nonfinite birth data", () => {
  const pixels = cutout(32,32);
  for (const row of [0,1,15,31]) for (let x=0; x<32; x++) pixels[(row*32+x)*4+3]=0;
  const contour = createPortraitContour(pixels,32,32);
  assert.equal(contour.enabled,true);
  close(contour.edges[0],contour.edges[2]);
  close(contour.edges[1],contour.edges[2]);
  close(contour.edges[15],contour.edges[14]);
  close(contour.edges[31],contour.edges[30]);
  assert(contour.right.every(Number.isFinite));
});
