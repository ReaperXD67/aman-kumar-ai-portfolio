import test from "node:test";
import assert from "node:assert/strict";
import { portraitDepthPose, projectPortraitPlane } from "../src/portrait-depth.js";
import { readPortraitCurrentPorts } from "../src/portrait-current-route.js";
import { portraitCoverCrop } from "../src/portrait-colours.js";

const close = (actual, expected, epsilon = 1e-7) =>
  assert(Math.abs(actual - expected) < epsilon, `${actual} ≈ ${expected}`);
const screens = [
  { width: 320, height: 568 }, { width: 390, height: 844 },
  { width: 844, height: 390 }, { width: 1440, height: 1000 },
];
const anchorFor = viewport => ({ left: 36, top: 120, width: Math.min(480, viewport.width - 72), height: Math.min(480, viewport.width - 72) * 1.08 });

test("scrolling photo corners, peel and mask share one projection at every device size", () => {
  for (const viewport of screens) {
    const base = anchorFor(viewport);
    const contact = { left: 24, top: viewport.height - 80, width: viewport.width - 48, height: 480 };
    for (const fraction of [-.2, 0, .15, .35, .5, .65, .85, 1, 1.2]) {
      const anchor = { ...base, top: viewport.height - fraction * (viewport.height + base.height) };
      const pose = portraitDepthPose(anchor, viewport);
      const plane = projectPortraitPlane(anchor, pose);
      const center = { x: anchor.left + anchor.width / 2 + pose.x, y: anchor.top + anchor.height / 2 + pose.y };
      close(plane.left, center.x - plane.width / 2);
      close(plane.top, center.y - plane.height / 2);
      close(plane.width / plane.height, anchor.width / anchor.height);
      const ports = readPortraitCurrentPorts(plane, plane, contact, viewport);
      close(ports.sourceActual.x, center.x + plane.width / 2 + .5);
      close(ports.sourceActual.y, plane.top + plane.height * .69);
      assert.deepEqual(ports.portrait, [plane.left, plane.top, plane.left + plane.width, plane.top + plane.height]);
      close(ports.peel[1] - ports.peel[0], plane.height);
      close(ports.peel[0] + plane.height * .69, ports.source.y);
    }
  }
});

test("direct arrival and forward/reverse scroll produce identical bounded continuous poses", () => {
  for (const viewport of screens) {
    const base = anchorFor(viewport);
    const positions = Array.from({ length: 81 }, (_, index) => viewport.height + 40 - index * (viewport.height + base.height + 80) / 80);
    const forward = positions.map(top => portraitDepthPose({ ...base, top }, viewport));
    const reverse = [...positions].reverse().map(top => portraitDepthPose({ ...base, top }, viewport)).reverse();
    assert.deepEqual(forward, reverse, "pose must have no scroll-history dependency");
    for (let index = 0; index < positions.length; index++) {
      const pose = forward[index];
      assert(Object.values(pose).every(Number.isFinite));
      assert(pose.progress >= 0 && pose.progress <= 1);
      assert(pose.scale >= .88 && pose.scale <= 1);
      if (index) assert(pose.progress >= forward[index - 1].progress);
      const next = portraitDepthPose({ ...base, top: positions[index] - .01 }, viewport);
      assert(Math.abs(next.x - pose.x) < .01 && Math.abs(next.y - pose.y) < .01, "no section-threshold jumps");
      assert(Math.abs(next.scale - pose.scale) < .001);
    }
  }
});

test("a paused camera pose still registers immediately to native forward and reverse scrolling", () => {
  const viewport = { width: 390, height: 844 };
  const anchor = anchorFor(viewport);
  const frozenPose = portraitDepthPose(anchor, viewport);
  const snapshot = { ...frozenPose };
  const initial = projectPortraitPlane(anchor, frozenPose);
  const contact = { left: 18, top: 900, width: 354, height: 600 };
  const before = readPortraitCurrentPorts(initial, initial, contact, viewport);
  for (const delta of [-275, -1, 1, 100, 700]) {
    const plane = projectPortraitPlane({ ...anchor, top: anchor.top - delta }, frozenPose);
    const after = readPortraitCurrentPorts(plane, plane, { ...contact, top: contact.top - delta }, viewport);
    close(before.sourceActual.y - after.sourceActual.y, delta);
    close(before.receiverActual.y - after.receiverActual.y, delta);
    close(plane.width, initial.width);
    close(plane.left, initial.left);
  }
  assert.deepEqual(frozenPose, snapshot, "projection must not mutate the frozen pose");
});

test("uniform photo dolly preserves cached normalized cover crop for full image and thumbnail", () => {
  for (const viewport of screens) {
    const anchor = anchorFor(viewport);
    for (const top of [viewport.height, viewport.height / 2, 0, -anchor.height]) {
      const plane = projectPortraitPlane({ ...anchor, top }, portraitDepthPose({ ...anchor, top }, viewport));
      for (const natural of [[1000, 1000], [160, 160], [1000, 800]]) {
        const crop = portraitCoverCrop(...natural, anchor.width, anchor.height);
        const scaled = portraitCoverCrop(...natural, plane.width, plane.height);
        crop.forEach((value, index) => close(value / natural[index % 2], scaled[index] / natural[index % 2]));
      }
    }
  }
});

test("foreground lettering stays anchored to lower shoulders throughout the dolly", () => {
  for (const viewport of screens) {
    const base = anchorFor(viewport);
    for (let step = 0; step <= 100; step++) {
      const anchor = { ...base, top: viewport.height - step / 100 * (viewport.height + base.height) };
      const pose = portraitDepthPose(anchor, viewport);
      const plane = projectPortraitPlane(anchor, pose);
      const normalizedTypeTop = (anchor.top + pose.frontY - plane.top) / plane.height;
      assert(normalizedTypeTop > .8 && normalizedTypeTop < .9);
      if (viewport.width <= 600) assert.equal(pose.frontAngle, 0);
    }
  }
});

test("reduced motion uses a static photograph and type pose regardless of scroll", () => {
  for (const viewport of screens) {
    const base = anchorFor(viewport);
    let first;
    for (const top of [10000, viewport.height, 0, -10000]) {
      const anchor = { ...base, top };
      const pose = portraitDepthPose(anchor, viewport, true);
      assert.deepEqual(projectPortraitPlane(anchor, pose), anchor);
      assert.equal(pose.scale, 1);
      for (const key of ["x", "y", "frontX", "frontAngle", "rearX", "rearY"]) assert.equal(pose[key], 0);
      if (first) assert.deepEqual(pose, first);
      first = pose;
    }
  }
});

test("invalid geometry disables depth while missing or invalid pose preserves a valid native plane", () => {
  const viewport = { width: 390, height: 844 };
  const anchor = anchorFor(viewport);
  assert.equal(portraitDepthPose(null, viewport), null);
  for (const key of ["left", "top", "width", "height"]) {
    for (const value of [NaN, Infinity, -Infinity]) assert.equal(portraitDepthPose({ ...anchor, [key]: value }, viewport), null);
  }
  for (const key of ["width", "height"]) {
    for (const value of [0, -1]) assert.equal(portraitDepthPose({ ...anchor, [key]: value }, viewport), null);
  }
  for (const invalidViewport of [null, undefined, {}, { width: 0, height: 844 }, { width: 390, height: -1 }, { width: Infinity, height: 844 }]) {
    assert.equal(portraitDepthPose(anchor, invalidViewport), null);
  }
  assert.equal(projectPortraitPlane(null, null), null);
  assert.deepEqual(projectPortraitPlane(anchor, null), anchor);
  for (const invalidPose of [{}, { x: NaN, y: 0, scale: 1 }, { x: 0, y: Infinity, scale: 1 }, { x: 0, y: 0, scale: 0 }]) {
    assert.deepEqual(projectPortraitPlane(anchor, invalidPose), anchor);
  }
});
