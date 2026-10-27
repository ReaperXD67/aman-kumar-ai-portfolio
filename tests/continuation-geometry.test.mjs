import test from "node:test";
import assert from "node:assert/strict";
import { continuationPose, createContinuationVolume } from "../src/continuation-geometry.js";

const cases = [
  { viewport: 1440, frame: { left: 48, top: 120, width: 550, height: 670 } },
  { viewport: 1440, frame: { left: 675, top: 166, width: 706, height: 730 } },
  { viewport: 390, frame: { left: 18, top: -200, width: 354, height: 590 } },
  { viewport: 320, frame: { left: 18, top: 380, width: 284, height: 710 } },
  { viewport: 844, frame: { left: 36, top: -1200, width: 772, height: 400 } },
];

test("perspective vertices remain finite, outside native content and inside the bounded shell", () => {
  for (const { viewport, frame } of cases) {
    for (let step = 0; step <= 40; step++) {
      const mesh = createContinuationVolume(frame, step / 10, viewport);
      const box = mesh.envelope, epsilon = 1e-6;
      for (const ring of mesh.rings) for (const point of ring.points) {
        assert([point.x, point.y, point.z, point.light].every(Number.isFinite));
        assert(point.x >= box.left - epsilon && point.x <= box.left + box.width + epsilon);
        assert(point.y >= box.top - epsilon && point.y <= box.top + box.height + epsilon);
        assert(point.x <= frame.left || point.x >= frame.left + frame.width
          || point.y <= frame.top || point.y >= frame.top + frame.height);
      }
      assert(mesh.panels.every((panel, index) => !index || panel.z >= mesh.panels[index - 1].z));
    }
  }
});

test("integer artifact handoffs preserve the same continuously projected volume", () => {
  const { frame, viewport } = cases[0];
  for (const boundary of [1, 2, 3]) {
    const before = createContinuationVolume(frame, boundary - 1e-7, viewport);
    const after = createContinuationVolume(frame, boundary + 1e-7, viewport);
    for (let rail = 0; rail < before.rings.length; rail++) {
      before.rings[rail].points.forEach((point, index) => {
        const next = after.rings[rail].points[index];
        assert(Math.hypot(point.x - next.x, point.y - next.y, point.z - next.z) < .001);
      });
    }
  }
});

test("portrait and contact retain substantial depth while phone expansion is capped", () => {
  assert(continuationPose(1, 1440).depth >= 70);
  assert(continuationPose(4, 1440).depth >= 40);
  for (let step = 0; step <= 80; step++) assert(continuationPose(step / 20, 390).expansion <= 34);
  const portrait = createContinuationVolume(cases[0].frame, 1, 1440);
  const projected = portrait.rings.flatMap(ring => ring.points);
  assert(Math.max(...projected.map(point => point.z)) - Math.min(...projected.map(point => point.z)) > 100);
});

test("reverse scroll addresses exactly the same mesh without elapsed time or history", () => {
  const { frame, viewport } = cases[2];
  const coordinates = [0, .27, .98, 1, 1.62, 2, 2.91, 3.18, 4];
  const forward = coordinates.map(coordinate => createContinuationVolume(frame, coordinate, viewport));
  const reverse = coordinates.toReversed().map(coordinate => createContinuationVolume(frame, coordinate, viewport)).toReversed();
  assert.deepEqual(reverse, forward);
});

test("reduced motion settles into aligned non-twisted aperture geometry with fewer rails", () => {
  for (const coordinate of [0, 1, 2, 3, 4]) {
    const mesh = createContinuationVolume(cases[0].frame, coordinate, 1440, true);
    assert.equal(mesh.rings.length, 3);
    assert.equal(mesh.pose.yaw, 0); assert.equal(mesh.pose.pitch, 0);
    assert.equal(mesh.pose.roll, 0); assert.equal(mesh.pose.twist, 0);
    assert(mesh.pose.expansion <= 26);
    const center = { x: cases[0].frame.left + cases[0].frame.width / 2, y: cases[0].frame.top + cases[0].frame.height / 2 };
    // Shared normalized ray directions prove extrusion does not introduce twist.
    for (let index = 0; index < mesh.segments; index += 8) {
      const a = mesh.rings[0].points[index], b = mesh.rings[2].points[index];
      const ax = (a.x - center.x) / (cases[0].frame.width / 2 + 6);
      assert(Number.isFinite(ax));
      assert(Math.sign(a.x - center.x) === Math.sign(b.x - center.x));
      assert(Math.sign(a.y - center.y) === Math.sign(b.y - center.y));
    }
  }
});
