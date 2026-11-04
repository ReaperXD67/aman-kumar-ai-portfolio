import test from "node:test";
import assert from "node:assert/strict";
import { portraitNameDissolve, sharedNameRelease, projectNamePoint, createNameOrigins } from "../src/portrait-name-dissolve.js";
import { createSignalSeeds, signalCurrentCohorts } from "../src/signal-current.js";
import { portraitDepthPose } from "../src/portrait-depth.js";

const close = (actual, expected, tolerance = 1e-7) => assert(Math.abs(actual - expected) <= tolerance, `${actual} ≈ ${expected}`);

test("the name dissolve is bounded, staged and reconstructed exactly by reverse scrolling", () => {
  const route = Array.from({ length: 141 }, (_, index) => -.2 + index * .01);
  const forward = route.map(value => portraitNameDissolve(value));
  assert.deepEqual(forward, [...route].reverse().map(value => portraitNameDissolve(value)).reverse());
  assert.deepEqual(portraitNameDissolve(0), { first: 0, last: 0 }, "arrival at the stage reading line preserves both names");
  assert.deepEqual(portraitNameDissolve(.04), { first: 0, last: 0 });
  assert(portraitNameDissolve(.18).first > 0);
  assert.equal(portraitNameDissolve(.18).last, 0);
  assert.equal(portraitNameDissolve(.40).first, 1);
  assert.deepEqual(portraitNameDissolve(.62), { first: 1, last: 1 });
  assert(portraitNameDissolve(.45).last > 0 && portraitNameDissolve(.45).last < 1, "the lower row continues after the upper row has fully released");
  for (let index = 0; index < forward.length; index++) {
    for (const row of ["first", "last"]) {
      assert(forward[index][row] >= 0 && forward[index][row] <= 1);
      if (index) assert(forward[index][row] >= forward[index - 1][row]);
      assert.deepEqual(portraitNameDissolve(route[index], true), { first: 0, last: 0 });
    }
  }
  for (const knot of [.04, .18, .40, .62]) {
    const before = portraitNameDissolve(knot - 1e-6), at = portraitNameDissolve(knot), after = portraitNameDissolve(knot + 1e-6);
    for (const row of ["first", "last"]) {
      assert(Math.abs(after[row] - before[row]) < .00002);
      close((at[row] - before[row]) / 1e-6, (after[row] - at[row]) / 1e-6, .001);
    }
  }
  for (const invalid of [NaN, Infinity, -Infinity, undefined]) assert.deepEqual(portraitNameDissolve(invalid), { first: 0, last: 0 });
});

test("glyph release follows its spatial threshold and finishes even for the last staggered grain", () => {
  for (const u of [0, .15, .5, .9, 1]) {
    for (const noise of [0, .3, 1]) {
      const threshold = .04 + .60 * u + .025 * noise;
      assert.equal(sharedNameRelease(threshold, u, noise), 0);
      close(sharedNameRelease(threshold + .335 / 2, u, noise), .5);
      close(sharedNameRelease(threshold + .335, u, noise), 1);
      assert.equal(sharedNameRelease(0, u, noise), 0);
      close(sharedNameRelease(1, u, noise), 1);
      assert(sharedNameRelease(threshold + .000001, u, noise) < .00001, "the release has no positional jump");
    }
  }
  assert(sharedNameRelease(.4, .1) > sharedNameRelease(.4, .9), "the sweep releases left-hand ink first");
  assert.equal(sharedNameRelease(NaN, NaN, NaN), 0);
});

test("name projection matches CSS centered rotation then translation and perspective", () => {
  const frame = { left: 100, top: 200, width: 400, height: 160 };
  const origin = { x: 600, y: 400 };
  const zero = { x: 0, y: 0, z: 0, angle: 0 };
  assert.deepEqual(projectNamePoint({ u: 0, v: 0 }, frame, origin, zero), { x: 100, y: 200, z: 0, scale: 1 });
  assert.deepEqual(projectNamePoint({ u: 1, v: 1 }, frame, origin, zero), { x: 500, y: 360, z: 0, scale: 1 });
  const centered = projectNamePoint({ u: .5, v: .5 }, frame, origin, { x: 40, y: -20, z: -120, angle: 70 });
  close(centered.scale, 1200 / 1320);
  close(centered.x, 600 + (340 - 600) * centered.scale);
  close(centered.y, 400 + (260 - 400) * centered.scale);
  const rotated = projectNamePoint({ u: 1, v: .5 }, frame, origin, { x: 0, y: 0, z: -100, angle: 90 });
  close(rotated.z, -300);
  close(rotated.x, 600 + (300 - 600) * .8);
  close(rotated.y, 400 + (280 - 400) * .8);
  const overscan = projectNamePoint({ u: -.05, v: 1.1 }, frame, origin, zero);
  close(overscan.x, 80); close(overscan.y, 376);
});

test("live opposing rear poses project continuous finite glyph positions on phone and desktop", () => {
  for (const viewport of [{ width: 320, height: 568 }, { width: 390, height: 844 }, { width: 1440, height: 1000 }]) {
    const frame = { left: 18, top: 140, width: viewport.width - 36, height: viewport.width * .25 };
    const origin = { x: viewport.width / 2, y: viewport.height / 2 };
    for (let index = 0; index <= 100; index++) {
      const anchor = { left: 36, top: viewport.height - index / 100 * (viewport.height + 400), width: viewport.width - 72, height: 400 };
      const pose = portraitDepthPose(anchor, viewport);
      const next = portraitDepthPose({ ...anchor, top: anchor.top - .01 }, viewport);
      for (const row of ["first", "last"]) {
        const asRow = value => ({ x: value[`${row}X`], y: value[`${row}Y`], z: value[`${row}Z`], angle: value[`${row}Angle`] });
        for (const u of [0, .5, 1]) {
          const point = projectNamePoint({ u, v: .5 }, frame, origin, asRow(pose));
          const following = projectNamePoint({ u, v: .5 }, frame, origin, asRow(next));
          assert(Object.values(point).every(Number.isFinite));
          assert(point.scale > .7 && point.scale < 1.3);
          assert(Math.abs(point.x - following.x) < .05 && Math.abs(point.y - following.y) < .05);
        }
      }
    }
  }
  const frame = { left: 0, top: 0, width: 10, height: 10 }, origin = { x: 0, y: 0 }, pose = { x: 0, y: 0, z: 0, angle: 0 };
  assert.equal(projectNamePoint(null, frame, origin, pose), null);
  assert.equal(projectNamePoint({ u: 0, v: 0 }, { ...frame, width: 0 }, origin, pose), null);
  assert.equal(projectNamePoint({ u: 0, v: 0 }, frame, origin, { ...pose, z: 1200 }), null);
  assert.equal(projectNamePoint({ u: 0, v: 0 }, frame, origin, { ...pose, angle: NaN }), null);
});

test("static glyph origins preserve sampled ink and distribute both rows within the fixed cohort", () => {
  const samples = [Array.from({ length: 17 }, (_, i) => ({ u: i / 16, v: -.05 + i / 32 })),
    Array.from({ length: 23 }, (_, i) => ({ u: i / 22, v: .5 + i / 44 }))];
  for (const count of [4000, 12000]) {
    const { seeds } = createSignalSeeds(count);
    const snapshot = seeds.slice();
    const origins = createNameOrigins(seeds, samples);
    assert(origins instanceof Float32Array);
    assert.equal(origins.length, count * 3);
    assert.deepEqual(origins, createNameOrigins(seeds, samples));
    assert.deepEqual(seeds, snapshot);
    const rows = [0, 0], covered = [new Set(), new Set()];
    for (let index = 0; index < count; index++) {
      const row = origins[index * 3 + 2];
      assert.equal(row, index % 2);
      assert(samples[row].some(point => Math.abs(point.u - origins[index * 3]) < 1e-6 && Math.abs(point.v - origins[index * 3 + 1]) < 1e-6));
      if (seeds[index * 4 + 3] >= signalCurrentCohorts.source && seeds[index * 4 + 3] < signalCurrentCohorts.source + signalCurrentCohorts.name) {
        rows[row]++; covered[row].add(origins[index * 3]);
      }
    }
    assert(rows.every(amount => amount > count * .21 && amount < count * .27), "each name receives roughly a quarter of the unchanged total budget");
    covered.forEach((points, row) => assert.equal(points.size, samples[row].length));
  }
  assert.equal(createNameOrigins(null, samples).length, 0);
  const seed = new Float32Array([.4, .2, .2, .2]);
  assert.deepEqual(createNameOrigins(seed, []), new Float32Array([0, 0, -1]));
  assert.deepEqual(createNameOrigins(seed, [[], [{ u: .2, v: .3 }, { u: NaN, v: 0 }]]), new Float32Array([.2, .3, 1]));
});
