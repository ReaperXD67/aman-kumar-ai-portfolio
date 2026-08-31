import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { AdaptiveDpr, Float, RoundedBox, Sparkles } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import * as THREE from "three";

const ACCENTS = ["#ff5f38", "#d8ff4f", "#7ea8ff"];
const MODE_SPEED = [0.55, 0.9, 1.45];
const MODE_SPREAD = [1, 0.82, 1.16];

function EnergyFilament({ points, color, opacity = 0.6, radius = 0.012 }) {
  const curve = useMemo(() => new THREE.CatmullRomCurve3(points), [points]);
  return (
    <mesh>
      <tubeGeometry args={[curve, 72, radius, 8, false]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} toneMapped={false} />
    </mesh>
  );
}

function CoreAssembly({ mode, reducedMotion, onCycle }) {
  const assembly = useRef();
  const inner = useRef();
  const plateField = useRef();
  const signalField = useRef();
  const { pointer } = useThree();
  const accent = ACCENTS[mode];

  const plates = useMemo(
    () => Array.from({ length: 24 }, (_, index) => {
      const normalized = (index + 0.5) / 24;
      const polar = Math.acos(1 - 2 * normalized);
      const azimuth = Math.PI * (1 + Math.sqrt(5)) * (index + 0.5);
      const radius = 2.18 + Math.sin(index * 4.17) * 0.22;
      const x = Math.sin(polar) * Math.cos(azimuth) * radius;
      const y = Math.cos(polar) * radius * 0.7;
      const z = Math.sin(polar) * Math.sin(azimuth) * radius;
      const long = 0.58 + ((index * 7) % 5) * 0.07;
      return {
        position: [x, y, z],
        rotation: [polar - Math.PI / 2, -azimuth, Math.sin(index * 1.7) * 0.42],
        scale: [0.24 + (index % 3) * 0.055, long, 0.075 + (index % 2) * 0.018],
      };
    }),
    [],
  );

  const filaments = useMemo(
    () => Array.from({ length: 7 }, (_, index) => {
      const angle = (index / 7) * Math.PI * 2 + 0.32;
      const start = new THREE.Vector3(Math.cos(angle) * 3.04, Math.sin(index * 1.71) * 1.18, Math.sin(angle) * 3.04);
      const middle = new THREE.Vector3(Math.cos(angle + 0.72) * 1.95, Math.sin(index * 0.83) * 0.72, Math.sin(angle + 0.72) * 1.95);
      const end = new THREE.Vector3(Math.cos(angle + 1.2) * 0.72, Math.sin(index * 1.2) * 0.48, Math.sin(angle + 1.2) * 0.72);
      return [start, middle, end];
    }),
    [],
  );

  useEffect(() => () => {
    document.body.style.cursor = "";
  }, []);

  useFrame((state, delta) => {
    if (!assembly.current || !inner.current || !plateField.current || !signalField.current) return;
    assembly.current.rotation.x = THREE.MathUtils.damp(assembly.current.rotation.x, 0.15 + pointer.y * 0.24, 3.2, delta);
    assembly.current.rotation.y = THREE.MathUtils.damp(assembly.current.rotation.y, -0.36 + pointer.x * 0.34, 3.2, delta);

    const spread = MODE_SPREAD[mode];
    const currentScale = plateField.current.scale.x;
    const nextScale = THREE.MathUtils.damp(currentScale, spread, 3.8, delta);
    plateField.current.scale.setScalar(nextScale);

    if (!reducedMotion) {
      assembly.current.rotation.z += delta * 0.022 * MODE_SPEED[mode];
      inner.current.rotation.y -= delta * 0.15 * MODE_SPEED[mode];
      inner.current.rotation.x += delta * 0.052;
      plateField.current.rotation.y += delta * 0.045 * MODE_SPEED[mode];
      signalField.current.rotation.z -= delta * 0.06 * MODE_SPEED[mode];
    }

    const pulse = reducedMotion ? 1 : 1 + Math.sin(state.clock.elapsedTime * (1.15 + mode * 0.42)) * (0.02 + mode * 0.006);
    inner.current.scale.setScalar(pulse);
  });

  return (
    <group
      ref={assembly}
      rotation={[0.15, -0.36, 0.04]}
      onClick={(event) => {
        event.stopPropagation();
        onCycle?.();
      }}
      onPointerOver={(event) => {
        event.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "";
      }}
    >
      <group ref={inner}>
        <mesh>
          <icosahedronGeometry args={[1.14, 5]} />
          <meshPhysicalMaterial
            color="#090b0c"
            metalness={0.92}
            roughness={0.13}
            clearcoat={1}
            clearcoatRoughness={0.08}
            emissive={accent}
            emissiveIntensity={mode === 1 ? 0.16 : 0.08}
          />
        </mesh>
        <mesh scale={0.74} rotation={[0.4, 0.15, 0.2]}>
          <octahedronGeometry args={[1.05, 2]} />
          <meshPhysicalMaterial
            color={accent}
            emissive={accent}
            emissiveIntensity={0.36 + mode * 0.12}
            transparent
            opacity={0.34}
            transmission={0.18}
            thickness={0.8}
            roughness={0.2}
            toneMapped={false}
          />
        </mesh>
        <mesh scale={1.2}>
          <icosahedronGeometry args={[1.14, 2]} />
          <meshBasicMaterial color={accent} wireframe transparent opacity={0.34} toneMapped={false} />
        </mesh>
      </group>

      <group ref={plateField}>
        {plates.map((plate, index) => (
          <RoundedBox
            key={index}
            args={plate.scale}
            radius={0.05}
            smoothness={3}
            position={plate.position}
            rotation={plate.rotation}
          >
            <meshStandardMaterial
              color={index % 5 === mode ? accent : index % 4 === 0 ? "#858986" : "#252827"}
              metalness={0.94}
              roughness={index % 4 === 0 ? 0.16 : 0.27}
              emissive={index % 5 === mode ? accent : "#000000"}
              emissiveIntensity={index % 5 === mode ? 0.2 : 0}
            />
          </RoundedBox>
        ))}
      </group>

      <group ref={signalField}>
        {filaments.map((points, index) => (
          <EnergyFilament
            key={index}
            points={points}
            color={index % 3 === mode ? accent : "#606564"}
            opacity={index % 3 === mode ? 0.82 : 0.22}
            radius={index % 3 === mode ? 0.014 : 0.008}
          />
        ))}
      </group>

      <mesh rotation={[Math.PI / 2.4, 0.2, 0.15]}>
        <torusGeometry args={[2.68, 0.024, 12, 220]} />
        <meshStandardMaterial color="#f3f3ed" metalness={1} roughness={0.16} />
      </mesh>
      <mesh rotation={[0.35, Math.PI / 2, -0.3]}>
        <torusGeometry args={[2.88, 0.016, 10, 220]} />
        <meshBasicMaterial color={accent} transparent opacity={0.8} toneMapped={false} />
      </mesh>
      <mesh rotation={[-0.8, -0.1, 0.4]}>
        <torusGeometry args={[3.12, 0.01, 8, 220]} />
        <meshBasicMaterial color="#697070" transparent opacity={0.62} />
      </mesh>

      {Array.from({ length: 3 }, (_, index) => (
        <mesh key={`reason-${index}`} rotation={[Math.PI / 2, index * 0.72, index * 0.3]} scale={0.74 + index * 0.16}>
          <torusGeometry args={[2.05, 0.008 + index * 0.002, 8, 160]} />
          <meshBasicMaterial color={accent} transparent opacity={mode === 1 ? 0.48 - index * 0.1 : 0.04} toneMapped={false} />
        </mesh>
      ))}

      {Array.from({ length: 4 }, (_, index) => (
        <RoundedBox
          key={`execute-${index}`}
          args={[0.025, 5.8 - index * 0.44, 0.025]}
          radius={0.01}
          smoothness={2}
          rotation={[index * 0.55, index * 0.72, -0.38 + index * 0.22]}
        >
          <meshBasicMaterial color={accent} transparent opacity={mode === 2 ? 0.68 - index * 0.1 : index === 0 ? 0.32 : 0.03} toneMapped={false} />
        </RoundedBox>
      ))}

      {Array.from({ length: 10 }, (_, index) => {
        const angle = (index / 10) * Math.PI * 2;
        return (
          <mesh key={`node-${index}`} position={[Math.cos(angle) * 3.08, Math.sin(index * 1.73) * 0.96, Math.sin(angle) * 3.08]}>
            <sphereGeometry args={[index % 3 === mode ? 0.07 : 0.032, 14, 14]} />
            <meshBasicMaterial color={index % 3 === mode ? accent : "#f7f6ed"} toneMapped={false} />
          </mesh>
        );
      })}
    </group>
  );
}

export function SignalCore({ mode, reducedMotion, onCycle }) {
  const shellRef = useRef(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!shellRef.current || !("IntersectionObserver" in window)) return undefined;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: "180px" });
    observer.observe(shellRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="signal-core-shell" ref={shellRef}>
      {visible && <Canvas
        className="signal-canvas"
        camera={{ position: [0, 0.18, 8.15], fov: 38 }}
        dpr={[1, 1.45]}
        frameloop={visible && !reducedMotion ? "always" : "demand"}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <color attach="background" args={["#050505"]} />
        <fog attach="fog" args={["#050505", 9, 15]} />
        <ambientLight intensity={0.38} />
        <directionalLight position={[4, 5, 6]} intensity={3.35} color="#f5f2e8" />
        <pointLight position={[-3, -1, 3]} intensity={7.6} color={ACCENTS[mode]} distance={8.5} />
        <pointLight position={[3, 2, -2]} intensity={2.2} color="#dce4ff" distance={7} />
        <Float speed={reducedMotion ? 0 : 1.05 + mode * 0.2} rotationIntensity={reducedMotion ? 0 : 0.15} floatIntensity={reducedMotion ? 0 : 0.18}>
          <CoreAssembly mode={mode} reducedMotion={reducedMotion} onCycle={onCycle} />
        </Float>
        <Sparkles count={42} scale={[9, 6, 5]} size={1.05} speed={reducedMotion ? 0 : 0.18} color="#a5a7a8" opacity={0.52} />
        <AdaptiveDpr pixelated />
        {!reducedMotion && (
          <EffectComposer multisampling={0}>
            <Bloom luminanceThreshold={0.42} luminanceSmoothing={0.72} intensity={0.5} mipmapBlur />
          </EffectComposer>
        )}
      </Canvas>}
    </div>
  );
}
