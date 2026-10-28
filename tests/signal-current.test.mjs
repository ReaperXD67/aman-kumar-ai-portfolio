import test from "node:test";
import assert from "node:assert/strict";
import { createSignalSeeds, readSignalCamera, dampSignalCoordinate } from "../src/signal-current.js";

const numbers = camera => [...camera.position, ...camera.target, camera.fov];

test("signal seeds are deterministic immutable inputs with empty position buffers", () => {
  const first = createSignalSeeds(8000), second = createSignalSeeds(8000);
  assert(first.positions instanceof Float32Array);
  assert(first.seeds instanceof Float32Array);
  assert.equal(first.positions.length, 24000);
  assert.equal(first.seeds.length, 32000);
  assert(first.positions.every(value => value === 0));
  assert(first.seeds.every(value => value >= 0 && value < 1));
  assert.deepEqual(first, second);
  assert.notEqual(first.seeds, second.seeds);
  assert.deepEqual(createSignalSeeds(2).seeds, first.seeds.slice(0, 8));
  assert.equal(first.seeds[0], 0, "the source root includes an exact port seed");
  assert.equal(first.seeds[1], .5, "the source registration seed stays in the fan's central lane");
  assert(first.seeds[3] < .028, "the first seed belongs to the static source cohort");
  assert.equal(first.seeds[4], 0, "the receiver root includes an exact port seed");
  assert(first.seeds[7] > .972, "the second seed belongs to the static receiver cohort");
  for (const invalid of [NaN, Infinity, -10]) assert.equal(createSignalSeeds(invalid).seeds.length, 0);
  assert.equal(createSignalSeeds(2.9).positions.length, 6);
});

test("phone and desktop budgets retain root coverage across the entire portrait peel", () => {
  for (const count of [4000, 12000]) {
    const { seeds } = createSignalSeeds(count);
    const edgeBands = new Array(8).fill(0);
    for (let index = 0; index < count; index++) {
      if (seeds[index * 4 + 3] < .07) {
        edgeBands[Math.min(7, Math.floor(seeds[index * 4 + 1] * 8))]++;
      }
    }
    assert(edgeBands.every(samples => samples >= 20), "each edge band has enough persistent samples on a phone too");
    assert(Math.max(...edgeBands) / Math.min(...edgeBands) < 1.6, "roots must not collect into one sparse nozzle");
  }
});

test("the signal camera is finite and has continuous velocity through every section knot", () => {
  const epsilon = .0001;
  for (const aspect of [.32, .66, 1.4, 2.4, NaN]) {
    for (let coordinate = 0; coordinate <= 4; coordinate += .025) {
      const camera = readSignalCamera(coordinate, aspect);
      assert(numbers(camera).every(Number.isFinite));
      assert(camera.position[2] > 8);
      assert(camera.fov >= 41 && camera.fov <= 44);
    }
    for (const knot of [1, 2, 3]) {
      const before = numbers(readSignalCamera(knot - epsilon, aspect));
      const at = numbers(readSignalCamera(knot, aspect));
      const after = numbers(readSignalCamera(knot + epsilon, aspect));
      at.forEach((value, index) => {
        assert(Math.abs(before[index] - after[index]) < .001);
        assert(Math.abs((value - before[index]) / epsilon - (after[index] - value) / epsilon) < .001);
      });
    }
  }
  assert(numbers(readSignalCamera(NaN, Infinity)).every(Number.isFinite));
});

test("reduced motion keeps the camera settled and reverse scroll reconstructs its route", () => {
  const still = readSignalCamera(0, .4, true);
  const route = [0, .2, .9, 1.4, 2.5, 3.9, 4];
  for (const coordinate of route) assert.deepEqual(readSignalCamera(coordinate, .4, true), still);
  const forward = route.map(coordinate => readSignalCamera(coordinate, 1.4));
  const reverse = [...route].reverse().map(coordinate => readSignalCamera(coordinate, 1.4)).reverse();
  assert.deepEqual(forward, reverse);
});

test("signal damping is frame-rate independent, bounded on pauses, and finite at rest", () => {
  const advance = fps => {
    let value = 0;
    for (let frame = 0; frame < fps / 2; frame++) value = dampSignalCoordinate(value, 4, 1 / fps);
    return value;
  };
  assert(Math.abs(advance(30) - advance(60)) < 1e-10);
  assert(Math.abs(advance(60) - advance(120)) < 1e-10);
  assert.equal(dampSignalCoordinate(1, 4, 60), dampSignalCoordinate(1, 4, .05));
  assert.equal(dampSignalCoordinate(1, 4, -1), 1);
  let value = 0;
  for (let frame = 0; frame < 500; frame++) value = dampSignalCoordinate(value, 4, 1 / 60);
  assert.equal(value, 4, "the renderer can stop after exact finite convergence");
  const reverse = dampSignalCoordinate(value, 0, 1 / 60);
  assert(reverse >= 0 && reverse < 4);
  assert.equal(dampSignalCoordinate(NaN, Infinity, NaN), 0);
});
