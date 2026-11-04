// Original analytical particle current: immutable seeds, shader-only travel and morphs.
import { portraitContourRows } from "./portrait-colours.js";
const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const coordinateOf = value => Number.isFinite(value) ? clamp(value, 0, 4) : 0;

// Redistribute the existing budget toward the two physical handoffs. No extra
// geometry, draw call, texture or per-frame buffer upload is needed.
export const signalCurrentCohorts = Object.freeze({ source: .14, receiver: .10, name: .48 });

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

const silhouetteShader = /* glsl */ `
uniform float uSilhouette;
uniform float uPortraitRight[${portraitContourRows}];
float portraitRightAt(float screenY) {
  float row = clamp((screenY - uPortrait.y) / max(uPortrait.w - uPortrait.y, 1.0), 0.0, 1.0) * ${portraitContourRows - 1}.0;
  int low = int(floor(row));
  int high = min(low + 1, ${portraitContourRows - 1});
  float edge = mix(uPortraitRight[low], uPortraitRight[high], fract(row));
  return mix(uPortrait.z, mix(uPortrait.x, uPortrait.z, edge), uSilhouette);
}
`;

export const signalCurrentVertex = /* glsl */ `
precision highp float;
attribute vec4 aSeed;
attribute vec3 aPortraitColor;
attribute vec2 aPortraitBirth;
attribute vec3 aTypeOrigin;
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
uniform float uTypeEnabled;
uniform vec2 uTypeProgress;
uniform vec2 uTypeOrigin;
uniform vec4 uTypeFrames[2];
uniform vec4 uTypePoses[2];
varying vec3 vColor;
varying float vAlpha;
varying float vAngle;
varying float vSoftness;
varying vec2 vBirth;
const float TAU = 6.28318530718;
${silhouetteShader}

vec2 birthPoint() {
  float height = max(uPeel.y - uPeel.x, 0.0);
  float edge = mix(1.0, aPortraitBirth.x, uSilhouette);
  // uSource retains its bounded rectangle registration. The static UV adds
  // the actual silhouette offset, then releases just outside its native alpha.
  return vec2(uSource.x + (edge - 1.0) * (uPortrait.z - uPortrait.x) + uSilhouette,
    uPeel.x + aPortraitBirth.y * height);
}

vec3 anchorInView(vec2 css) {
  vec2 ndc = vec2(css.x / uViewport.x * 2.0 - 1.0, 1.0 - css.y / uViewport.y * 2.0);
  return vec3(ndc.x * 9.0 / projectionMatrix[0][0], ndc.y * 9.0 / projectionMatrix[1][1], -9.0);
}

vec2 nameBirthPoint() {
  int row = int(aTypeOrigin.z + .5);
  vec4 frame = uTypeFrames[row], pose = uTypePoses[row];
  vec2 local = (aTypeOrigin.xy - .5) * frame.zw;
  // Same centered rotateY, translation and 1200px rear perspective as CSS.
  float z = pose.z - sin(pose.w) * local.x;
  vec2 rotated = vec2(cos(pose.w) * local.x,local.y);
  vec2 point = frame.xy + frame.zw * .5 + pose.xy + rotated;
  return uTypeOrigin + (point - uTypeOrigin) * (1200.0 / (1200.0 - z));
}

vec3 currentPath(float t, float coordinate, float time, float lane, float depth, out vec3 tangent) {
  // Every strand begins on the photograph itself. The fan spans the lower
  // portrait edge rather than collapsing the whole person into one nozzle.
  float peelHeight = max(uPeel.y - uPeel.x, 0.0);
  // The center inherits the native port's offscreen bound; otherwise a long
  // record section could pull the whole fan thousands of pixels out of view.
  vec3 source = anchorInView(birthPoint());
  vec3 receiver = anchorInView(uReceiver.xy);
  float phone = 1.0 - smoothstep(.65, 1.4, uAspect);
  float side = uSource.z < 0.0 ? -1.0 : 1.0;
  // The endpoint ports stay in view space. Only the interior receives camera
  // rotation and dolly, so its perspective can change without a slipping seam.
  vec3 sculpture = (modelViewMatrix * vec4(vec3(
    .45 * sin(coordinate * 1.1), .45 * cos(coordinate * .7),
    1.6 + .8 * sin(coordinate * .85)), 0.0)).xyz;
  sculpture *= clamp(11.0 / max(length(cameraPosition), 1.0), .7, 1.3);
  float curl = sin(lane * 2.8 + coordinate * 1.4 + time * .08);
  vec3 first = source + vec3(side * mix(1.42, .38, phone), .12 + lane * .24, 0.0) + sculpture;
  first.z += depth * .35;
  vec3 second = receiver + vec3(-side * mix(1.12, .28, phone), 1.35, 0.0) - sculpture * .6;
  float q = 1.0 - t;
  vec3 spine = q * q * q * source + 3.0 * q * q * t * first +
    3.0 * q * t * t * second + t * t * t * receiver;
  tangent = 3.0 * q * q * (first - source) + 6.0 * q * t * (second - first) +
    3.0 * t * t * (receiver - second);
  float envelope = sin(t * 3.14159265359);
  float envelopeDerivative = 3.14159265359 * cos(t * 3.14159265359);
  // A tightening final turn gathers the same coloured grain at the receiver.
  float gatherPosition = clamp((t - .56) / .43, 0.0, 1.0);
  float gather = gatherPosition * gatherPosition * (3.0 - 2.0 * gatherPosition);
  float gatherDerivative = 6.0 * gatherPosition * (1.0 - gatherPosition) / .43;
  float baseWidth = mix(.46, .18, phone) * (1.0 + curl * .08);
  float width = baseWidth * (1.0 - .62 * gather);
  float widthDerivative = -.62 * baseWidth * gatherDerivative;
  // A smooth, finite-volume receiver coil grows before it contracts into the
  // measured form port. Its value AND derivative vanish at both boundaries.
  float coilPosition = clamp((t - .60) / .40, 0.0, 1.0);
  float coil = 16.0 * coilPosition * coilPosition * pow(1.0 - coilPosition, 2.0);
  float coilDerivative = 32.0 * coilPosition * (1.0 - coilPosition) * (1.0 - 2.0 * coilPosition) / .40;
  float coilWidth = mix(.50, .22, phone);
  float filament = lane * (width * envelope + coilWidth * coil);
  float filamentDerivative = lane * (widthDerivative * envelope + width * envelopeDerivative + coilWidth * coilDerivative);
  float frequency = 3.4 + coordinate * .22;
  float helix = t * frequency + lane * 2.2 + time * .08 + gather * 6.3;
  float helixDerivative = frequency + gatherDerivative * 6.3;
  float c = cos(helix), s = sin(helix);
  spine += vec3(filament * c, filament * s, depth * .42 * envelope);
  tangent += vec3(filamentDerivative * c - filament * s * helixDerivative,
    filamentDerivative * s + filament * c * helixDerivative, depth * .42 * envelopeDerivative);
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
  float gutterLeft = min(portraitRightAt(css.y) + 3.0, gutterRight);
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
  // Twelve coherent fibres carry independently travelling grains. The birth
  // UV remains continuous across the real contour; only the distant path is
  // gathered into strands, rather than filling a random cylindrical volume.
  float fiber = (floor(aSeed.y * 12.0) + .5) / 12.0 * 2.0 - 1.0;
  float lane = fiber + (fract(aSeed.y * 12.0) - .5) * .035;
  float depth = sin(fiber * 4.15) * .28 + (aSeed.z * 2.0 - 1.0) * .025;
  float travel = time * .014 + uScroll * .48 * (1.0 - reduced);
  float t = fract(aSeed.x + travel + lane * .007);
  float root = 0.0;
  // Recycle the travelling cohort invisibly. Dedicated endpoint cohorts below
  // keep the contour peel and contact gather full through each periodic wrap.
  float lifetime = smoothstep(0.0, .018, t) * (1.0 - smoothstep(.975, 1.0, t));
  if (aSeed.w < ${signalCurrentCohorts.source}) {
    float phase = fract(aSeed.x + travel * 1.6);
    t = phase * .16;
    root = 1.0;
    lifetime = smoothstep(0.0, .06, phase) * (1.0 - smoothstep(.82, 1.0, phase));
  }
  if (aSeed.w > ${1 - signalCurrentCohorts.receiver}) {
    float phase = fract(aSeed.x + travel * .85);
    t = .74 + (1.0 - (1.0 - phase) * (1.0 - phase)) * .26;
    root = 1.0;
    lifetime = smoothstep(0.0, .08, phase) * (1.0 - smoothstep(.94, 1.0, phase));
  }
  // Preserve two exact registration seeds while the rest continuously peel.
  if (aSeed.x == 0.0) { t = aSeed.w < .5 ? 0.0 : 1.0; lifetime = 1.0; }
  // Borrow 48% from the travelling cohort; the contour roots and receiver
  // remain intact. These are actual glyph pixels, not an unrelated emitter.
  float name = uTypeEnabled * step(${signalCurrentCohorts.source},aSeed.w) * (1.0 - step(${signalCurrentCohorts.source + signalCurrentCohorts.name},aSeed.w));
  float release = 0.0;
  if (name > .5) {
    float row = aTypeOrigin.z;
    float phase = mix(uTypeProgress.x,uTypeProgress.y,row);
    float edge = mix(aTypeOrigin.x,1.0-aTypeOrigin.x,row);
    release = clamp((phase - (.04 + .60 * clamp(edge,0.0,1.0) + .025 * aSeed.z)) / .335,0.0,1.0);
    float gather = smoothstep(1.15,4.0,uScroll);
    // Keep the gathered letters distributed around the receiver coil. Exact
    // arrivals still belong to the dedicated moving receiver cohort/sentinel.
    t = mix(release * (.15 + .45 * aSeed.x), .74 + .255 * aSeed.x,gather);
    lifetime = smoothstep(0.0,.06,release);
  }
  vBirth = birthPoint();
  vec3 derivative;
  vec4 view = vec4(currentPath(t, coordinate, time, lane, depth, derivative), 1.0);
  if (name > .5) {
    vec2 birth = nameBirthPoint();
    // Outside the portrait passage the cohort is fully inside the shared
    // spine, so distant native text coordinates cannot drag the current away.
    float join = smoothstep(0.0,1.0,release);
    vec3 origin = anchorInView(birth);
    float side = birth.x < (uPortrait.x + uPortrait.z) * .5 ? -1.0 : 1.0;
    vec3 first = origin + vec3(side * .65,-.24,-.35);
    vec3 second = anchorInView(vec2(side < 0.0 ? uPortrait.x - 28.0 : uPortrait.z + 28.0,uPortrait.w + 28.0));
    second.z -= .35 + aSeed.z * .3;
    // Curl around the person's outside edge before entering the shared spine;
    // a straight crossfade would send the left letters invisibly through him.
    float q = 1.0 - join;
    vec3 handoffTangent = 3.0*q*q*(first-origin) + 6.0*q*join*(second-first) + 3.0*join*join*(view.xyz-second);
    view.xyz = q*q*q*origin + 3.0*q*q*join*first + 3.0*q*join*join*second + join*join*join*view.xyz;
    // A full spatial turn grows out of the letter and settles into the current.
    // The envelope and derivative vanish at both ends, preserving registration
    // and avoiding a kink when native scrolling reverses the handoff.
    float envelope = 16.0 * join * join * q * q;
    float envelopeDerivative = 32.0 * join * q * (1.0 - 2.0 * join);
    float radius = mix(.58,.18,1.0 - smoothstep(.65,1.4,uAspect));
    float turn = TAU * 1.15;
    float angle = join * turn + fiber * .9 + time * .12;
    float c = cos(angle), s = sin(angle);
    vec3 orbit = vec3(side * (.35 + c),s * .8,c * .7);
    vec3 orbitDerivative = vec3(-side * s,c * .8,-s * .7) * turn;
    view.xyz += orbit * radius * envelope;
    handoffTangent += radius * (orbit * envelopeDerivative + orbitDerivative * envelope);
    derivative = mix(handoffTangent,derivative,smoothstep(.8,1.0,join));
  }
  vec4 clip = projectionMatrix * view;
  gl_Position = clip;

  // Analytic projected derivative avoids evaluating the entire 3D path twice
  // per particle, leaving budget for the broader peel and layered volume.
  float viewDepth = max(-view.z, .01);
  vec2 tangent = (derivative.xy * viewDepth + view.xy * derivative.z) *
    vec2(projectionMatrix[0][0], projectionMatrix[1][1]) * uViewport;
  vAngle = atan(tangent.y, tangent.x);
  float distanceToFocus = abs(view.z + 9.0);
  vSoftness = smoothstep(.45, 2.6, distanceToFocus) * .16;
  float pointSize = mix(5.2, 8.4, aSeed.z) * mix(1.0,.92,name * (1.0-release)) * (9.0 / max(-view.z, 3.0));
  gl_PointSize = clamp(pointSize * uPixelRatio * (1.0 + vSoftness), 1.0, 9.0 * uPixelRatio);

  float packet = pow(.5 + .5 * sin(TAU * (t - travel * 1.7 + lane * .09)), 8.0);
  // Birth colour is sampled from the real image and retained to contact.
  vColor = aPortraitColor * mix(.94, 1.0, packet);
  vAlpha = mix(mix(.64 + packet * .22, .80, root),.98 - .14 * smoothstep(.65,.98,t),name) * lifetime * (1.0 - vSoftness * .3);
  vec2 screen = (clip.xy / max(clip.w, .01) * .5 + .5) * uViewport;
  screen.y = uViewport.y - screen.y;
  float feather = mix(20.0, 30.0, smoothstep(600.0, 1200.0, uViewport.x));
  for (int index = 0; index < 24; index++) {
    if (index >= uRectCount) break;
    vAlpha *= smoothstep(6.0, feather, rectDistance(screen, uRects[index]));
  }
  float peelHeight = max(uPeel.y - uPeel.x, 0.0);
  float edgeY = clamp(screen.y, uSource.y - peelHeight * .17, uSource.y + peelHeight * .19);
  vec2 edgePoint = vec2(portraitRightAt(edgeY), edgeY);
  float sourcePort = (1.0 - smoothstep(3.0, 30.0, distance(screen, edgePoint))) * uSource.w;
  float targetPort = (1.0 - smoothstep(5.0, 34.0, distance(screen, uReceiver.xy))) * uReceiver.w;
  float portraitDistance = rectDistance(screen, uPortrait);
  if (uSilhouette > .5 && screen.y >= uPortrait.y && screen.y <= uPortrait.w) {
    // Protect the interior, not the entire half-plane left of the contour:
    // glyph grains peeling outside the photo's left edge must remain visible.
    portraitDistance = max(uPortrait.x - screen.x,screen.x - portraitRightAt(screen.y));
  }
  vAlpha *= mix(smoothstep(6.0, feather, portraitDistance), 1.0, sourcePort);
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
varying vec2 vBirth;
${silhouetteShader}
bool inside(vec2 point, vec4 rectangle) {
  return rectangle.z > rectangle.x && rectangle.w > rectangle.y &&
    point.x >= rectangle.x && point.x <= rectangle.z &&
    point.y >= rectangle.y && point.y <= rectangle.w;
}
void main() {
  vec2 screen = gl_FragCoord.xy / max(uPixelRatio, .1);
  screen.y = uViewport.y - screen.y;
  if (inside(screen, uContact)) discard;
  if (inside(screen, uPortrait)) {
    if (uSilhouette < .5) discard;
    // The native alpha image is the exact foreground mask. This coarse guard
    // also shields its interior. A small birth corridor avoids severing roots
    // where a 32-row outline undersamples a curved shoulder; the image itself
    // still occludes every occupied face/body pixel through compositor scroll.
    bool birthCorridor = distance(screen, vBirth) < 14.0 && screen.x >= vBirth.x - .5;
    if (screen.x <= portraitRightAt(screen.y) && !birthCorridor) discard;
  }
  vec2 point = gl_PointCoord - .5;
  float c = cos(vAngle), s = sin(vAngle);
  vec2 aligned = mat2(c, -s, s, c) * point;
  float radius = length(aligned * vec2(.8, 2.3));
  float core = 1.0 - smoothstep(.14, .39, radius);
  float halo = (1.0 - smoothstep(.28, .49 + vSoftness * .06, radius)) * .16;
  float alpha = min(1.0, core * .94 + halo) * vAlpha;
  if (alpha < .003) discard;
  gl_FragColor = vec4(vColor, alpha);
}
`;
