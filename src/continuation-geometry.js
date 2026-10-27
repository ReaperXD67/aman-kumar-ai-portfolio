const TAU = Math.PI * 2;
const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const mix = (a, b, t) => a + (b - a) * t;
const smooth = t => t * t * t * (t * (t * 6 - 15) + 10);

// A single camera/material evolves through the five measured native artifacts.
// The portrait is a rounded torsion volume; evidence becomes a shallow prism;
// contact opens into an aligned aperture. These are authored poses, not clocks.
const POSES = [
  { power: 7, yaw: -.10, pitch: .04, roll: -.015, twist: -.16, depth: 36 },
  { power: 3.2, yaw: -.32, pitch: .15, roll: -.045, twist: .72, depth: 76 },
  { power: 8, yaw: .19, pitch: -.11, roll: .025, twist: -.25, depth: 52 },
  { power: 5, yaw: -.24, pitch: .12, roll: -.035, twist: -.55, depth: 62 },
  { power: 8, yaw: .10, pitch: -.065, roll: .012, twist: .28, depth: 46 },
];

const signedPower = (value, power) => Math.sign(value) * Math.pow(Math.abs(value), power);

export function continuationPose(coordinate, viewportWidth, reduced = false) {
  const position = clamp(Number.isFinite(coordinate) ? coordinate : 0, 0, 4);
  const index = Math.min(3, Math.floor(position)), amount = smooth(position - index);
  const from = POSES[index], to = POSES[index + 1];
  const narrow = viewportWidth < 700;
  const pose = Object.fromEntries(Object.keys(from).map(key => [key, mix(from[key], to[key], amount)]));
  pose.coordinate = position;
  pose.narrow = narrow;
  pose.expansion = narrow ? 34 : Math.min(88, pose.depth + 12);
  if (reduced) return { ...pose, yaw: 0, pitch: 0, roll: 0, twist: 0, depth: narrow ? 16 : 24, expansion: narrow ? 18 : 26 };
  return pose;
}

/** Perspective-project a twisted extrusion and constrain its aperture to the
 * measured artifact. The radial constraint keeps the photograph/form empty:
 * projection may change the shell, but never the native content's geometry. */
function sample(frame, pose, layer, distance) {
  const theta = distance * TAU - Math.PI * .75;
  const axial = layer * 2 - 1;
  const a = frame.width / 2, b = frame.height / 2;
  const bulge = Math.sin(layer * Math.PI);
  const twist = pose.twist * axial * .36;
  const angle = theta + twist;
  const power = 2 / pose.power;
  const dilation = 1 + (pose.narrow ? .018 : .028) * bulge;
  let x = signedPower(Math.cos(angle), power) * a * dilation;
  let y = signedPower(Math.sin(angle), power) * b * dilation;
  let z = axial * pose.depth + Math.sin(theta * 3 + pose.coordinate * 1.35 + axial) * pose.depth * .18 * bulge;

  const cy = Math.cos(pose.yaw), sy = Math.sin(pose.yaw);
  const cx = Math.cos(pose.pitch), sx = Math.sin(pose.pitch);
  const cr = Math.cos(pose.roll), sr = Math.sin(pose.roll);
  const rotatedX = x * cy + z * sy, rotatedZ = -x * sy + z * cy;
  const rotatedY = y * cx - rotatedZ * sx;
  z = y * sx + rotatedZ * cx;
  x = rotatedX * cr - rotatedY * sr;
  y = rotatedX * sr + rotatedY * cr;
  const focal = Math.max(900, Math.max(frame.width, frame.height) * 3.3);
  const perspective = focal / Math.max(focal * .35, focal - z);
  x *= perspective; y *= perspective;

  // A perspective ray lands on the empty rectangular aperture, then its depth
  // determines the outside shell. Rotation still changes every rail's azimuth,
  // foreshortening and material lighting without ever distorting the portrait.
  const ray = Math.max(Math.abs(x) / Math.max(1, a), Math.abs(y) / Math.max(1, b), .0001);
  const edgeX = x / ray, edgeY = y / ray;
  const wave = Math.sin(theta * 2 + pose.coordinate * .9 + layer * 2.8) * bulge;
  const projectionDepth = clamp(.5 + z / Math.max(1, pose.depth * 5 + Math.max(a, b)), 0, 1);
  const shell = clamp(4 + layer * (pose.expansion - 8) + wave * (pose.narrow ? 2 : 7) + projectionDepth * 4, 3, pose.expansion);
  return {
    x: frame.left + a + edgeX * (1 + shell / Math.max(1, a)),
    y: frame.top + b + edgeY * (1 + shell / Math.max(1, b)),
    z,
    light: clamp(.34 + projectionDepth * .5 + Math.cos(theta - .7) * .16, .12, 1),
  };
}

/** A small, seekable perspective mesh. No elapsed time or historical state. */
export function createContinuationVolume(frame, coordinate, viewportWidth, reduced = false) {
  const pose = continuationPose(coordinate, viewportWidth, reduced);
  const count = reduced ? 3 : pose.narrow ? 6 : 10;
  const segments = pose.narrow ? 64 : 96;
  const rings = Array.from({ length: count }, (_, index) => {
    const layer = index / (count - 1);
    const points = Array.from({ length: segments + 1 }, (_, step) => sample(frame, pose, layer, step / segments));
    return { layer, points };
  });
  const panels = [];
  for (let ring = 0; ring < count - 1; ring++) {
    for (let step = 0; step < segments; step++) {
      const points = [rings[ring].points[step], rings[ring].points[step + 1], rings[ring + 1].points[step + 1], rings[ring + 1].points[step]];
      panels.push({ points, z: points.reduce((total, point) => total + point.z, 0) / 4,
        light: points.reduce((total, point) => total + point.light, 0) / 4,
        accent: (step + ring) % 11 === 0 });
    }
  }
  panels.sort((a, b) => a.z - b.z);
  return { pose, rings, panels, segments,
    envelope: { left: frame.left - pose.expansion, top: frame.top - pose.expansion,
      width: frame.width + pose.expansion * 2, height: frame.height + pose.expansion * 2 } };
}
