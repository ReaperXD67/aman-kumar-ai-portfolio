import test from "node:test";
import assert from "node:assert/strict";
import { containFrame, mixFrame, readStory, smoothRange } from "../src/cinematic-motion.js";

const measures = { heroEnd: 920, flightEnd: 4160, arrivalEnd: 5900 };
test("one document route has continuous, reversible hero/flight/arrival boundaries", () => {
  assert.deepEqual(readStory(-400, measures), { hero: 0, passage: 0, flight: 0, arrival: 0 });
  assert.deepEqual(readStory(920, measures), { hero: 1, passage: 1, flight: 0, arrival: 0 });
  assert.deepEqual(readStory(4160, measures), { hero: 1, passage: 1, flight: 1, arrival: 0 });
  assert.deepEqual(readStory(7000, measures), { hero: 1, passage: 1, flight: 1, arrival: 1 });
  for (const boundary of [920, 4160, 5900]) {
    const before = readStory(boundary - .001, measures), after = readStory(boundary + .001, measures);
    for (const key of Object.keys(before)) assert.ok(Math.abs(after[key] - before[key]) < .00001, `${key} jumps at ${boundary}`);
  }
  const forward = Array.from({ length: 501 }, (_, index) => readStory(index * 14, measures));
  const reverse = Array.from({ length: 501 }, (_, index) => readStory((500 - index) * 14, measures)).reverse();
  assert.deepEqual(forward, reverse);
});

test("resizing preserves semantic positions instead of retaining stale pixel offsets", () => {
  for (const heroEnd of [800, 920, 1000]) {
    const resized = { heroEnd, flightEnd: heroEnd + 2600, arrivalEnd: heroEnd + 4000 };
    assert.equal(readStory(heroEnd, resized).flight, 0);
    assert.equal(readStory(heroEnd + 1300, resized).flight, .5);
    assert.equal(readStory(heroEnd + 3300, resized).arrival, .5);
  }
});

test("contain-fit docks to the visible capture rather than its letterbox", () => {
  assert.deepEqual(containFrame({ left: 100, top: 140, width: 600, height: 500 }, 1440, 900), { left: 100, top: 140, width: 600, height: 375 });
  assert.deepEqual(containFrame({ left: 20, top: 90, width: 280, height: 100 }, 1440, 900), { left: 80, top: 90, width: 160, height: 100 });
});

test("the capture dock reaches identical source and destination rectangles", () => {
  const source = { left: 110, top: 100, width: 1100, height: 687.5 };
  const destination = { left: 80, top: 170, width: 720, height: 450 };
  assert.deepEqual(mixFrame(source, destination, 0), source);
  assert.deepEqual(mixFrame(source, destination, 1), destination);
  for (let index = 0; index <= 100; index++) {
    const frame = mixFrame(source, destination, index / 100);
    assert.ok(Object.values(frame).every(Number.isFinite));
    assert.ok(frame.width >= destination.width && frame.width <= source.width);
    assert.ok(Math.abs(frame.width / frame.height - 1.6) < 1e-10);
  }
});

test("camera bridge easing settles with zero endpoint velocity", () => {
  const epsilon = .0001;
  assert.ok(smoothRange(epsilon) / epsilon < .000001);
  assert.ok((1 - smoothRange(1 - epsilon)) / epsilon < .000001);
  assert.equal(smoothRange(-5), 0);
  assert.equal(smoothRange(5), 1);
});
