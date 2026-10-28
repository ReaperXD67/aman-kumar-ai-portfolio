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
  // Two persistent endpoint seeds register the current even between packets.
  if (size > 0) { seeds[0] = 0; seeds[3] = .01; }
  if (size > 1) { seeds[4] = 0; seeds[7] = .99; }
  return { positions, seeds };
}

export function readSignalCamera(coordinate, aspect = 1, reduced = false) {
  const c = reduced ? 1.35 : coordinateOf(coordinate);
  const ratio = Number.isFinite(aspect) && aspect > 0 ? aspect : 1;
  const phone = 1 - clamp((ratio - .5) / .7, 0, 1);
  return {
    position: [(1.65 - phone * .6) * Math.sin(c * .92 - .35), .24 + .32 * Math.cos(c * .8), 9.6 + 1.15 * Math.sin(c * .9) + phone * .8],
    target: [.18 * Math.sin(c * .9), .1 * Math.cos(c * .6), 0],
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
uniform vec4 uSource;
uniform vec4 uReceiver;
uniform vec4 uPortrait;
uniform vec4 uContact;
uniform vec4 uRects[24];
uniform int uRectCount;
uniform vec2 uViewport;
varying vec3 vColor;
varying float vAlpha;
varying float vAngle;
varying float vSoftness;
const float TAU = 6.28318530718;

vec3 anchorInView(vec2 css) {
  vec2 ndc = vec2(css.x / uViewport.x * 2.0 - 1.0, 1.0 - css.y / uViewport.y * 2.0);
  return vec3(ndc.x * 9.0 / projectionMatrix[0][0], ndc.y * 9.0 / projectionMatrix[1][1], -9.0);
}

vec3 currentPath(float t, float coordinate, float lane, float depth) {
  vec3 source = anchorInView(uSource.xy), receiver = anchorInView(uReceiver.xy);
  float phone = 1.0 - smoothstep(.65, 1.4, uAspect);
  float side = uSource.z < 0.0 ? -1.0 : 1.0;
  // The endpoint ports stay in view space. Only the interior receives camera
  // rotation and dolly, so its perspective can change without a slipping seam.
  vec3 sculpture = (modelViewMatrix * vec4(vec3(
    .45 * sin(coordinate * 1.1), .45 * cos(coordinate * .7),
    1.6 + .8 * sin(coordinate * .85)), 0.0)).xyz;
  sculpture *= clamp(11.0 / max(length(cameraPosition), 1.0), .7, 1.3);
  vec3 first = source + vec3(side * mix(.95, .38, phone), .32, 0.0) + sculpture;
  vec3 second = receiver + vec3(-side * mix(.65, .22, phone), 1.05, 0.0) - sculpture * .6;
  float q = 1.0 - t;
  vec3 spine = q * q * q * source + 3.0 * q * q * t * first +
    3.0 * q * t * t * second + t * t * t * receiver;
  float envelope = sin(t * 3.14159265359);
  float filament = lane * mix(.25, .12, phone) * envelope;
  float helix = t * (10.0 + coordinate * .6) + lane * 1.4;
  spine += vec3(filament * cos(helix), filament * sin(helix), depth * .42 * envelope);
  // On phones the attached stream follows the photograph's exterior gutter,
  // then releases into the open space below it instead of leaving the screen.
  float viewDepth = max(-spine.z, .01);
  vec2 css = vec2(
    (spine.x * projectionMatrix[0][0] / viewDepth * .5 + .5) * uViewport.x,
    (.5 - spine.y * projectionMatrix[1][1] / viewDepth * .5) * uViewport.y);
  float sourceRegion = smoothstep(uSource.y - 90.0, uSource.y - 40.0, css.y);
  float release = 1.0 - smoothstep(uPortrait.w + 10.0, uPortrait.w + 70.0, css.y);
  float endpointFree = smoothstep(.005, .03, t) * (1.0 - smoothstep(.94, .995, t));
  float gutterRight = uViewport.x - 6.0;
  float gutterLeft = min(uPortrait.z + 3.0, gutterRight);
  float boundedX = clamp(css.x, gutterLeft, gutterRight);
  css.x = mix(css.x, boundedX, phone * sourceRegion * release * endpointFree);
  spine.x = (css.x / uViewport.x * 2.0 - 1.0) * viewDepth / projectionMatrix[0][0];
  return spine;
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
  float lane = (floor(aSeed.y * 19.0) - 9.0) / 9.0;
  float depth = aSeed.z * 2.0 - 1.0;
  float t = fract(aSeed.x + time * .058 + lane * .007);
  float root = 0.0;
  if (aSeed.w < .028) { t = aSeed.x * .025; root = 1.0; }
  if (aSeed.w > .972) { t = 1.0 - aSeed.x * .025; root = 1.0; }
  vec4 view = vec4(currentPath(t, coordinate, lane, depth), 1.0);
  vec4 clip = projectionMatrix * view;
  gl_Position = clip;

  float nextT = t > .997 ? t - .003 : t + .003;
  vec4 tangentClip = projectionMatrix * vec4(currentPath(nextT, coordinate, lane, depth), 1.0);
  vec2 tangent = (tangentClip.xy / max(tangentClip.w, .01) - clip.xy / max(clip.w, .01)) * uViewport;
  vAngle = atan(tangent.y, tangent.x);
  float distanceToFocus = abs(view.z + 9.0);
  vSoftness = smoothstep(.45, 2.6, distanceToFocus) * .32;
  float pointSize = mix(4.8, 7.2, aSeed.z) * (9.0 / max(-view.z, 3.0));
  gl_PointSize = clamp(pointSize * uPixelRatio * (1.0 + vSoftness), 1.0, 10.0 * uPixelRatio);

  float packet = pow(.5 + .5 * sin(TAU * (t - time * .15 + lane * .08)), 12.0);
  vec3 gold = vec3(1.0, .66, .21), ivory = vec3(1.0, .97, .78);
  vColor = mix(gold, ivory, smoothstep(.04, .48, t));
  if (aSeed.y > .81) vColor = mix(vColor, vec3(.76, 1.0, .26), .55 + packet * .3);
  vColor = mix(vColor * .8, vColor, packet);
  vAlpha = mix(.35 + packet * .5, .38, root) * (1.0 - vSoftness * .4);
  vec2 screen = (clip.xy / max(clip.w, .01) * .5 + .5) * uViewport;
  screen.y = uViewport.y - screen.y;
  float feather = mix(20.0, 30.0, smoothstep(600.0, 1200.0, uViewport.x));
  for (int index = 0; index < 24; index++) {
    if (index >= uRectCount) break;
    vAlpha *= smoothstep(6.0, feather, rectDistance(screen, uRects[index]));
  }
  float sourcePort = (1.0 - smoothstep(5.0, 34.0, distance(screen, uSource.xy))) * uSource.w;
  float targetPort = (1.0 - smoothstep(5.0, 34.0, distance(screen, uReceiver.xy))) * uReceiver.w;
  vAlpha *= mix(smoothstep(6.0, feather, rectDistance(screen, uPortrait)), 1.0, sourcePort);
  vAlpha *= mix(smoothstep(6.0, feather, rectDistance(screen, uContact)), 1.0, targetPort);
  vAlpha *= step(.01, clip.w) * smoothstep(0.0, 1.0, uSource.w) * step(.5, uReceiver.w);
}
`;

export const signalCurrentFragment = /* glsl */ `
precision highp float;
uniform vec4 uPortrait;
uniform vec4 uContact;
uniform vec2 uViewport;
uniform float uPixelRatio;
varying vec3 vColor;
varying float vAlpha;
varying float vAngle;
varying float vSoftness;
bool inside(vec2 point, vec4 rectangle) {
  return rectangle.z > rectangle.x && rectangle.w > rectangle.y &&
    point.x >= rectangle.x && point.x <= rectangle.z &&
    point.y >= rectangle.y && point.y <= rectangle.w;
}
void main() {
  vec2 screen = gl_FragCoord.xy / max(uPixelRatio, .1);
  screen.y = uViewport.y - screen.y;
  // Per-pixel protection remains exact even where a soft sprite touches a port.
  if (inside(screen, uPortrait) || inside(screen, uContact)) discard;
  vec2 point = gl_PointCoord - .5;
  float c = cos(vAngle), s = sin(vAngle);
  vec2 aligned = mat2(c, -s, s, c) * point;
  float radius = length(aligned * vec2(1.0, 2.6));
  float core = 1.0 - smoothstep(.07, .25, radius);
  float halo = (1.0 - smoothstep(.13, .49 + vSoftness * .06, radius)) * .22;
  float alpha = (core * .78 + halo) * vAlpha;
  if (alpha < .003) discard;
  gl_FragColor = vec4(vColor, alpha);
}
`;
