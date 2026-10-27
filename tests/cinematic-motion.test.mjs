import test from "node:test";
import assert from "node:assert/strict";
import { captureClipPath, captureExclusions, containFrame, mixFrame, readStory, smoothRange } from "../src/cinematic-motion.js";

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

test("arrival narrative plates stay outside visible capture pixels at responsive frames", () => {
  const layouts = [
    { capture: { left: 79, top: 203, width: 880, height: 550 }, text: { left: 48, top: 370, width: 350, height: 228 }, footer: { left: 18, top: 674, width: 310, height: 18 } },
    { capture: { left: 110, top: 130, width: 1220, height: 762.5 }, text: { left: 86, top: 640, width: 440, height: 230 }, footer: { left: 28, top: 958, width: 310, height: 18 } },
    { capture: { left: 20, top: 180, width: 350, height: 218.75 }, text: { left: 20, top: 322, width: 320, height: 236 }, footer: { left: 20, top: 760, width: 270, height: 12 } },
    { capture: { left: 255, top: 75, width: 420, height: 262.5 }, text: { left: 50, top: 110, width: 320, height: 200 }, footer: { left: 0, top: 0, width: 0, height: 0 } },
  ];
  const inside = (point, box) => point[0] >= box.left && point[0] <= box.left + box.width && point[1] >= box.top && point[1] <= box.top + box.height;
  for (const { capture, text, footer } of layouts) {
    const protectedFrames = [text, footer], exclusions = captureExclusions(capture, protectedFrames);
    for (let x = capture.left; x <= capture.left + capture.width; x += 3) for (let y = capture.top; y <= capture.top + capture.height; y += 3) {
      if (protectedFrames.some(box => inside([x, y], box))) assert.ok(exclusions.some(box => inside([x, y], box)), `unprotected text at ${x}/${y}`);
    }
    assert.ok(exclusions.every(box => Object.values(box).every(Number.isFinite) && box.width > 0 && box.height > 0));
  }
});

test("overlapping narrative exclusions form disjoint holes without even-odd refilling", () => {
  const frame = { left: 0, top: 0, width: 100, height: 100 };
  const holes = captureExclusions(frame, [{ left: 10, top: 10, width: 40, height: 40 }, { left: 30, top: 30, width: 40, height: 40 }], 0);
  assert.equal(holes.reduce((area, box) => area + box.width * box.height, 0), 2800);
  for (let index = 0; index < holes.length; index++) for (let next = index + 1; next < holes.length; next++) {
    const a = holes[index], b = holes[next];
    assert.ok(Math.min(a.left + a.width, b.left + b.width) <= Math.max(a.left, b.left) || Math.min(a.top + a.height, b.top + b.height) <= Math.max(a.top, b.top));
  }
});

test("capture masks follow transformed local space and clear beyond the narrative", () => {
  const frame = { left: 100, top: 200, width: 800, height: 500 };
  const text = { left: 300, top: 300, width: 100, height: 100 };
  const first = captureClipPath(frame, [text], 1600, 1000);
  assert.match(first, /^path\(evenodd, "M0 0H1600V1000H0ZM376 176H624V424H376Z"\)$/);
  assert.equal(captureClipPath(frame, [{ left: 0, top: -200, width: 80, height: 80 }], 1600, 1000), "none");
  assert.equal(captureClipPath(frame, [text], 0, 0), "none");
  assert.equal(captureClipPath(frame, [text], 1600, 1000), first, "reverse traversal resolves the same clip");
});
