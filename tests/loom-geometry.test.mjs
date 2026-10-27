import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { LOOM_ENTRY, loomModeWeights, sampleLoomFrame, sampleLoomRail } from '../src/loom-geometry.js';

test('mode blends stay normalized and arrive at three distinct physical states', () => {
  assert.deepEqual(loomModeWeights(0), [1, 0, 0]);
  assert.deepEqual(loomModeWeights(1), [0, 1, 0]);
  assert.deepEqual(loomModeWeights(2), [0, 0, 1]);
  for (let index = 0; index <= 200; index++) {
    const weights = loomModeWeights(index / 100);
    assert.ok(weights.every(value => value >= 0 && value <= 1));
    assert.ok(Math.abs(weights.reduce((sum, value) => sum + value, 0) - 1) < 1e-12);
  }
  const nearReason = loomModeWeights(1 - 1e-4);
  assert.ok(nearReason[0] < 4e-8, 'the reasoning boundary must have zero velocity');
});

test('elastic aperture samples remain finite and nonsingular throughout interruption and passage', () => {
  const output = {};
  for (let mode = 0; mode <= 2; mode += 0.125) for (const time of [0, 0.5, 2, 31, 900]) {
    for (const morph of [0, 0.5, 1]) for (const passage of [0, 0.2, 0.5, 0.8, 1]) for (let index = 0; index < 9; index++) {
      assert.equal(sampleLoomFrame(index / 8, mode, time, morph, passage, 0.35, output), output);
      assert.ok(Object.values(output).every(Number.isFinite));
      assert.ok(output.height > 0.5 && output.depth > 0.4, 'no collapsed or reversed aperture scale');
    }
  }
});

test('every mode and wave resolves to the same nine physical tunnel entry planes', () => {
  const matrix = new THREE.Matrix4().compose(
    new THREE.Vector3(LOOM_ENTRY.x, LOOM_ENTRY.y, LOOM_ENTRY.z),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(0, LOOM_ENTRY.rotationY, 0)),
    new THREE.Vector3(1, 1, 1),
  );
  for (const mode of [0, 0.4, 1, 1.6, 2]) for (let index = 0; index < 9; index++) {
    const frame = sampleLoomFrame(index / 8, mode, 42, 1, 1, 0);
    assert.ok(Math.abs(frame.height - LOOM_ENTRY.height) < 1e-12);
    assert.ok(Math.abs(frame.depth - LOOM_ENTRY.depth) < 1e-12);
    assert.ok(Math.abs(frame.y) < 1e-12 && Math.abs(frame.z) < 1e-12);
    assert.ok(Math.abs(frame.rotationX) < 1e-12 && Math.abs(frame.rotationY) < 1e-12);
    const center = new THREE.Vector3(frame.x, frame.y, frame.z).applyMatrix4(matrix);
    assert.ok(Math.abs(center.x) < 1e-12);
    assert.ok(Math.abs(center.z - (10.6 - index * 1.15)) < 1e-12);
  }
});

test('longitudinal rails remain inside the bevelled open aperture, with a ribbon-width allowance', () => {
  const clearY = (0.855 - 0.028) * LOOM_ENTRY.height;
  const clearZ = (1.015 - 0.028) * LOOM_ENTRY.depth;
  for (let index = 0; index < 144; index++) {
    const a = sampleLoomRail(0, index / 143 * 2 - 1);
    const b = sampleLoomRail(1, index / 143 * 2 - 1);
    assert.deepEqual(a.slice(1), b.slice(1));
    assert.ok(Math.abs(a[1]) + 0.063 < clearY);
    assert.ok(Math.abs(a[2]) + 0.063 < clearZ);
  }
});
