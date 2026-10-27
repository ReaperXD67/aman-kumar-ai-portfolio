import { Component, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const COLORS = ["#ff673d", "#d8ff4f", "#8bb8ff"];

// Shared GPU field: a sensor fan folds into a reasoning braid, then an execution vector.
const field = `
uniform float uTime; uniform float uMode; uniform float uIntro; uniform float uExit;
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
  vec3 forward = vec3((t - 0.5) * 19.0, lane * 0.23, sin(lane * 4.0) * 0.12);
  p = mix(p, forward, uExit * uExit);
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
  float width = mix(0.013, 0.063, aSignal) * (0.4 + sin(aT * 3.14159) * 0.6);
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
  vec3 fill = normalize(vec3(0.8, -0.1, -1.0));
  float diffuse = max(dot(normal, light), 0.0);
  float rim = pow(clamp(1.0 - abs(dot(normal, eye)), 0.0, 1.0), 2.0);
  float specular = pow(max(dot(reflect(-light, normal), eye), 0.0), 48.0);
  float cold = max(dot(normal, fill), 0.0);
  float brushing = sin(vT * 1100.0 + vLane * 17.0) * 0.018;
  vec3 titanium = mix(vec3(0.032, 0.043, 0.05), vec3(0.48, 0.6, 0.66), diffuse);
  titanium += cold * vec3(0.1, 0.17, 0.25) + brushing;
  titanium += specular * vec3(1.1, 1.2, 1.3) + rim * 0.3;
  float edge = smoothstep(0.65, 1.0, abs(vSide));
  float signal = vSignal * (0.5 + edge * 0.7);
  float packet = pow(max(0.0, sin(vT * 20.0 - uTime * 1.7 + vLane * 2.0)), 28.0);
  vec3 color = mix(titanium, uColor * (0.7 + rim * 0.8), signal * 0.75);
  color += uColor * (edge * vSignal * 0.65 + packet * vSignal * 1.5);
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

// A bevelled, open octagonal frame: structural cross-sections, never orbital rings.
function makeAperture() {
  const outline = (width, height, bevel) => [
    [-width + bevel, -height], [width - bevel, -height], [width, -height + bevel],
    [width, height - bevel], [width - bevel, height], [-width + bevel, height],
    [-width, height - bevel], [-width, -height + bevel],
  ];
  const shape = new THREE.Shape();
  const outer = outline(1.16, 1, 0.22);
  shape.moveTo(...outer[0]);
  outer.slice(1).forEach(point => shape.lineTo(...point));
  shape.closePath();
  const hole = new THREE.Path();
  const inner = outline(1.015, 0.855, 0.18).reverse();
  hole.moveTo(...inner[0]);
  inner.slice(1).forEach(point => hole.lineTo(...point));
  hole.closePath(); shape.holes.push(hole);
  const geometry = new THREE.ExtrudeGeometry(shape, { depth: 0.11, bevelEnabled: true,
    bevelSegments: 2, steps: 1, bevelSize: 0.028, bevelThickness: 0.024, curveSegments: 1 });
  geometry.center(); geometry.rotateY(Math.PI / 2);
  return geometry;
}

function Loom({ mode, reducedMotion, paused, skipBoot, onBoot, journey }) {
  const group = useRef(), elapsed = useRef(skipBoot || reducedMotion ? 3 : 0);
  const ribs = useRef([]), fins = useRef([]), progress = useRef(0);
  const materials = useRef([]);
  const bootComplete = useRef(skipBoot || reducedMotion);
  const { pointer, size, viewport, invalidate, camera, gl, scene } = useThree();
  const compact = size.width < 800;
  const landscape = size.width / Math.max(1, size.height) > 1.65 && size.height < 650;
  const ribbons = useMemo(makeRibbons, []);
  const particles = useMemo(() => makeParticles(compact ? 2800 : 6800), [compact]);
  const aperture = useMemo(makeAperture, []);
  const edges = useMemo(() => new THREE.EdgesGeometry(aperture, 32), [aperture]);
  const steel = useMemo(() => new THREE.MeshStandardMaterial({ color: "#657c80", metalness: 0.86,
    roughness: 0.32, emissive: "#0a1419", emissiveIntensity: 0.35 }), []);
  const graphite = useMemo(() => new THREE.MeshStandardMaterial({ color: "#172529", metalness: 0.7,
    roughness: 0.38 }), []);
  const edgeMaterial = useMemo(() => new THREE.LineBasicMaterial({ color: "#a9c9c9", transparent: true, opacity: 0.25 }), []);
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uMode: { value: mode },
    uIntro: { value: skipBoot || reducedMotion ? 1 : 0 },
    uExit: { value: 0 },
    uPointer: { value: new THREE.Vector2() }, uColor: { value: new THREE.Color(COLORS[mode]) } }), []);
  const color = useMemo(() => new THREE.Color(), []), zero = useMemo(() => new THREE.Vector2(), []);
  const focus = useMemo(() => new THREE.Vector3(), []);
  useEffect(() => {
    // Original geometry needs broad studio reflections to show its machined faces.
    // Generate once from Three's procedural room; no HDR download or extra render pass.
    const room = new RoomEnvironment();
    const generator = new THREE.PMREMGenerator(gl);
    const reflection = generator.fromScene(room, 0.04);
    const previous = scene.environment;
    scene.environment = reflection.texture;
    invalidate();
    room.dispose(); generator.dispose();
    return () => { scene.environment = previous; reflection.dispose(); };
  }, [gl, scene, invalidate]);
  useEffect(() => { invalidate(); }, [mode, paused, reducedMotion, invalidate]);
  useEffect(() => {
    if (!journey) return undefined;
    journey.current.invalidate = invalidate;
    return () => { if (journey.current.invalidate === invalidate) journey.current.invalidate = null; };
  }, [journey, invalidate]);
  useEffect(() => () => { ribbons.dispose(); }, [ribbons]);
  useEffect(() => () => { particles.dispose(); }, [particles]);
  useEffect(() => () => { aperture.dispose(); edges.dispose(); steel.dispose(); graphite.dispose(); edgeMaterial.dispose(); }, [aperture, edges, steel, graphite, edgeMaterial]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05), settle = paused || reducedMotion;
    if (!settle) elapsed.current += dt;
    uniforms.uTime.value = reducedMotion ? 0 : elapsed.current;
    uniforms.uIntro.value = settle ? 1 : THREE.MathUtils.smoothstep(elapsed.current, 0, 1.8);
    uniforms.uMode.value = settle ? mode : THREE.MathUtils.damp(uniforms.uMode.value, mode, 2.8, dt);
    uniforms.uColor.value.lerp(color.set(COLORS[mode]), settle ? 1 : Math.min(1, dt * 3));
    uniforms.uPointer.value.lerp(settle ? zero : pointer, settle ? 1 : Math.min(1, dt * 4));
    const targetProgress = reducedMotion ? 0 : (journey?.current.progress || 0);
    progress.current = settle ? targetProgress : THREE.MathUtils.damp(progress.current, targetProgress, 5, dt);
    const flight = THREE.MathUtils.smoothstep(progress.current, 0.03, 0.95);
    uniforms.uExit.value = THREE.MathUtils.smoothstep(flight, 0.2, 1);
    // R3F can reconcile a material's uniforms separately from the supplied object.
    // Synchronize scalar values on the actual GPU materials as well as shared colors.
    for (const material of materials.current) {
      if (!material) continue;
      material.uniforms.uTime.value = uniforms.uTime.value;
      material.uniforms.uMode.value = uniforms.uMode.value;
      material.uniforms.uIntro.value = uniforms.uIntro.value;
      material.uniforms.uExit.value = uniforms.uExit.value;
      material.uniforms.uPointer.value.copy(uniforms.uPointer.value);
      material.uniforms.uColor.value.copy(uniforms.uColor.value);
      material.uniformsNeedUpdate = true;
    }
    if (!bootComplete.current && elapsed.current > 1.8) { bootComplete.current = true; onBoot(); }
    const modeValue = uniforms.uMode.value;
    const observe = Math.max(0, 1 - modeValue), reason = Math.max(0, 1 - Math.abs(modeValue - 1));
    const execute = Math.max(0, modeValue - 1);
    const opening = 1 - uniforms.uIntro.value;
    ribs.current.forEach((rib, index) => {
      if (!rib) return;
      const t = index / 8;
      const taper = Math.pow(1 - t, 1.1);
      const height = observe * (2.95 + Math.sin(t * Math.PI) * 0.25) + reason * 2.4 + execute * (0.65 + taper * 2.7);
      const depth = observe * 1.05 + reason * 2.02 + execute * (0.48 + taper * 1.0);
      rib.position.set((t - 0.5) * 9.2 * (1 + opening * 0.35 + flight * 0.35), 0, -0.05);
      rib.scale.set(1, height * (1 + opening * 0.25), depth);
      rib.rotation.x = reason * Math.sin(t * 4 + elapsed.current * 0.1) * 0.14 + flight * (t - 0.5) * 0.4;
      // The machine opens into the exiting strand instead of vanishing as a layer.
      rib.position.z -= flight * (1.5 + Math.abs(t - 0.5) * 3);
      const fin = fins.current[index];
      if (fin) {
        fin.position.set(rib.position.x, -height - 0.19, rib.position.z);
        fin.scale.y = 0.22 + height * 0.035;
        fin.rotation.x = rib.rotation.x;
      }
    });
    edgeMaterial.opacity = 0.24 * (1 - flight * 0.7);
    steel.emissive.copy(uniforms.uColor.value).multiplyScalar(0.025);
    if (group.current) {
      const scale = compact ? Math.max(0.39, viewport.width / 15.8) : landscape ? 0.82 : 0.94;
      group.current.scale.setScalar(scale * (1 + flight * 0.16));
      group.current.position.set(compact ? 0 : viewport.width * 0.18 + flight * 1.4, compact ? 1.8 : 1.6 + flight * 0.7, -0.1);
      group.current.rotation.z = (compact ? 0.87 : 0.25) + flight * 0.13;
      group.current.rotation.x = settle ? 0.18 : THREE.MathUtils.damp(group.current.rotation.x, pointer.y * 0.17 + 0.18, 3, dt);
      group.current.rotation.y = settle ? -0.45 : THREE.MathUtils.damp(group.current.rotation.y, pointer.x * 0.2 - 0.45 + flight * 0.28, 3, dt);
    }
    camera.position.set(flight * 2.7, 0.7 + flight * 0.9, 18.4 - flight * 4.8);
    focus.set(flight * 2, 0.7 + flight * 0.2, 0);
    camera.lookAt(focus);
  });
  return <>
    <ambientLight intensity={0.3} />
    <hemisphereLight args={["#b5d7e9", "#030505", 1.5]} />
    <directionalLight position={[-3, 8, 6]} color="#d6e9f4" intensity={4.5} />
    <directionalLight position={[5, -2, -5]} color="#578bb4" intensity={3.3} />
    <pointLight position={[-4, 3, 3]} color="#ff6743" intensity={14} distance={15} decay={2} />
    <group ref={group}>
    {Array.from({ length: 9 }, (_, index) => <group key={index} ref={value => { ribs.current[index] = value; }}>
      <mesh geometry={aperture} material={steel} />
      <lineSegments geometry={edges} material={edgeMaterial} />
    </group>)}
    {Array.from({ length: 9 }, (_, index) => <mesh key={index} position={[(index / 8 - 0.5) * 9.2, -3.2, -0.05]} ref={value => { fins.current[index] = value; }} material={graphite}>
      <boxGeometry args={[0.36, 1, 1.35]} />
    </mesh>)}
    <mesh geometry={ribbons} frustumCulled={false}><shaderMaterial ref={value => { materials.current[0] = value; }} uniforms={uniforms} vertexShader={ribbonVertex} fragmentShader={ribbonFragment} side={THREE.DoubleSide} toneMapped={false} /></mesh>
    <points geometry={particles} frustumCulled={false}><shaderMaterial ref={value => { materials.current[1] = value; }} uniforms={uniforms} vertexShader={particleVertex} fragmentShader={particleFragment} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} /></points>
    </group>
  </>;
}

class LoomBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <div className="loom-unavailable"><strong>Observe. Reason. Execute.</strong><span>The engineering is still here. Explore the work below.</span></div> : this.props.children; }
}

export function SignalCore({ mode, reducedMotion, paused = false, onCycle, journey }) {
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
    {visible && <Canvas className="signal-canvas" camera={{ position: [0, 0.7, 18.4], fov: 40 }} dpr={dpr} frameloop={paused || reducedMotion ? "demand" : "always"} gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}>
      <Loom mode={mode} reducedMotion={reducedMotion} paused={paused} skipBoot={booted.current} onBoot={() => { booted.current = true; }} journey={journey} />
      {!reducedMotion && <EffectComposer multisampling={0}><Bloom luminanceThreshold={1.05} luminanceSmoothing={0.6} intensity={0.44} mipmapBlur /></EffectComposer>}
    </Canvas>}
  </LoomBoundary></div>;
}
