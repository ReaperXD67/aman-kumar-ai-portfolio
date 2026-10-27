import test from "node:test";
import assert from "node:assert/strict";
import { createEndingFilmGrid, updateEndingFilmGrid, sampleEndingFilm, readEndingCamera } from "../src/ending-film-geometry.js";

const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
const cameraNumbers = camera => [...camera.position, ...camera.target, ...camera.up, camera.fov, camera.roll];

test("the open film retains finite regular surface geometry and reuses its topology", () => {
  for (const resolution of [[96, 20], [64, 14]]) {
    const grid = createEndingFilmGrid(...resolution);
    const positions = grid.positions, normals = grid.normals, indices = grid.indices, uv = grid.uv;
    assert.equal(indices.length, resolution[0] * resolution[1] * 6);
    for (let step = 0; step <= 32; step++) {
      updateEndingFilmGrid(grid, step / 8);
      assert.equal(grid.positions, positions); assert.equal(grid.normals, normals);
      assert.equal(grid.indices, indices); assert.equal(grid.uv, uv);
      for (let i = 0; i < positions.length; i += 3) {
        assert([positions[i], positions[i + 1], positions[i + 2]].every(Number.isFinite));
        assert(Math.max(Math.abs(positions[i]), Math.abs(positions[i + 1]), Math.abs(positions[i + 2])) < 6);
        assert(Math.abs(Math.hypot(normals[i], normals[i + 1], normals[i + 2]) - 1) < 1e-6);
      }
      // All cross-sections stay open; endpoints never meet to make a frame.
      for (let u = 0; u <= 1; u += .125) assert(distance(sampleEndingFilm(u, -1, step / 8), sampleEndingFilm(u, 1, step / 8)) > .5);
      assert(distance(sampleEndingFilm(0, 0, step / 8), sampleEndingFilm(1, 0, step / 8)) >= 5.3);
    }
  }
});

test("surface triangles keep their normal orientation through the strongest folds", () => {
  const grid = createEndingFilmGrid(64, 14);
  for (let coordinate = 0; coordinate <= 4; coordinate += .25) {
    updateEndingFilmGrid(grid, coordinate);
    for (let i = 0; i < grid.indices.length; i += 3) {
      const a = grid.indices[i] * 3, b = grid.indices[i + 1] * 3, c = grid.indices[i + 2] * 3, p = grid.positions;
      const ax = p[b] - p[a], ay = p[b + 1] - p[a + 1], az = p[b + 2] - p[a + 2];
      const bx = p[c] - p[a], by = p[c + 1] - p[a + 1], bz = p[c + 2] - p[a + 2];
      const nx = ay * bz - az * by, ny = az * bx - ax * bz, nz = ax * by - ay * bx;
      const length = Math.hypot(nx, ny, nz);
      assert(length > .0001, "a folded triangle must not collapse");
      const agreement = (nx * grid.normals[a] + ny * grid.normals[a + 1] + nz * grid.normals[a + 2]) / length;
      assert(agreement > .85, "triangle winding must agree with the continuous surface normal");
    }
  }
});

test("film and actual camera share continuous velocity across artifact boundaries", () => {
  const epsilon = .0001;
  for (const coordinate of [1, 2, 3]) {
    for (const [u, v] of [[.1, -.8], [.35, 0], [.8, .9]]) {
      const before = sampleEndingFilm(u, v, coordinate - epsilon), at = sampleEndingFilm(u, v, coordinate), after = sampleEndingFilm(u, v, coordinate + epsilon);
      assert(distance(before, after) < .002);
      for (const axis of ["x", "y", "z"]) {
        const incoming = (at[axis] - before[axis]) / epsilon, outgoing = (after[axis] - at[axis]) / epsilon;
        assert(Math.abs(incoming - outgoing) < .01);
      }
    }
    for (const aspect of [.38, 1.44, 2.16]) {
      const before = cameraNumbers(readEndingCamera(coordinate - epsilon, aspect));
      const at = cameraNumbers(readEndingCamera(coordinate, aspect));
      const after = cameraNumbers(readEndingCamera(coordinate + epsilon, aspect));
      at.forEach((value, index) => {
        assert(Math.abs(before[index] - after[index]) < .003);
        assert(Math.abs((value - before[index]) / epsilon - (after[index] - value) / epsilon) < .01);
      });
    }
  }
});

test("the sheet unfolds materially and the camera orbits, dollies and banks before contact", () => {
  const grid = createEndingFilmGrid(32, 8), snapshots = [];
  for (const coordinate of [0, 1, 2, 3, 4]) {
    updateEndingFilmGrid(grid, coordinate); snapshots.push(Float32Array.from(grid.positions));
    const camera = readEndingCamera(coordinate, 1.44);
    assert(cameraNumbers(camera).every(Number.isFinite));
    assert(camera.position[2] > 6); assert(camera.fov >= 35 && camera.fov <= 42);
  }
  for (let pose = 1; pose < snapshots.length; pose++) {
    let squared = 0;
    for (let i = 0; i < snapshots[pose].length; i++) squared += (snapshots[pose][i] - snapshots[pose - 1][i]) ** 2;
    assert(Math.sqrt(squared / snapshots[pose].length) > .25, "adjacent poses must reshape the broad faces");
  }
  const portrait = readEndingCamera(1, 1.44), evidence = readEndingCamera(3, 1.44), contact = readEndingCamera(4, 1.44);
  assert(portrait.position[0] > 4 && evidence.position[0] < -3);
  assert(Math.abs(portrait.roll - evidence.roll) > .02);
  assert(contact.position[2] - portrait.position[2] > 1.5);
  assert.equal(contact.position[0], 0); assert.equal(contact.roll, 0);
  for (let u = 0; u <= 1; u += .1) for (let v = -1; v <= 1; v += .25) assert.equal(sampleEndingFilm(u, v, 4).z, 0, "contact becomes one flat open sheet");
});

test("reverse scrolling reconstructs the same film and camera without historical state", () => {
  const coordinates = [0, .18, .72, 1.05, 1.86, 2.2, 2.95, 3.6, 4];
  const grid = createEndingFilmGrid(32, 8);
  const capture = coordinate => {
    updateEndingFilmGrid(grid, coordinate);
    return { positions: Float32Array.from(grid.positions), normals: Float32Array.from(grid.normals), camera: readEndingCamera(coordinate, .4) };
  };
  const forward = coordinates.map(capture), reverse = coordinates.toReversed().map(capture).toReversed();
  assert.deepEqual(reverse, forward);
});

test("reduced motion keeps one calm film and camera for the whole native reading route", () => {
  const still = sampleEndingFilm(.37, .6, 0, true), camera = readEndingCamera(0, .38, true);
  for (const coordinate of [0, .7, 1, 1.8, 2, 2.8, 3, 3.9, 4]) {
    assert.deepEqual(sampleEndingFilm(.37, .6, coordinate, true), still);
    assert.deepEqual(readEndingCamera(coordinate, .38, true), camera);
  }
  const invalid = sampleEndingFilm(NaN, Infinity, NaN);
  assert(Object.values(invalid).every(Number.isFinite));
  assert(cameraNumbers(readEndingCamera(NaN, NaN)).every(Number.isFinite));
});
