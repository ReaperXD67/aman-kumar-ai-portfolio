import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import * as THREE from "three";

export const FLIGHT_BAYS = [
  { id: "atlaslm", name: "AtlasLM", image: "/assets/atlaslm-landing.png", progress: .34, side: 1, color: "#d8ff4f", labels: ["DENSE + BM25", "RANK FUSION", "EVIDENCE"] },
  { id: "agent", name: "Autonomous Personal Agent", image: "/assets/autonomous-agent.svg", progress: .61, side: -1, color: "#8bb8ff", labels: ["APPROVAL", "LEASE OWNER", "RECEIPT"] },
  { id: "karixmc", name: "KarixMC", image: "/assets/karixmc-live.png", progress: .86, side: 1, color: "#ff673d", labels: ["PAPER ACTIVITY", "HMAC BOUNDARY", "VALUE LEDGER"] },
];

export const FLIGHT_CURVE = new THREE.CatmullRomCurve3([
  new THREE.Vector3(-.8, -.25, 13), new THREE.Vector3(.4, .35, 5),
  new THREE.Vector3(-1.4, .8, -5), new THREE.Vector3(-2.1, -.45, -15),
  new THREE.Vector3(2.5, -.7, -26), new THREE.Vector3(2.8, .85, -36),
  new THREE.Vector3(-2.1, 1, -47), new THREE.Vector3(-.6, -.15, -58),
  new THREE.Vector3(.4, .2, -68),
], false, "catmullrom", .42);

const UP = new THREE.Vector3(0, 1, 0);
const Z = new THREE.Vector3(0, 0, 1);
const TAU = Math.PI * 2;
const clamp = THREE.MathUtils.clamp;
const APERTURE = [[-4, -1.75], [-3.15, -2.6], [3.15, -2.6], [4, -1.75], [4, 1.75], [3.15, 2.6], [-3.15, 2.6], [-4, 1.75]];

export function FlightContextObserver({ onFailure }) {
  const gl = useThree(state => state.gl);
  useEffect(() => {
    const canvas = gl.domElement;
    let mounted = true;
    const lost = () => { if (mounted) onFailure(); };
    canvas.addEventListener("webglcontextlost", lost);
    return () => {
      mounted = false;
      canvas.removeEventListener("webglcontextlost", lost);
    };
  }, [gl, onFailure]);
  return null;
}

export function flightFrame(progress) {
  const center = FLIGHT_CURVE.getPointAt(clamp(progress, 0, 1));
  const tangent = FLIGHT_CURVE.getTangentAt(clamp(progress, 0, 1));
  const right = new THREE.Vector3().crossVectors(tangent, UP).normalize();
  const up = new THREE.Vector3().crossVectors(right, tangent).normalize();
  const quaternion = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(right, up, tangent.clone().negate()));
  return { center, tangent, right, up, quaternion };
}

const BAY_TRANSFORMS = FLIGHT_BAYS.map(bay => {
  const frame = flightFrame(bay.progress);
  const rotation = frame.quaternion.clone().multiply(new THREE.Quaternion().setFromAxisAngle(UP, bay.side * -.17));
  return { ...bay, right: frame.right, position: frame.center.clone().addScaledVector(frame.right, bay.side * 3.75).addScaledVector(frame.up, .15), rotation, normal: Z.clone().applyQuaternion(rotation), up: UP.clone().applyQuaternion(rotation) };
});
const ARRIVAL_START = .8;
const ARRIVAL_BAY = BAY_TRANSFORMS[BAY_TRANSFORMS.length - 1];
const arrivalAmount = progress => THREE.MathUtils.smootherstep(progress, ARRIVAL_START, 1);

function writeBaseFlightPose(progress, position, target) {
  FLIGHT_CURVE.getPointAt(progress, position);
  FLIGHT_CURVE.getPointAt(Math.min(1, progress + .055), target);
  if (progress > .98) target.z -= 3;
  for (let index = 0; index < BAY_TRANSFORMS.length; index++) {
    const bay = BAY_TRANSFORMS[index];
    const focus = Math.exp(-Math.pow((progress - (bay.progress - .075)) / .065, 2));
    target.addScaledVector(bay.right, bay.side * 2.8 * focus);
  }
}

// These control points are created once. The terminal Bezier keeps the incoming
// position/aim tangent and settles in front of Karix, instead of flying past it.
const ARRIVAL_CONTROLS = (() => {
  const position = new THREE.Vector3(), target = new THREE.Vector3();
  const beforePosition = new THREE.Vector3(), beforeTarget = new THREE.Vector3();
  const afterPosition = new THREE.Vector3(), afterTarget = new THREE.Vector3();
  writeBaseFlightPose(ARRIVAL_START, position, target);
  writeBaseFlightPose(ARRIVAL_START - .0001, beforePosition, beforeTarget);
  writeBaseFlightPose(ARRIVAL_START + .0001, afterPosition, afterTarget);
  const derivativeScale = (1 - ARRIVAL_START) / (.0002 * 3);
  const positionControl = afterPosition.sub(beforePosition).multiplyScalar(derivativeScale).add(position);
  const targetControl = afterTarget.sub(beforeTarget).multiplyScalar(derivativeScale).add(target);
  const cameraRight = new THREE.Vector3().crossVectors(UP, ARRIVAL_BAY.normal).normalize();
  const cameraUp = new THREE.Vector3().crossVectors(ARRIVAL_BAY.normal, cameraRight).normalize();
  const roll = Math.atan2(-ARRIVAL_BAY.up.dot(cameraRight), ARRIVAL_BAY.up.dot(cameraUp));
  return { position, target, positionControl, targetControl, roll };
})();

function writeTerminalBezier(output, start, control, endX, endY, endZ, t) {
  const oneMinusT = 1 - t;
  const startWeight = oneMinusT * oneMinusT * oneMinusT;
  const controlWeight = 3 * oneMinusT * oneMinusT * t;
  const endWeight = 3 * oneMinusT * t * t + t * t * t;
  output.set(start.x * startWeight + control.x * controlWeight + endX * endWeight, start.y * startWeight + control.y * controlWeight + endY * endWeight, start.z * startWeight + control.z * controlWeight + endZ * endWeight);
}

/**
 * Write a flight pose without frame allocations when poseOut is supplied.
 * options: { arrival?: boolean (default true), velocity?: number }.
 * poseOut receives { fov, roll, arrival }; position/target are caller Vector3s.
 */
export function sampleFlightPose(progress, width, height, position, target, poseOut = {}, options) {
  const p = clamp(progress, 0, 1);
  const narrow = width < 700;
  const baseFov = narrow ? 86 : 50;
  const velocity = clamp(options?.velocity || 0, -.6, .6);
  const arrival = options?.arrival === false ? 0 : arrivalAmount(p);
  writeBaseFlightPose(p, position, target);
  if (options?.arrival !== false && p > ARRIVAL_START) {
    const imageWidth = 6.6 * .96 * (narrow ? .74 : 1);
    const aspect = Math.max(1, width) / Math.max(1, height);
    const widthFraction = Math.min(narrow ? .9 : .82, .78 * (6.6 / 4.2) / aspect);
    const distance = imageWidth / (widthFraction * 2 * Math.tan(THREE.MathUtils.degToRad(baseFov) / 2) * aspect);
    const endX = ARRIVAL_BAY.position.x + ARRIVAL_BAY.normal.x * distance;
    const endY = ARRIVAL_BAY.position.y + ARRIVAL_BAY.normal.y * distance;
    const endZ = ARRIVAL_BAY.position.z + ARRIVAL_BAY.normal.z * distance;
    const t = (p - ARRIVAL_START) / (1 - ARRIVAL_START);
    writeTerminalBezier(position, ARRIVAL_CONTROLS.position, ARRIVAL_CONTROLS.positionControl, endX, endY, endZ, t);
    writeTerminalBezier(target, ARRIVAL_CONTROLS.target, ARRIVAL_CONTROLS.targetControl, ARRIVAL_BAY.position.x, ARRIVAL_BAY.position.y, ARRIVAL_BAY.position.z, t);
  }
  poseOut.fov = baseFov + (narrow ? 0 : Math.min(.8, Math.abs(velocity)) * 5 * (1 - arrival));
  poseOut.roll = (Math.sin(p * TAU * 1.35) * .075 + velocity * .035) * (1 - arrival) + ARRIVAL_CONTROLS.roll * arrival;
  poseOut.arrival = arrival;
  return poseOut;
}

function MachinedApertures({ shared }) {
  const bodyRef = useRef(null);
  const lightRef = useRef(null);
  const data = useMemo(() => {
    const bodies = [], lights = [];
    const steel = new THREE.Color("#7d9699"), graphite = new THREE.Color("#263338");
    const dummy = new THREE.Object3D(), localRotation = new THREE.Quaternion();
    for (let gate = 0; gate < 31; gate++) {
      const progress = .045 + gate / 30 * .94;
      if (shared && progress < .16) continue;
      const frame = flightFrame(progress);
      const orientation = frame.quaternion.clone().multiply(new THREE.Quaternion().setFromAxisAngle(Z, Math.sin(progress * TAU * 1.4) * .2));
      const color = new THREE.Color(progress < .38 ? "#d8ff4f" : progress < .66 ? "#8bb8ff" : "#ff673d");
      APERTURE.forEach(([x, y], side) => {
        const [nextX, nextY] = APERTURE[(side + 1) % APERTURE.length];
        const mid = new THREE.Vector3((x + nextX) / 2, (y + nextY) / 2, 0);
        const length = Math.hypot(nextX - x, nextY - y);
        localRotation.setFromAxisAngle(Z, Math.atan2(nextY - y, nextX - x));
        dummy.quaternion.copy(orientation).multiply(localRotation);
        dummy.position.copy(mid).applyQuaternion(orientation).add(frame.center);
        dummy.scale.set(length + .045, gate % 4 === 0 ? .19 : .105, .34);
        dummy.updateMatrix();
        bodies.push({ matrix: dummy.matrix.clone(), color: graphite.clone().lerp(steel, .48 + (side % 3) * .16) });
        dummy.position.copy(mid).add(new THREE.Vector3(0, 0, .185)).applyQuaternion(orientation).add(frame.center);
        dummy.scale.set(length * .86, gate % 4 === 0 ? .027 : .012, .012);
        dummy.updateMatrix();
        lights.push({ matrix: dummy.matrix.clone(), color: color.clone().multiplyScalar(side % 3 === 0 ? 1.7 : .65) });
      });
    }
    return { bodies, lights };
  }, [shared]);
  useEffect(() => {
    [[bodyRef.current, data.bodies], [lightRef.current, data.lights]].forEach(([mesh, instances]) => {
      instances.forEach((instance, index) => { mesh.setMatrixAt(index, instance.matrix); mesh.setColorAt(index, instance.color); });
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      mesh.computeBoundingSphere();
    });
  }, [data]);
  return <>
    <instancedMesh ref={bodyRef} args={[undefined, undefined, data.bodies.length]}>
      <boxGeometry args={[1, 1, 1]} /><meshStandardMaterial color="#b7c2c2" metalness={.72} roughness={.32} />
    </instancedMesh>
    <instancedMesh ref={lightRef} args={[undefined, undefined, data.lights.length]}>
      <boxGeometry args={[1, 1, 1]} /><meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  </>;
}

function BraidedRails({ flightRef }) {
  const materials = useRef([]);
  const rails = useMemo(() => Array.from({ length: 12 }, (_, index) => {
    const points = Array.from({ length: 161 }, (__, step) => {
      const p = step / 160, frame = flightFrame(p);
      const phase = index / 12 * TAU + p * TAU * (index % 2 ? .75 : -.75);
      const flare = 1 + Math.sin(p * Math.PI) * .12;
      return frame.center.addScaledVector(frame.right, Math.cos(phase) * (3.25 + (index % 3) * .24) * flare).addScaledVector(frame.up, Math.sin(phase) * 2.2 * flare);
    });
    return { geometry: new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 220, index % 3 ? .011 : .024, 4, false), color: new THREE.Color(index % 3 === 0 ? "#ff673d" : index % 3 === 1 ? "#d8ff4f" : "#8bb8ff") };
  }), []);
  useEffect(() => () => rails.forEach(rail => rail.geometry.dispose()), [rails]);
  useFrame(() => { materials.current.forEach(material => { if (material) material.uniforms.uProgress.value = flightRef.current.progress; }); });
  return <group>{rails.map((rail, index) => <mesh key={index} geometry={rail.geometry}>
    <shaderMaterial ref={material => { materials.current[index] = material; }} toneMapped={false} uniforms={{ uProgress: { value: 0 }, uColor: { value: rail.color } }} vertexShader={`
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
    `} fragmentShader={`
      uniform float uProgress;
      uniform vec3 uColor;
      varying vec2 vUv;
      void main() {
        float nearCamera = exp(-abs(vUv.x - uProgress - 0.075) * 18.0);
        float packet = pow(max(0.0, sin(vUv.x * 180.0 - uProgress * 120.0)), 14.0);
        gl_FragColor = vec4(uColor * (0.16 + nearCamera * (0.8 + packet * 2.0)), 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `} />
  </mesh>)}</group>;
}

function ArchitectureBlade({ color, side, index, labels, projectId }) {
  const line = useMemo(() => {
    const positions = [];
    const segment = (a, b) => positions.push(...a, ...b);
    if (projectId === "atlaslm") {
      [[-2.5, -.7, .03], [-2.5, .7, .03]].forEach(point => { segment(point, [-.6, point[1], .03]); segment([-.6, point[1], .03], [-.6, 0, .03]); });
      segment([-.6, 0, .03], [2.2, 0, .03]);
    } else if (projectId === "agent") {
      segment([-2.5, .7, .03], [1.5, .7, .03]); segment([1.5, .7, .03], [1.5, -.7, .03]); segment([1.5, -.7, .03], [-2.5, -.7, .03]); segment([-2.5, -.7, .03], [-2.5, .7, .03]);
    } else {
      segment([-2.5, 0, .03], [-.6, 0, .03]); segment([-.6, -.95, .03], [-.6, .95, .03]); segment([-.6, 0, .03], [2.2, 0, .03]); segment([1.5, 0, .03], [1.5, -.9, .03]);
    }
    return new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  }, [projectId]);
  const labelMap = useMemo(() => {
    const canvas = document.createElement("canvas"); canvas.width = 1024; canvas.height = 192;
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, 1024, 192); context.fillStyle = color; context.font = "500 28px monospace";
    labels.forEach((label, i) => context.fillText(label, 26 + i * 335, 110));
    const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; return texture;
  }, [color, labels]);
  useEffect(() => () => { line.dispose(); labelMap.dispose(); }, [line, labelMap]);
  return <group position={[side * (.65 + index * .45), -.16 - index * .13, -.55 - index * .45]} rotation={[0, side * -.035, 0]}>
    <mesh><planeGeometry args={[6.6, 3.7]} /><meshBasicMaterial color="#071014" transparent opacity={.82} side={THREE.DoubleSide} /></mesh>
    <lineSegments geometry={line}><lineBasicMaterial color={color} transparent opacity={.65 - index * .12} /></lineSegments>
    {[-2.5, -.6, 2.2].map((x, nodeIndex) => <mesh key={x} position={[x, projectId === "agent" && nodeIndex === 1 ? .7 : 0, .04]}><boxGeometry args={[.18, .18, .025]} /><meshBasicMaterial color={color} toneMapped={false} /></mesh>)}
    <mesh position={[0, -1.25, .05]}><planeGeometry args={[6.3, 1.18]} /><meshBasicMaterial map={labelMap} transparent depthWrite={false} toneMapped={false} /></mesh>
  </group>;
}

function ArtifactBays({ flightRef, arrivalSurfaceRef }) {
  const narrow = useThree(state => state.size.width < 700);
  const textures = useTexture(FLIGHT_BAYS.map(bay => bay.image));
  const bays = BAY_TRANSFORMS;
  const refs = useRef([]);
  useEffect(() => { textures.forEach(texture => { texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = 4; }); }, [textures]);
  useFrame(() => { refs.current.forEach((group, index) => {
    if (!group) return;
    const progress = flightRef.current.progress;
    const approach = Math.exp(-Math.pow((progress - (bays[index].progress - .085)) / .09, 2)) * (bays[index].id === "karixmc" ? 1 - arrivalAmount(progress) : 1);
    group.scale.setScalar((narrow ? .74 : 1) * (.96 + approach * .08));
  }); });
  return <>{bays.map((bay, index) => {
    const height = Math.min(4.2, 6.6 * textures[index].image.height / textures[index].image.width);
    return <group key={bay.id} ref={element => { refs.current[index] = element; }} position={bay.position} quaternion={bay.rotation}>
      {[2, 1, 0].map(blade => <ArchitectureBlade key={blade} index={blade} side={bay.side} color={bay.color} labels={bay.labels} projectId={bay.id} />)}
      <mesh position={[0, 0, -.1]}><boxGeometry args={[6.95, height + .45, .18]} /><meshStandardMaterial color="#42575a" metalness={.72} roughness={.3} /></mesh>
      <mesh ref={bay.id === "karixmc" ? element => { if (arrivalSurfaceRef) arrivalSurfaceRef.current = element; } : undefined} position={[0, 0, .015]}><planeGeometry args={[6.6, height]} /><meshBasicMaterial map={textures[index]} toneMapped={false} /></mesh>
      <mesh position={[0, height / 2 + .12, .025]}><boxGeometry args={[6.62, .024, .025]} /><meshBasicMaterial color={bay.color} toneMapped={false} /></mesh>
      {[-1, 1].map(side => <group key={side} position={[side * 3.52, 0, -.2]}>
        <mesh><boxGeometry args={[.15, height + .7, .5]} /><meshStandardMaterial color="#8faaa9" metalness={.8} roughness={.3} /></mesh>
        <mesh position={[0, 0, .265]}><boxGeometry args={[.028, height * .65, .016]} /><meshBasicMaterial color={bay.color} toneMapped={false} /></mesh>
      </group>)}
    </group>;
  })}</>;
}

function FlightCamera({ progressRef, flightRef, invalidateRef }) {
  const { camera, invalidate, size, setDpr } = useThree();
  const current = useRef(progressRef.current), previous = useRef(progressRef.current);
  const target = useMemo(() => new THREE.Vector3(), []), position = useMemo(() => new THREE.Vector3(), []);
  const pose = useMemo(() => ({ fov: 50, roll: 0, arrival: 0 }), []);
  const poseOptions = useMemo(() => ({ velocity: 0 }), []);
  useEffect(() => {
    invalidateRef.current = invalidate;
    setDpr(Math.min(window.devicePixelRatio || 1, 1.35, Math.sqrt(1_800_000 / Math.max(1, size.width * size.height))));
    invalidate();
    return () => { if (invalidateRef.current === invalidate) invalidateRef.current = null; };
  }, [setDpr, invalidate, invalidateRef, size.width, size.height]);
  useFrame((_, delta) => {
    const goal = progressRef.current;
    current.current = THREE.MathUtils.damp(current.current, goal, 8, Math.min(delta, .05));
    if (Math.abs(goal - current.current) < .00003) current.current = goal;
    const p = current.current, velocity = clamp((p - previous.current) / Math.max(.001, delta), -.6, .6);
    previous.current = p; flightRef.current.progress = p;
    poseOptions.velocity = velocity;
    sampleFlightPose(p, size.width, size.height, position, target, pose, poseOptions);
    camera.position.copy(position); camera.up.set(0, 1, 0); camera.lookAt(target);
    camera.rotateZ(pose.roll);
    const nextFov = pose.fov;
    if (Math.abs(camera.fov - nextFov) > .02) { camera.fov = nextFov; camera.updateProjectionMatrix(); }
    if (Math.abs(goal - p) > .00003) invalidate();
  }, -1);
  return null;
}

export function DescentWorld({ progressRef, invalidateRef, shared = false, flightRef: externalFlightRef, arrivalSurfaceRef }) {
  const localFlightRef = useRef({ progress: progressRef?.current || 0 });
  const flightRef = externalFlightRef || localFlightRef;
  const geometry = <><MachinedApertures shared={shared} /><BraidedRails flightRef={flightRef} /><ArtifactBays flightRef={flightRef} arrivalSurfaceRef={arrivalSurfaceRef} /></>;
  if (shared) return geometry;
  return <>
    <color attach="background" args={["#030505"]} /><fog attach="fog" args={["#030505", 7, 30]} />
    <ambientLight intensity={.7} color="#8faeb2" />
    <directionalLight position={[4, 7, 10]} intensity={4} color="#d1e6e9" />
    <directionalLight position={[-5, -2, -18]} intensity={2.4} color="#ff7851" />
    <FlightCamera progressRef={progressRef} flightRef={flightRef} invalidateRef={invalidateRef} />
    {geometry}
    <EffectComposer multisampling={0} resolutionScale={.65}><Bloom luminanceThreshold={.85} luminanceSmoothing={.3} intensity={.32} mipmapBlur /></EffectComposer>
  </>;
}
