import test from "node:test";
import assert from "node:assert/strict";
import { documentFrame, methodOutputProgress, readContinuation, viewportFrame } from "../src/continuation-motion.js";

const stops = [
  { left: 48, top: 600, width: 880, height: 530, act: "method" },
  { left: 48, top: 1600, width: 510, height: 670, act: "portrait" },
  { left: 48, top: 2700, width: 1344, height: 850, act: "record" },
  { left: 48, top: 4200, width: 740, height: 430, act: "record" },
  { left: 800, top: 5600, width: 592, height: 790, act: "contact" },
];

test("the native reading route visits Method, person, evidence and contact in order", () => {
  const acts = [];
  for (let y = 0; y <= 6500; y += 8) {
    const route = readContinuation(y, stops, 1000);
    assert(route.progress >= 0 && route.progress <= 1);
    if (acts.at(-1) !== route.act) acts.push(route.act);
  }
  assert.deepEqual(acts, ["method", "portrait", "record", "contact"]);
});

test("reverse scrolling resolves identical artifact geometry with no historical state", () => {
  const positions = Array.from({ length: 170 }, (_, i) => i * 39);
  const forward = positions.map(y => readContinuation(y, stops, 844));
  const reverse = positions.toReversed().map(y => readContinuation(y, stops, 844)).toReversed();
  assert.deepEqual(reverse, forward);
  assert.equal(readContinuation(-500, stops, 844).progress, 0);
  assert.equal(readContinuation(10000, stops, 844).act, "contact");
  assert.equal(readContinuation(10000, stops, 844).progress, 1);
});

test("field output waits until its lower portion leaves and completes before disappearance", () => {
  const field = stops[0];
  assert.equal(methodOutputProgress(0, field, 1000), 0);
  assert.equal(methodOutputProgress(field.top + field.height - 580, field, 1000), 0);
  assert.equal(methodOutputProgress(field.top + field.height - 120, field, 1000), 1);
  assert.equal(methodOutputProgress(field.top + field.height + 1, field, 1000), 1);
});

test("native frame projection preserves portrait dimensions across viewport/scroll changes", () => {
  const portrait = stops[1];
  const atEntry = viewportFrame(portrait, 1260);
  const onReturn = viewportFrame(portrait, 1620);
  assert.equal(atEntry.top - onReturn.top, 360);
  assert.equal(atEntry.width, portrait.width);
  assert.equal(atEntry.height, portrait.height);
  const releasedStage = viewportFrame(portrait, 1620, { left: 0, top: -154 });
  assert.equal(releasedStage.top - 154, onReturn.top, "the final sticky-stage release must not offset its native artifact");
  const phoneStops = stops.map(stop => ({ ...stop, top: stop.top * 1.7, left: 18, width: 284 }));
  const phone = readContinuation(2800, phoneStops, 800);
  assert.equal(phone.from.width, 284);
  assert.equal(phone.to.width, 284);
});

test("reduced motion selects a settled native frame without an intermediate spatial morph", () => {
  for (let y = 0; y <= 6500; y += 25) {
    const route = readContinuation(y, stops, 800, true);
    assert.deepEqual(route.from, route.to);
    assert.equal(route.progress, 1);
  }
  assert.equal(readContinuation(0, [], 800), null);
});

test("late loading above the ending cannot leave its frame at a stale document position", () => {
  const local = stops.map(stop => ({ ...stop, top: stop.top - 600 }));
  const before = local.map(stop => documentFrame(stop, { left: 0, top: 600 }));
  const after = local.map(stop => documentFrame(stop, { left: 0, top: 1470 }));
  const oldRoute = readContinuation(5600, before, 1000);
  const shiftedRoute = readContinuation(6470, after, 1000);
  assert.equal(shiftedRoute.progress, oldRoute.progress);
  assert.equal(shiftedRoute.act, oldRoute.act);
  assert.deepEqual(viewportFrame(shiftedRoute.to, 6470), viewportFrame(oldRoute.to, 5600));
});
