const PI = Math.PI;
const clamp = (value, low, high) => Math.max(low, Math.min(high, value));

// Five moments in one open surface. They are neither closed contours nor
// cross-sections of a rectangular artifact: the same sheet keeps its topology.
const FILM_POSES = [
  { width: .72, sway: .42, lean: -.30, depth: .50, bow: .10, turns: .35, fold: .15, bias: .10, camber: .30, phase: .30 },
  { width: 1.20, sway: .95, lean: .12, depth: .75, bow: .30, turns: 1.05, fold: .45, bias: .40, camber: .65, phase: .90 },
  { width: 1.50, sway: .55, lean: .55, depth: 1.15, bow: -.20, turns: .15, fold: -.35, bias: -.15, camber: .45, phase: 1.55 },
  { width: .90, sway: -.90, lean: -.10, depth: .72, bow: .40, turns: -.80, fold: .55, bias: .65, camber: .80, phase: 2.10 },
  { width: 1.70, sway: 0, lean: 0, depth: 0, bow: 0, turns: 0, fold: 0, bias: 0, camber: 0, phase: 3.00 },
];

const CAMERA_POSES = [
  { position: [3.8, 1.8, 9.0], target: [.1, -.5, 0], fov: 38, roll: -.09 },
  { position: [4.6, 1.0, 6.8], target: [.1, .1, 0], fov: 38, roll: .13 },
  { position: [1.1, 2.2, 7.2], target: [0, 0, .2], fov: 40, roll: -.10 },
  { position: [-4.0, -.4, 8.2], target: [-.1, 0, -.1], fov: 36, roll: .10 },
  { position: [0, .1, 8.8], target: [0, 0, 0], fov: 38, roll: 0 },
];

const position = coordinate => clamp(Number.isFinite(coordinate) ? coordinate : 0, 0, 4);

// Cubic Hermite interpolation shares its tangent across every artifact stop.
// Unlike a separately eased tween per section, the surface/camera do not stop
// or change velocity at each integer coordinate.
function cubic(values, coordinate) {
  const p = position(coordinate), index = Math.min(3, Math.floor(p)), t = p - index;
  const a = values[index], b = values[index + 1];
  const before = values[Math.max(0, index - 1)], after = values[Math.min(4, index + 2)];
  const m0 = index ? (b - before) * .5 : b - a;
  const m1 = index < 3 ? (after - a) * .5 : b - a;
  const t2 = t * t, t3 = t2 * t;
  return (2 * t3 - 3 * t2 + 1) * a + (t3 - 2 * t2 + t) * m0
    + (-2 * t3 + 3 * t2) * b + (t3 - t2) * m1;
}

export function readEndingFilmPose(coordinate, reduced = false) {
  if (reduced) return { ...FILM_POSES[4], turns: 0, fold: 0, sway: .35, lean: .15, bias: -.12, camber: .25 };
  return Object.fromEntries(Object.keys(FILM_POSES[0]).map(key => [key, cubic(FILM_POSES.map(pose => pose[key]), coordinate)]));
}

function samplePose(u, v, pose, output) {
  const t = clamp(Number.isFinite(u) ? u : 0, 0, 1);
  const across = clamp(Number.isFinite(v) ? v : 0, -1, 1);
  const s = t * 2 - 1, arch = Math.sin(t * PI);
  const width = pose.width * (.46 + .54 * arch);
  const angle = pose.turns * PI * s + pose.fold * arch + pose.bias;
  const ca = Math.cos(angle), sa = Math.sin(angle);
  const centerX = pose.sway * Math.sin(s * PI) + pose.lean * s;
  const centerZ = pose.depth * Math.cos(s * PI * .8 + pose.phase) * (.7 + .3 * arch) + pose.bow * s * s;
  const cup = pose.camber * (across * across - .5) * (.65 + .35 * arch);
  output.x = centerX + across * width * ca - cup * sa;
  // This monotone axis and nonzero cross-section make the ruled sheet regular
  // even while its broad faces turn over. Neither endpoint collapses to a tip.
  output.y = s * 2.65;
  output.z = centerZ + across * width * sa + cup * ca;
  return output;
}

/** u=0..1 along the sheet; v=-1..1 across it. Output may be reused. */
export function sampleEndingFilm(u, v, coordinate, reduced = false, output = {}) {
  return samplePose(u, v, readEndingFilmPose(coordinate, reduced), output);
}

/** Real camera dolly/orbit, focus and bank, independent of the native content. */
export function readEndingCamera(coordinate, aspect = 1, reduced = false) {
  const safeAspect = clamp(Number.isFinite(aspect) ? aspect : 1, .25, 4);
  const target = [0, 0, 0], camera = [2, 1, 10];
  let fov = 40, roll = 0;
  if (!reduced) {
    for (let axis = 0; axis < 3; axis++) {
      target[axis] = cubic(CAMERA_POSES.map(pose => pose.target[axis]), coordinate);
      camera[axis] = cubic(CAMERA_POSES.map(pose => pose.position[axis]), coordinate);
    }
    fov = cubic(CAMERA_POSES.map(pose => pose.fov), coordinate);
    roll = cubic(CAMERA_POSES.map(pose => pose.roll), coordinate);
  }
  const pullback = 1 + Math.min(1.75, Math.max(0, 1 / safeAspect - 1) * .6) * .55;
  for (let axis = 0; axis < 3; axis++) camera[axis] = target[axis] + (camera[axis] - target[axis]) * pullback;
  return { position: camera, target, up: [Math.sin(roll), Math.cos(roll), 0], fov, roll };
}

/** Allocate once, then hand these arrays directly to Three BufferAttributes. */
export function createEndingFilmGrid(columns = 96, rows = 20) {
  const along = clamp(Math.floor(columns) || 96, 8, 192);
  const across = clamp(Math.floor(rows) || 20, 4, 48);
  const count = (along + 1) * (across + 1);
  const positions = new Float32Array(count * 3), normals = new Float32Array(count * 3);
  const uv = new Float32Array(count * 2), indices = new Uint16Array(along * across * 6);
  let index = 0;
  for (let i = 0; i <= along; i++) for (let j = 0; j <= across; j++) {
    const vertex = i * (across + 1) + j;
    uv[vertex * 2] = i / along; uv[vertex * 2 + 1] = j / across;
    if (i === along || j === across) continue;
    const a = vertex, b = vertex + across + 1, c = b + 1, d = vertex + 1;
    indices.set([a, b, d, b, c, d], index); index += 6;
  }
  const scratch = { here: {}, before: {}, after: {}, left: {}, right: {} };
  const grid = { positions, normals, uv, indices, columns: along, rows: across, scratch };
  updateEndingFilmGrid(grid, 0);
  return grid;
}

/** No topology changes, elapsed time, vertex allocations or historical state. */
export function updateEndingFilmGrid(grid, coordinate, reduced = false) {
  const pose = readEndingFilmPose(coordinate, reduced);
  const { here, before, after, left, right } = grid.scratch;
  const epsilon = .0001;
  for (let i = 0; i <= grid.columns; i++) for (let j = 0; j <= grid.rows; j++) {
    const u = i / grid.columns, v = j / grid.rows * 2 - 1, vertex = (i * (grid.rows + 1) + j) * 3;
    samplePose(u, v, pose, here);
    samplePose(u - epsilon, v, pose, before); samplePose(u + epsilon, v, pose, after);
    samplePose(u, v - epsilon, pose, left); samplePose(u, v + epsilon, pose, right);
    const ax = after.x - before.x, ay = after.y - before.y, az = after.z - before.z;
    const bx = right.x - left.x, by = right.y - left.y, bz = right.z - left.z;
    const nx = ay * bz - az * by, ny = az * bx - ax * bz, nz = ax * by - ay * bx;
    const length = Math.hypot(nx, ny, nz);
    grid.positions[vertex] = here.x;
    grid.positions[vertex + 1] = here.y;
    grid.positions[vertex + 2] = here.z;
    grid.normals[vertex] = nx / length;
    grid.normals[vertex + 1] = ny / length;
    grid.normals[vertex + 2] = nz / length;
  }
  return grid;
}
