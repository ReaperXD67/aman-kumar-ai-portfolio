// Original analytical particle current: immutable seeds, shader-only travel and morphs.
const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const coordinateOf = value => Number.isFinite(value) ? clamp(value, 0, 4) : 0;

export function createSignalSeeds(count) {
  const size = Number.isFinite(count) ? clamp(Math.floor(count), 0, 65536) : 0;
  const positions = new Float32Array(size * 3);
  const seeds = new Float32Array(size * 4);
  let state = 0x51a9c37;
  const random = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
  for (let index = 0; index < size; index++) {
    seeds[index * 4] = random();
    seeds[index * 4 + 1] = random();
    seeds[index * 4 + 2] = random();
    seeds[index * 4 + 3] = random();
  }
  return { positions, seeds };
}

export function readSignalCamera(coordinate, aspect = 1, reduced = false) {
  const c = reduced ? 1.35 : coordinateOf(coordinate);
  const ratio = Number.isFinite(aspect) && aspect > 0 ? aspect : 1;
  const phone = 1 - clamp((ratio - .5) / .7, 0, 1);
  return {
    position: [.58 * Math.sin(c * .92 - .35), .16 + .18 * Math.cos(c * .8), 8.8 + .45 * Math.sin(c * .9) + phone * .8],
    target: [.1 * Math.sin(c * .9), .06 * Math.cos(c * .6), 0],
    fov: 41 + phone * 3,
  };
}

export function dampSignalCoordinate(current, target, dt) {
  const from = coordinateOf(current), to = coordinateOf(target);
  const delta = Number.isFinite(dt) ? clamp(dt, 0, .05) : 0;
  if (Math.abs(to - from) <= .00001) return to;
  const next = from + (to - from) * -Math.expm1(-12 * delta);
  return Math.abs(to - next) <= .00001 ? to : next;
}

export const signalCurrentVertex = /* glsl */ `
precision highp float;
attribute vec4 aSeed;
uniform float uCoordinate;
uniform float uTime;
uniform float uAspect;
uniform float uPixelRatio;
uniform float uReduced;
uniform vec4 uRects[24];
uniform int uRectCount;
uniform vec2 uViewport;
varying vec3 vColor;
varying float vAlpha;
varying float vAngle;
varying float vSoftness;
const float TAU = 6.28318530718;

// All poses are open stream paths. Neighbouring lanes stay individual filaments.
vec3 pose(float stage, float t, float lane, float depth) {
  float centered = t - .5;
  if (stage < .5) {
    return vec3(centered * 7.6,
      .9 * sin(t * 5.1 + lane * .19) + lane * .19,
      .9 * cos(t * 3.5 + lane * .21) + depth * .3);
  }
  if (stage < 1.5) {
    return vec3(-.82 + (.72 + lane * .035) * sin(centered * 5.4 + lane * .12) + lane * .09,
      -centered * 7.4 + lane * .11 * sin(t * 3.14),
      1.3 * sin(t * 5.3 + lane * .24) + depth * .65);
  }
  if (stage < 2.5) {
    float bend = smoothstep(.22, .78, t);
    return vec3(centered * 7.8,
      -.95 + bend * 1.9 + lane * .14,
      -.7 + t * 1.45 + .18 * sin(t * 7.0 + lane * .25) + depth * .2);
  }
  if (stage < 3.5) {
    float spread = .35 + t * .65;
    return vec3(centered * 6.6 + lane * .045,
      .7 - t * 1.5 + lane * .24 * spread,
      1.3 - t * 3.0 + depth * .22);
  }
  float gather = smoothstep(.05, .96, t);
  return vec3(-3.55 + t * 7.1,
    (1.0 - gather) * (lane * .27 + .55 * sin(t * 4.8)) - .55,
    (1.0 - gather) * (depth * .5 + .65 * cos(t * 4.0)) - gather * .45);
}

vec3 currentPath(float coordinate, float t, float lane, float depth) {
  float segment = min(floor(coordinate), 3.0);
  float f = coordinate - segment;
  vec3 a = pose(max(segment - 1.0, 0.0), t, lane, depth);
  vec3 b = pose(segment, t, lane, depth);
  vec3 c = pose(segment + 1.0, t, lane, depth);
  vec3 d = pose(min(segment + 2.0, 4.0), t, lane, depth);
  // Catmull-Rom keeps nonzero, continuous morph velocity through section knots.
  return .5 * ((2.0 * b) + (-a + c) * f +
    (2.0 * a - 5.0 * b + 4.0 * c - d) * f * f +
    (-a + 3.0 * b - 3.0 * c + d) * f * f * f);
}

float rectDistance(vec2 point, vec4 rectangle) {
  vec2 center = (rectangle.xy + rectangle.zw) * .5;
  vec2 halfExtent = max((rectangle.zw - rectangle.xy) * .5, vec2(0.0));
  vec2 outside = abs(point - center) - halfExtent;
  return length(max(outside, vec2(0.0))) + min(max(outside.x, outside.y), 0.0);
}

void main() {
  float reduced = step(.5, uReduced);
  float coordinate = mix(clamp(uCoordinate, 0.0, 4.0), 1.35, reduced);
  float time = uTime * (1.0 - reduced);
  float lane = (floor(aSeed.y * 23.0) - 11.0) * .4;
  float depth = aSeed.z * 2.0 - 1.0;
  float t = fract(aSeed.x + time * .04 + lane * .013);
  vec3 location = currentPath(coordinate, t, lane, depth);
  float jitter = (fract(aSeed.y * 23.0) - .5);
  location.xy += vec2(jitter * .08, depth * .05);
  location.z += .10 * sin(t * 13.0 + time * .35 + lane);
  float phone = 1.0 - smoothstep(.65, 1.4, uAspect);
  location.x *= mix(1.0, .56, phone);
  vec4 view = modelViewMatrix * vec4(location, 1.0);
  vec4 clip = projectionMatrix * view;
  gl_Position = clip;

  vec3 ahead = currentPath(coordinate, min(t + .003, 1.0), lane, depth);
  ahead.x *= mix(1.0, .56, phone);
  vec4 tangentClip = projectionMatrix * modelViewMatrix * vec4(ahead, 1.0);
  vec2 tangent = (tangentClip.xy / max(tangentClip.w, .01) - clip.xy / max(clip.w, .01)) * uViewport;
  vAngle = atan(tangent.y, tangent.x);
  float distanceToFocus = abs(view.z + 9.0);
  vSoftness = smoothstep(.5, 3.4, distanceToFocus) * .32;
  float pointSize = mix(3.1, 4.8, aSeed.z) * (9.0 / max(-view.z, 3.0));
  gl_PointSize = clamp(pointSize * uPixelRatio * (1.0 + vSoftness), 1.0, 7.0 * uPixelRatio);

  float packet = pow(.5 + .5 * sin(TAU * (t - time * .17 + lane * .071)), 12.0);
  vColor = mix(vec3(.71, .75, .63), vec3(1.0, 1.0, .88), packet);
  if (aSeed.w > .84) vColor = mix(vec3(.48, .64, .16), vec3(.77, 1.0, .27), .3 + packet * .7);
  if (aSeed.w > .985) vColor = mix(vec3(.54, .22, .12), vec3(1.0, .37, .20), packet);
  vAlpha = (.30 + packet * .65) * (1.0 - vSoftness * .5);
  vAlpha *= smoothstep(0.0, .075, t) * (1.0 - smoothstep(.9, 1.0, t));
  vec2 screen = (clip.xy / max(clip.w, .01) * .5 + .5) * uViewport;
  screen.y = uViewport.y - screen.y;
  float feather = mix(16.0, 24.0, smoothstep(600.0, 1200.0, uViewport.x));
  for (int index = 0; index < 24; index++) {
    if (index >= uRectCount) break;
    // Entire protected surface is empty; the exterior fade has rounded corners.
    vAlpha *= smoothstep(6.0, feather, rectDistance(screen, uRects[index]));
  }
  vAlpha *= step(.01, clip.w);
}
`;

export const signalCurrentFragment = /* glsl */ `
precision highp float;
varying vec3 vColor;
varying float vAlpha;
varying float vAngle;
varying float vSoftness;
void main() {
  vec2 point = gl_PointCoord - .5;
  float c = cos(vAngle), s = sin(vAngle);
  vec2 aligned = mat2(c, -s, s, c) * point;
  float radius = length(aligned * vec2(1.0, 2.7));
  float shape = 1.0 - smoothstep(.13, .49 + vSoftness * .06, radius);
  float alpha = shape * vAlpha;
  if (alpha < .003) discard;
  gl_FragColor = vec4(vColor, alpha);
}
`;
