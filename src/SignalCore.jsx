import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { AdaptiveDpr, Sparkles } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import * as THREE from "three";

const ACCENTS = ["#ff5f38", "#d8ff4f", "#7ea8ff"];
const SHARD_COUNT = 40;

function filamentCurve(index) {
  const y = (index - 2) * 0.72;
  return new THREE.CatmullRomCurve3([
    new THREE.Vector3(-4.5, y - 0.24, -0.8 + index * 0.18),
    new THREE.Vector3(-2.2, y + (index % 2 ? 0.38 : -0.28), 0.2),
    new THREE.Vector3(0, y * 0.45, index % 2 ? -0.65 : 0.62),
    new THREE.Vector3(2.25, y + (index % 2 ? -0.34 : 0.3), 0.08),
    new THREE.Vector3(4.5, y + 0.2, -0.7 + index * 0.17),
  ]);
}

function modeTargets(mode) {
  return Array.from({ length: SHARD_COUNT }, (_, index) => {
    const column = index % 10;
    const row = Math.floor(index / 10);
    if (mode === 0) {
      const x = (column - 4.5) * 0.54;
      const y = (1.5 - row) * 0.66 + Math.abs(x) * 0.12;
      return {
        position: [x, y, Math.sin(column * 0.72 + row * 0.9) * 0.46],
        rotation: [0.04 * row, 0.2 + x * 0.12, -x * 0.11],
        scale: [1.08, 0.72 + row * 0.08, 1],
      };
    }
    if (mode === 1) {
      const angle = index * 0.62;
      const strand = index % 2 === 0 ? -1 : 1;
      return {
        position: [Math.cos(angle) * 1.18 + strand * 0.18, -2.34 + index * 0.12, Math.sin(angle) * 1.18],
        rotation: [angle * 0.18, angle + Math.PI / 2, strand * 0.32],
        scale: [0.88, 0.76, 0.88],
      };
    }
    const progress = column / 9;
    const compression = 1 - progress * 0.72;
    return {
      position: [-2.65 + column * 0.63, (row - 1.5) * 0.72 * compression, (row - 1.5) * 0.16 + Math.sin(column) * 0.08],
      rotation: [0, -0.2 + progress * 0.3, Math.sin(column * 0.62) * 0.08],
      scale: [0.72 + progress * 1.5, 0.62 * compression + 0.25, 0.82],
    };
  });
}

function EnergyRail({ curve, color, active }) {
  return (
    <mesh>
      <tubeGeometry args={[curve, 72, active ? 0.014 : 0.007, 7, false]} />
      <meshBasicMaterial color={color} transparent opacity={active ? 0.74 : 0.16} toneMapped={false} />
    </mesh>
  );
}

function SignalPulse({ curve, color, offset, speed, reducedMotion }) {
  const ref = useRef();
  useFrame((state) => {
    if (!ref.current) return;
    const progress = reducedMotion ? offset : (state.clock.elapsedTime * speed + offset) % 1;
    ref.current.position.copy(curve.getPointAt(progress));
  });
  return (
    <mesh ref={ref}>
      <boxGeometry args={[0.14, 0.14, 0.14]} />
      <meshBasicMaterial color={color} toneMapped={false} />
    </mesh>
  );
}

function DecisionLoom({ mode, reducedMotion, onCycle }) {
  const assembly = useRef();
  const shardRefs = useRef([]);
  const { pointer } = useThree();
  const accent = ACCENTS[mode];
  const targets = useMemo(() => [modeTargets(0), modeTargets(1), modeTargets(2)], []);
  const initialTargets = useRef(targets[mode]);
  const rails = useMemo(() => Array.from({ length: 5 }, (_, index) => filamentCurve(index)), []);

  useEffect(() => () => { document.body.style.cursor = ""; }, []);

  useFrame((state, delta) => {
    if (!assembly.current) return;
    if (reducedMotion) {
      assembly.current.rotation.set(0, 0, 0);
      assembly.current.position.y = 0;
      shardRefs.current.forEach((shard, index) => {
        if (!shard) return;
        const target = targets[mode][index];
        shard.position.set(...target.position);
        shard.rotation.set(...target.rotation);
        shard.scale.set(...target.scale);
      });
      return;
    }
    delta = Math.min(delta, 0.05);
    assembly.current.rotation.x = THREE.MathUtils.damp(assembly.current.rotation.x, pointer.y * 0.13, 3.6, delta);
    assembly.current.rotation.y = THREE.MathUtils.damp(assembly.current.rotation.y, pointer.x * 0.2, 3.6, delta);
    if (!reducedMotion) assembly.current.position.y = Math.sin(state.clock.elapsedTime * 0.52) * 0.055;

    shardRefs.current.forEach((shard, index) => {
      if (!shard) return;
      const target = targets[mode][index];
      shard.position.x = THREE.MathUtils.damp(shard.position.x, target.position[0], 4.5, delta);
      shard.position.y = THREE.MathUtils.damp(shard.position.y, target.position[1], 4.5, delta);
      shard.position.z = THREE.MathUtils.damp(shard.position.z, target.position[2], 4.5, delta);
      shard.rotation.x = THREE.MathUtils.damp(shard.rotation.x, target.rotation[0], 4.2, delta);
      shard.rotation.y = THREE.MathUtils.damp(shard.rotation.y, target.rotation[1], 4.2, delta);
      shard.rotation.z = THREE.MathUtils.damp(shard.rotation.z, target.rotation[2], 4.2, delta);
      shard.scale.x = THREE.MathUtils.damp(shard.scale.x, target.scale[0], 4.2, delta);
      shard.scale.y = THREE.MathUtils.damp(shard.scale.y, target.scale[1], 4.2, delta);
      shard.scale.z = THREE.MathUtils.damp(shard.scale.z, target.scale[2], 4.2, delta);
    });
  });

  return (
    <group
      ref={assembly}
      onClick={(event) => { event.stopPropagation(); onCycle?.(); }}
      onPointerOver={(event) => { event.stopPropagation(); document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { document.body.style.cursor = ""; }}
    >
      {rails.map((curve, index) => (
        <group key={`rail-${index}`}>
          <EnergyRail curve={curve} color={index % 3 === mode ? accent : "#747978"} active={index % 3 === mode} />
          <SignalPulse curve={curve} color={index % 3 === mode ? accent : "#d9ddd9"} offset={index * 0.19} speed={0.055 + mode * 0.025} reducedMotion={reducedMotion} />
        </group>
      ))}

      {Array.from({ length: SHARD_COUNT }, (_, index) => {
        const initial = initialTargets.current[index];
        const isSignal = index % 7 === mode || index % 11 === mode + 2;
        return (
          <mesh
            key={`shard-${index}`}
            ref={(node) => { shardRefs.current[index] = node; }}
            position={initial.position}
            rotation={initial.rotation}
            scale={initial.scale}
          >
            <boxGeometry args={[0.18, 0.76, 0.13]} />
            <meshPhysicalMaterial
              color={isSignal ? accent : index % 4 === 0 ? "#d6d9d4" : "#222625"}
              emissive={isSignal ? accent : "#000000"}
              emissiveIntensity={isSignal ? 0.38 : 0}
              metalness={0.92}
              roughness={isSignal ? 0.16 : 0.3}
              toneMapped={!isSignal}
            />
          </mesh>
        );
      })}

      <mesh position={[0, 0, -1.4]}>
        <planeGeometry args={[7.8, 5.2, 18, 12]} />
        <meshBasicMaterial color="#323635" wireframe transparent opacity={0.12} />
      </mesh>
    </group>
  );
}

export function SignalCore({ mode, reducedMotion, onCycle }) {
  const shellRef = useRef(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const node = shellRef.current;
    if (!node) return undefined;
    let nearViewport = !("IntersectionObserver" in window);
    const updateVisibility = () => setVisible(nearViewport && !document.hidden);
    const observer = "IntersectionObserver" in window ? new IntersectionObserver(([entry]) => {
      nearViewport = entry.isIntersecting;
      updateVisibility();
    }, { rootMargin: "180px" }) : null;
    observer?.observe(node);
    document.addEventListener("visibilitychange", updateVisibility);
    if (!observer) updateVisibility();
    return () => {
      observer?.disconnect();
      document.removeEventListener("visibilitychange", updateVisibility);
    };
  }, []);

  return (
    <div className="signal-core-shell" ref={shellRef}>
      {visible && (
        <Canvas
          className="signal-canvas"
          camera={{ position: [0, 0.08, 8.4], fov: 39 }}
          dpr={[1, 1.45]}
          frameloop={visible && !reducedMotion ? "always" : "demand"}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        >
          <color attach="background" args={["#050505"]} />
          <fog attach="fog" args={["#050505", 9.8, 15]} />
          <ambientLight intensity={0.42} />
          <directionalLight position={[4, 5, 6]} intensity={3.4} color="#f5f2e8" />
          <pointLight position={[-3.2, -0.7, 3.5]} intensity={8.4} color={ACCENTS[mode]} distance={8.5} />
          <pointLight position={[3.5, 2, -1]} intensity={2.4} color="#dce4ff" distance={7} />
          <DecisionLoom mode={mode} reducedMotion={reducedMotion} onCycle={onCycle} />
          <Sparkles count={34} scale={[9, 5.5, 4]} size={0.9} speed={reducedMotion ? 0 : 0.14} color="#c3c7c4" opacity={0.42} />
          <AdaptiveDpr pixelated />
          {!reducedMotion && (
            <EffectComposer multisampling={0}>
              <Bloom luminanceThreshold={0.46} luminanceSmoothing={0.7} intensity={0.42} mipmapBlur />
            </EffectComposer>
          )}
        </Canvas>
      )}
    </div>
  );
}
