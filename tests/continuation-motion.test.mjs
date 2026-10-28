import test from "node:test";
import assert from "node:assert/strict";
import { continuationCoordinate, documentFrame, methodOutputProgress, ownerClipExclusions, readContinuation, viewportFrame } from "../src/continuation-motion.js";

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

test("the ending clock is monotone and passes through interior artifacts without braking", () => {
  const knots = stops.map(stop => stop.top + stop.height / 2);
  let previous = -1;
  for (let focus = knots[0] - 100; focus <= knots.at(-1) + 100; focus += 2) {
    const coordinate = continuationCoordinate(focus, stops);
    assert(coordinate >= previous && coordinate >= 0 && coordinate <= 4);
    previous = coordinate;
  }
  for (let index = 1; index < knots.length - 1; index++) {
    const knot = knots[index], epsilon = .01;
    assert.equal(continuationCoordinate(knot, stops), index);
    const left = (index - continuationCoordinate(knot - epsilon, stops)) / epsilon;
    const right = (continuationCoordinate(knot + epsilon, stops) - index) / epsilon;
    assert(left > 0 && right > 0, "an interior artifact cannot stop the camera clock");
    assert(Math.abs(left - right) < 1e-7, "the camera clock's velocity must remain continuous");
  }
});

test("a sticky current cannot paint outside its owner into the footer or previous section", () => {
  const stage = { left: 0, top: 0, width: 390, height: 844 };
  const contains = (rectangles, x, y) => rectangles.some(rectangle => x >= rectangle.left
    && x < rectangle.left + rectangle.width && y >= rectangle.top && y < rectangle.top + rectangle.height);
  const ending = { left: 0, top: -18000, width: 390, height: 18579 };
  const atFooter = ownerClipExclusions(ending, stage);
  assert(!contains(atFooter, 195, 578.9));
  for (let y = 579; y < 844; y++) assert(contains(atFooter, 195, y), "all footer pixels must be excluded");
  const released = { ...stage, top: -154 };
  const afterRelease = ownerClipExclusions(ending, released);
  assert(contains(afterRelease, 195, 579 - released.top));
  assert(!contains(afterRelease, 195, 578 - released.top));
  const beforeEntry = ownerClipExclusions({ left: 0, top: 300, width: 390, height: 18000 }, stage);
  assert(contains(beforeEntry, 195, 299)); assert(!contains(beforeEntry, 195, 301));
  assert.deepEqual(ownerClipExclusions({ left: 0, top: 900, width: 390, height: 100 }, stage),
    [{ left: 0, top: 0, width: 390, height: 844 }]);
});
