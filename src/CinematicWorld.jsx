import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { LoomSculpture } from "./SignalLoom.jsx";
import { DescentWorld, FlightContextObserver, sampleFlightPose } from "./DescentWorld.jsx";
import { clamp01, readStory, smoothRange } from "./cinematic-motion.js";

function Studio() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const room = new RoomEnvironment(), generator = new THREE.PMREMGenerator(gl);
    const environment = generator.fromScene(room, .04), previous = scene.environment;
    scene.environment = environment.texture;
    room.dispose(); generator.dispose();
    return () => { scene.environment = previous; environment.dispose(); };
  }, [gl, scene]);
  return <><ambientLight intensity={.4} /><hemisphereLight args={["#b5d7e9", "#030505", 1.4]} /><directionalLight position={[-3, 8, 10]} color="#d6e9f4" intensity={4.5} /><directionalLight position={[5, -2, -18]} color="#ff7851" intensity={2.4} /><directionalLight position={[5, -2, -5]} color="#578bb4" intensity={2.3} /></>;
}

function Director({ motion, journey, flight, world, paused }) {
  const { camera, size, invalidate, setDpr, scene } = useThree();
  const pose = useRef({}), options = useRef({ velocity: 0 });
  const vectors = useMemo(() => ({ position: new THREE.Vector3(), target: new THREE.Vector3(), heroPosition: new THREE.Vector3(0, .7, 18.4), heroTarget: new THREE.Vector3(0, .7, 0), up: new THREE.Vector3(0, 1, 0) }), []);
  useEffect(() => {
    motion.current.invalidate = invalidate;
    setDpr(Math.min(window.devicePixelRatio || 1, 1.35, Math.sqrt(1_800_000 / Math.max(1, size.width * size.height))));
    invalidate();
    return () => { if (motion.current.invalidate === invalidate) motion.current.invalidate = null; };
  }, [motion, invalidate, setDpr, size.width, size.height]);
  useEffect(() => { invalidate(); }, [paused, invalidate]);
  useFrame(() => {
    const story = readStory(motion.current.distance, motion.current.measures);
    journey.current.progress = clamp01((story.hero - .12) / .88);
    journey.current.flight = story.flight;
    flight.current.progress = story.flight;
    sampleFlightPose(story.flight, size.width, size.height, vectors.position, vectors.target, pose.current, options.current);
    camera.position.copy(vectors.heroPosition).lerp(vectors.position, story.passage);
    vectors.target.lerpVectors(vectors.heroTarget, vectors.target, story.passage);
    camera.up.copy(vectors.up); camera.lookAt(vectors.target); camera.rotateZ((pose.current.roll || 0) * story.passage);
    const fov = 40 + (pose.current.fov - 40) * story.passage;
    if (Math.abs(camera.fov - fov) > .005) { camera.fov = fov; camera.updateProjectionMatrix(); }
    camera.updateMatrixWorld();
    if (world.current) { world.current.position.z = -48 * (1 - smoothRange(story.passage, .15, 1)); world.current.visible = story.passage > .08; }
    if (scene.fog) { scene.fog.near = 28 - story.passage * 21; scene.fog.far = 100 - story.passage * 68; }
    // The scrubbed document distance owns camera motion. Only the hero's
    // explicitly pausable material performance requests continuous frames.
    if (story.hero < 1 && !paused) invalidate();
  }, -2);
  return null;
}

function CaptureProjection({ motion, surface, onProjection }) {
  const { camera, size } = useThree();
  const points = useMemo(() => [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()], []);
  const previous = useRef("");
  useFrame(() => {
    const story = readStory(motion.current.distance, motion.current.measures), mesh = surface.current;
    if (!mesh || story.flight < .999) return;
    const { width, height } = mesh.geometry.parameters;
    mesh.updateWorldMatrix(true, false);
    [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([x, y], index) => points[index].set(x * width / 2, y * height / 2, 0).applyMatrix4(mesh.matrixWorld).project(camera));
    const xs = points.map(point => (point.x + 1) * size.width / 2), ys = points.map(point => (1 - point.y) * size.height / 2);
    const frame = { left: Math.min(...xs), top: Math.min(...ys), width: Math.max(...xs) - Math.min(...xs), height: Math.max(...ys) - Math.min(...ys) };
    const signature = Object.values(frame).map(value => value.toFixed(2)).join("/");
    if (signature !== previous.current && Object.values(frame).every(Number.isFinite)) { previous.current = signature; onProjection(frame); }
  }, .5);
  return null;
}

function WorldContents({ motion, mode, paused, onFailure, onProjection }) {
  const journey = useRef({ progress: 0, flight: 0 }), flight = useRef({ progress: 0 }), world = useRef(null), surface = useRef(null);
  return <>
    <color attach="background" args={["#030505"]} /><fog attach="fog" args={["#030505", 28, 100]} />
    <FlightContextObserver onFailure={onFailure} /><Studio />
    <Director motion={motion} journey={journey} flight={flight} world={world} paused={paused} />
    <LoomSculpture shared mode={mode} reducedMotion={false} paused={paused} skipBoot onBoot={() => {}} journey={journey} />
    <group ref={world}><Suspense fallback={null}><DescentWorld shared flightRef={flight} arrivalSurfaceRef={surface} /></Suspense></group>
    <CaptureProjection motion={motion} surface={surface} onProjection={onProjection} />
    <EffectComposer multisampling={0} resolutionScale={.7}><Bloom luminanceThreshold={1.05} luminanceSmoothing={.5} intensity={.34} mipmapBlur /></EffectComposer>
  </>;
}

export default function CinematicWorld({ onCycle, ...props }) {
  return <div className="cinematic-webgl" onClick={onCycle}><Canvas camera={{ position: [0, .7, 18.4], fov: 40, near: .08, far: 160 }} frameloop="demand" dpr={1} gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}><WorldContents {...props} /></Canvas></div>;
}
