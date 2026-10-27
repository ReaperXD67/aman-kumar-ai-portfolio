import { Component, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import * as THREE from "three";

const COLORS = ["#ff673d", "#d8ff4f", "#8bb8ff"];

// Shared GPU field: a sensor fan folds into a reasoning braid, then an execution vector.
const field = `
uniform float uTime; uniform float uMode; uniform float uIntro;
uniform vec2 uPointer; uniform vec3 uColor;
vec3 loom(float t, float lane) {
  float x = (t - 0.5) * 12.8;
  float sweep = sin(t * 3.14159265);
  vec3 sensor = vec3(x, lane * 2.8 + sin(t * 5.5 + lane * 1.2) * 0.32,
    cos(lane * 2.5 + t * 3.0) * 0.75);
  float phase = t * 8.9 + lane * 1.7;
  vec3 braid = vec3(x * 0.9, sin(phase) * (1.65 + lane * 0.18),
    cos(phase) * (1.65 + lane * 0.18));
  float funnel = pow(max(0.0, 1.0 - t), 1.45);
  vec3 vector = vec3(x, lane * 3.1 * funnel + sin(t * 5.0) * 0.28,
    sin(lane * 3.0) * funnel * 1.2);
  vec3 p = sensor * max(0.0, 1.0 - uMode)
    + braid * max(0.0, 1.0 - abs(uMode - 1.0))
    + vector * max(0.0, uMode - 1.0);
  p.y += sin(t * 13.0 + lane * 3.0 + uTime * 0.45) * 0.075 * sweep;
  float d = length(p.xy - uPointer * vec2(5.0, 3.0));
  p.z += exp(-d * d * 0.32) * 0.75 * sweep;
  p.y += uPointer.y * sweep * 0.32;
  vec3 scattered = p * 1.28 + vec3(lane * 3.0, sin(lane * 20.0) * 2.0, -3.0);
  return mix(scattered, p, uIntro);
}`;

const ribbonVertex = `${field}
attribute float aT; attribute float aLane; attribute float aSide; attribute float aSignal;
varying vec3 vNormal; varying vec3 vEye;
varying float vT; varying float vSide; varying float vSignal; varying float vLane;
void main() {
  vec3 p = loom(aT, aLane);
  vec3 tangent = normalize(loom(aT + 0.002, aLane) - p);
  vec3 difference = loom(aT, aLane + 0.008) - p;
  vec3 across = length(difference) > 0.00001 ? normalize(difference) : vec3(0.0, 1.0, 0.0);
  float width = mix(0.014, 0.026, aSignal) * (0.4 + sin(aT * 3.14159) * 0.6);
  p += across * aSide * width;
  vec4 view = modelViewMatrix * vec4(p, 1.0);
  vec3 surfaceNormal = cross(tangent, across);
  if (length(surfaceNormal) < 0.00001) surfaceNormal = vec3(0.0, 0.0, 1.0);
  vNormal = normalize(normalMatrix * surfaceNormal);
  vEye = normalize(-view.xyz);
  vT = aT; vSide = aSide; vSignal = aSignal; vLane = aLane;
  gl_Position = projectionMatrix * view;
}`;

const ribbonFragment = `
precision highp float;
uniform float uTime; uniform vec3 uColor;
varying vec3 vNormal; varying vec3 vEye;
varying float vT; varying float vSide; varying float vSignal; varying float vLane;
void main() {
  vec3 normal = normalize(vNormal) * (gl_FrontFacing ? 1.0 : -1.0);
  vec3 eye = normalize(vEye);
  vec3 light = normalize(vec3(-0.5, 0.9, 1.2));
  float diffuse = max(dot(normal, light), 0.0);
  float rim = pow(clamp(1.0 - abs(dot(normal, eye)), 0.0, 1.0), 2.0);
  float specular = pow(max(dot(reflect(-light, normal), eye), 0.0), 48.0);
  vec3 titanium = mix(vec3(0.045, 0.055, 0.063), vec3(0.56, 0.67, 0.73), diffuse);
  titanium += specular * vec3(1.1, 1.2, 1.3) + rim * 0.3;
  float edge = smoothstep(0.65, 1.0, abs(vSide));
  float signal = vSignal * (0.5 + edge * 0.7);
  float packet = pow(max(0.0, sin(vT * 20.0 - uTime * 1.7 + vLane * 2.0)), 28.0);
  vec3 color = mix(titanium, uColor * (0.7 + rim * 0.8), signal * 0.75);
  color += uColor * (edge * vSignal * 0.9 + packet * vSignal * 1.7);
  gl_FragColor = vec4(color, 1.0);
}`;

const particleVertex = `${field}
attribute float aT; attribute float aLane; attribute float aSeed;
varying float vAlpha; varying float vSeed;
void main() {
  float t = fract(aT + uTime * (0.017 + aSeed * 0.012));
  vec3 p = loom(t, aLane);
  float radius = 0.12 + aSeed * aSeed * 1.1;
  p += vec3(sin(aSeed * 51.0), cos(aSeed * 33.0), sin(aSeed * 19.0)) * radius;
  vec4 view = modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = clamp((16.0 + aSeed * 14.0) / -view.z, 1.0, 3.5);
  gl_Position = projectionMatrix * view;
  vAlpha = sin(t * 3.14159265) * (0.22 + aSeed * 0.5); vSeed = aSeed;
}`;

const particleFragment = `
precision highp float;
uniform vec3 uColor;
varying float vAlpha; varying float vSeed;
void main() {
  float radius = length(gl_PointCoord - 0.5);
  if (radius > 0.5) discard;
  float alpha = pow(1.0 - radius * 2.0, 1.7) * vAlpha;
  gl_FragColor = vec4(mix(vec3(0.72, 0.83, 0.91), uColor, step(0.67, vSeed)), alpha);
}`;

function makeRibbons() {
  const lanes = 144, segments = 144, count = lanes * (segments + 1) * 2;
  const ts = new Float32Array(count), lane = new Float32Array(count);
  const sides = new Float32Array(count), signals = new Float32Array(count), indices = [];
  for (let i = 0; i < lanes; i++) for (let j = 0; j <= segments; j++) for (let side = 0; side < 2; side++) {
    const index = (i * (segments + 1) + j) * 2 + side;
    ts[index] = j / segments; lane[index] = i / (lanes - 1) * 2 - 1;
    sides[index] = side * 2 - 1; signals[index] = i % 11 === 0 || i % 17 === 3 ? 1 : 0;
    if (j < segments && side === 0) indices.push(index, index + 1, index + 2, index + 1, index + 3, index + 2);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
  for (const [name, array] of [["aT", ts], ["aLane", lane], ["aSide", sides], ["aSignal", signals]]) geometry.setAttribute(name, new THREE.BufferAttribute(array, 1));
  geometry.setIndex(indices);
  return geometry;
}

function makeParticles(count) {
  const geometry = new THREE.BufferGeometry();
  const ts = new Float32Array(count), lanes = new Float32Array(count), seeds = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    ts[i] = ((i * 7919 + 104729) % 65521) / 65521;
    lanes[i] = ((i * 2371 + 2039) % 32749) / 32749 * 2 - 1;
    seeds[i] = ((i * 4423 + 523) % 16381) / 16381;
  }
  geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
  for (const [name, array] of [["aT", ts], ["aLane", lanes], ["aSeed", seeds]]) geometry.setAttribute(name, new THREE.BufferAttribute(array, 1));
  return geometry;
}

function Loom({ mode, reducedMotion, paused, skipBoot, onBoot }) {
  const group = useRef(), elapsed = useRef(skipBoot || reducedMotion ? 3 : 0);
  const materials = useRef([]);
  const bootComplete = useRef(skipBoot || reducedMotion);
  const { pointer, size, viewport, invalidate } = useThree();
  const compact = size.width < 800;
  const ribbons = useMemo(makeRibbons, []);
  const particles = useMemo(() => makeParticles(compact ? 2800 : 6800), [compact]);
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uMode: { value: mode },
    uIntro: { value: skipBoot || reducedMotion ? 1 : 0 },
    uPointer: { value: new THREE.Vector2() }, uColor: { value: new THREE.Color(COLORS[mode]) } }), []);
  const color = useMemo(() => new THREE.Color(), []), zero = useMemo(() => new THREE.Vector2(), []);
  useEffect(() => { invalidate(); }, [mode, paused, reducedMotion, invalidate]);
  useEffect(() => () => { ribbons.dispose(); }, [ribbons]);
  useEffect(() => () => { particles.dispose(); }, [particles]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05), settle = paused || reducedMotion;
    if (!settle) elapsed.current += dt;
    uniforms.uTime.value = reducedMotion ? 0 : elapsed.current;
    uniforms.uIntro.value = settle ? 1 : THREE.MathUtils.smoothstep(elapsed.current, 0, 1.8);
    uniforms.uMode.value = settle ? mode : THREE.MathUtils.damp(uniforms.uMode.value, mode, 2.8, dt);
    uniforms.uColor.value.lerp(color.set(COLORS[mode]), settle ? 1 : Math.min(1, dt * 3));
    uniforms.uPointer.value.lerp(settle ? zero : pointer, settle ? 1 : Math.min(1, dt * 4));
    // R3F can reconcile a material's uniforms separately from the supplied object.
    // Synchronize scalar values on the actual GPU materials as well as shared colors.
    for (const material of materials.current) {
      if (!material) continue;
      material.uniforms.uTime.value = uniforms.uTime.value;
      material.uniforms.uMode.value = uniforms.uMode.value;
      material.uniforms.uIntro.value = uniforms.uIntro.value;
      material.uniforms.uPointer.value.copy(uniforms.uPointer.value);
      material.uniforms.uColor.value.copy(uniforms.uColor.value);
      material.uniformsNeedUpdate = true;
    }
    if (!bootComplete.current && elapsed.current > 1.8) { bootComplete.current = true; onBoot(); }
    if (group.current) {
      group.current.scale.setScalar(compact ? Math.max(0.43, viewport.width / 15) : 1);
      group.current.position.set(compact ? 0.2 : viewport.width * 0.15, compact ? 1.0 : 0.45, 0);
      group.current.rotation.z = compact ? -0.72 : -0.32;
      group.current.rotation.x = settle ? 0.1 : THREE.MathUtils.damp(group.current.rotation.x, pointer.y * 0.22 + 0.1, 3, dt);
      group.current.rotation.y = settle ? -0.1 : THREE.MathUtils.damp(group.current.rotation.y, pointer.x * 0.28 - 0.1, 3, dt);
    }
  });
  return <group ref={group}>
    <mesh geometry={ribbons} frustumCulled={false}><shaderMaterial ref={value => { materials.current[0] = value; }} uniforms={uniforms} vertexShader={ribbonVertex} fragmentShader={ribbonFragment} side={THREE.DoubleSide} toneMapped={false} /></mesh>
    <points geometry={particles} frustumCulled={false}><shaderMaterial ref={value => { materials.current[1] = value; }} uniforms={uniforms} vertexShader={particleVertex} fragmentShader={particleFragment} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} /></points>
  </group>;
}

class LoomBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <div className="loom-unavailable"><strong>Observe. Reason. Execute.</strong><span>The engineering is still here. Explore the work below.</span></div> : this.props.children; }
}

export function SignalCore({ mode, reducedMotion, paused = false, onCycle }) {
  const shell = useRef(null), booted = useRef(false);
  const [visible, setVisible] = useState(true);
  const [dpr, setDpr] = useState(1);
  useEffect(() => {
    let near = true;
    const update = () => setVisible(near && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => { near = entry.isIntersecting; update(); }, { rootMargin: "100px" });
    observer.observe(shell.current);
    const resize = new ResizeObserver(([entry]) => {
      const area = Math.max(1, entry.contentRect.width * entry.contentRect.height);
      setDpr(Math.min(window.devicePixelRatio || 1, 1.35, Math.sqrt(2_200_000 / area)));
    });
    resize.observe(shell.current);
    document.addEventListener("visibilitychange", update);
    return () => { observer.disconnect(); resize.disconnect(); document.removeEventListener("visibilitychange", update); };
  }, []);
  return <div className="signal-core-shell" ref={shell} onClick={onCycle} aria-hidden="true"><LoomBoundary>
    {visible && <Canvas className="signal-canvas" camera={{ position: [0, 0, 15.8], fov: 40 }} dpr={dpr} frameloop={paused || reducedMotion ? "demand" : "always"} gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}>
      <Loom mode={mode} reducedMotion={reducedMotion} paused={paused} skipBoot={booted.current} onBoot={() => { booted.current = true; }} />
      {!reducedMotion && <EffectComposer multisampling={0}><Bloom luminanceThreshold={0.8} luminanceSmoothing={0.6} intensity={0.55} mipmapBlur /></EffectComposer>}
    </Canvas>}
  </LoomBoundary></div>;
}
