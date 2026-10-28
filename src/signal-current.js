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
  if (size > 0) { seeds[0] = 0; seeds[1] = .5; seeds[3] = .01; }
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
attribute vec3 aPortraitColor;
uniform float uCoordinate;
uniform float uTime;
uniform float uScroll;
uniform float uAspect;
uniform float uPixelRatio;
uniform float uReduced;
uniform vec4 uSource;
uniform vec4 uReceiver;
uniform vec4 uPortrait;
uniform vec4 uContact;
uniform vec2 uPeel;
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

vec3 currentPath(float t, float coordinate, float time, float lane, float depth, out vec3 tangent) {
  // Every strand begins on the photograph itself. The fan spans the lower
  // portrait edge rather than collapsing the whole person into one nozzle.
  float peelHeight = max(uPeel.y - uPeel.x, 0.0);
  // The center inherits the native port's offscreen bound; otherwise a long
  // record section could pull the whole fan thousands of pixels out of view.
  float peelY = uSource.y + (.01 + lane * .18) * peelHeight;
  if (aSeed.x == 0.0 && aSeed.w < .5) peelY = uSource.y;
  vec3 source = anchorInView(vec2(uSource.x, peelY));
  vec3 receiver = anchorInView(uReceiver.xy);
  float phone = 1.0 - smoothstep(.65, 1.4, uAspect);
  float side = uSource.z < 0.0 ? -1.0 : 1.0;
  // The endpoint ports stay in view space. Only the interior receives camera
  // rotation and dolly, so its perspective can change without a slipping seam.
  vec3 sculpture = (modelViewMatrix * vec4(vec3(
    .45 * sin(coordinate * 1.1), .45 * cos(coordinate * .7),
    1.6 + .8 * sin(coordinate * .85)), 0.0)).xyz;
  sculpture *= clamp(11.0 / max(length(cameraPosition), 1.0), .7, 1.3);
  float curl = sin(lane * 2.8 + coordinate * 1.4 + time * .25);
  vec3 first = source + vec3(side * mix(1.65, .42, phone), .20 + lane * .52, 0.0) + sculpture;
  first.z += depth * .6;
  vec3 second = receiver + vec3(-side * mix(1.12, .28, phone), 1.35, 0.0) - sculpture * .6;
  float q = 1.0 - t;
  vec3 spine = q * q * q * source + 3.0 * q * q * t * first +
    3.0 * q * t * t * second + t * t * t * receiver;
  tangent = 3.0 * q * q * (first - source) + 6.0 * q * t * (second - first) +
    3.0 * t * t * (receiver - second);
  float envelope = sin(t * 3.14159265359);
  float envelopeDerivative = 3.14159265359 * cos(t * 3.14159265359);
  // A tightening final turn gathers the same coloured grain at the receiver.
  float gatherPosition = clamp((t - .68) / .29, 0.0, 1.0);
  float gather = gatherPosition * gatherPosition * (3.0 - 2.0 * gatherPosition);
  float gatherDerivative = 6.0 * gatherPosition * (1.0 - gatherPosition) / .29;
  float baseWidth = mix(.64, .26, phone) * (1.0 + curl * .12);
  float width = baseWidth * (1.0 - .4 * gather);
  float widthDerivative = -.4 * baseWidth * gatherDerivative;
  float filament = lane * width * envelope;
  float filamentDerivative = lane * (widthDerivative * envelope + width * envelopeDerivative);
  float frequency = 8.0 + coordinate * .55;
  float helix = t * frequency + lane * 2.2 + time * .12 + gather * 5.5;
  float helixDerivative = frequency + gatherDerivative * 5.5;
  float c = cos(helix), s = sin(helix);
  spine += vec3(filament * c, filament * s, depth * .68 * envelope);
  tangent += vec3(filamentDerivative * c - filament * s * helixDerivative,
    filamentDerivative * s + filament * c * helixDerivative, depth * .68 * envelopeDerivative);
  // On phones the attached stream follows the photograph's exterior gutter,
  // then releases into the open space below it instead of leaving the screen.
  float viewDepth = max(-spine.z, .01);
  vec2 css = vec2(
    (spine.x * projectionMatrix[0][0] / viewDepth * .5 + .5) * uViewport.x,
    (.5 - spine.y * projectionMatrix[1][1] / viewDepth * .5) * uViewport.y);
  float peelTop = uSource.y - peelHeight * .17;
  float sourceRegion = smoothstep(peelTop - 24.0, peelTop + 12.0, css.y);
  float release = 1.0 - smoothstep(uPortrait.w + 10.0, uPortrait.w + 70.0, css.y);
  float endpointFree = smoothstep(.005, .03, t) * (1.0 - smoothstep(.94, .995, t));
  float gutterRight = uViewport.x - 6.0;
  float gutterLeft = min(uPortrait.z + 3.0, gutterRight);
  float boundedX = clamp(css.x, gutterLeft, gutterRight);
  css.x = mix(css.x, boundedX, phone * sourceRegion * release * endpointFree);
  spine.x = (css.x / uViewport.x * 2.0 - 1.0) * viewDepth / projectionMatrix[0][0];
  // The phone gutter is nearly vertical; align its sprites with that rail.
  tangent.x *= 1.0 - phone * sourceRegion * release * endpointFree;
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
  float lane = aSeed.y * 2.0 - 1.0;
  float depth = aSeed.z * 2.0 - 1.0;
  float travel = time * .042 + uScroll * .22 * (1.0 - reduced);
  float t = fract(aSeed.x + travel + lane * .007);
  float root = 0.0;
  if (aSeed.w < .07) { t = fract(aSeed.x + travel * 1.6) * .065; root = 1.0; }
  if (aSeed.w > .972) { t = 1.0 - aSeed.x * .025; root = 1.0; }
  // Preserve two exact registration seeds while the rest continuously peel.
  if (aSeed.x == 0.0) t = aSeed.w < .5 ? 0.0 : 1.0;
  vec3 derivative;
  vec4 view = vec4(currentPath(t, coordinate, time, lane, depth, derivative), 1.0);
  vec4 clip = projectionMatrix * view;
  gl_Position = clip;

  // Analytic projected derivative avoids evaluating the entire 3D path twice
  // per particle, leaving budget for the broader peel and layered volume.
  float viewDepth = max(-view.z, .01);
  vec2 tangent = (derivative.xy * viewDepth + view.xy * derivative.z) *
    vec2(projectionMatrix[0][0], projectionMatrix[1][1]) * uViewport;
  vAngle = atan(tangent.y, tangent.x);
  float distanceToFocus = abs(view.z + 9.0);
  vSoftness = smoothstep(.45, 2.6, distanceToFocus) * .32;
  float pointSize = mix(5.2, 8.6, aSeed.z) * (9.0 / max(-view.z, 3.0));
  gl_PointSize = clamp(pointSize * uPixelRatio * (1.0 + vSoftness), 1.0, 11.0 * uPixelRatio);

  float packet = pow(.5 + .5 * sin(TAU * (t - travel * 1.7 + lane * .09)), 8.0);
  // Birth colour is sampled from the real image and retained to contact.
  vColor = aPortraitColor * mix(.90, 1.08, packet);
  vAlpha = mix(.40 + packet * .4, .48, root) * (1.0 - vSoftness * .4);
  vec2 screen = (clip.xy / max(clip.w, .01) * .5 + .5) * uViewport;
  screen.y = uViewport.y - screen.y;
  float feather = mix(20.0, 30.0, smoothstep(600.0, 1200.0, uViewport.x));
  for (int index = 0; index < 24; index++) {
    if (index >= uRectCount) break;
    vAlpha *= smoothstep(6.0, feather, rectDistance(screen, uRects[index]));
  }
  float peelHeight = max(uPeel.y - uPeel.x, 0.0);
  vec2 edgePoint = vec2(uSource.x, clamp(screen.y, uSource.y - peelHeight * .17, uSource.y + peelHeight * .19));
  float sourcePort = (1.0 - smoothstep(3.0, 30.0, distance(screen, edgePoint))) * uSource.w;
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
  float radius = length(aligned * vec2(1.0, 2.05));
  float core = 1.0 - smoothstep(.07, .25, radius);
  float halo = (1.0 - smoothstep(.13, .49 + vSoftness * .06, radius)) * .22;
  float alpha = (core * .78 + halo) * vAlpha;
  if (alpha < .003) discard;
  gl_FragColor = vec4(vColor, alpha);
}
`;
