import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { AdaptiveDpr, Sparkles } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { motion } from "motion/react";
import * as THREE from "three";

const ACCENTS = ["#ff5f38", "#d8ff4f", "#7ea8ff"];
const BOOT_PHASES = [
  ["00", "SIGNAL CORRUPTED"],
  ["27", "VOXELS CONVERGING"],
  ["68", "TOPOLOGY MAPPED"],
  ["91", "STACK COMPILING"],
  ["100", "SYSTEMS KERNEL ONLINE"],
];

function seeded(index, salt = 0) {
  const value = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;
  return value - Math.floor(value);
}

const BOOT_CELLS = Array.from({ length: 120 }, (_, index) => ({
  delay: 0.08 + seeded(index, 2) * 0.92 + (index % 12) * 0.025,
  rotate: seeded(index, 5) > 0.5 ? 1 : -1,
}));

function SignalArc({ index, overclock }) {
  const curve = useMemo(() => {
    const angle = (index / 7) * Math.PI * 2;
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(Math.cos(angle) * 2.92, Math.sin(index * 1.7) * 1.28, Math.sin(angle) * 2.92),
      new THREE.Vector3(Math.cos(angle + 0.5) * 2.18, Math.cos(index * 0.9) * 0.82, Math.sin(angle + 0.5) * 2.18),
      new THREE.Vector3(Math.cos(angle + 1.05) * 0.72, Math.sin(index) * 0.48, Math.sin(angle + 1.05) * 0.72),
    ]);
  }, [index]);

  return (
    <mesh>
      <tubeGeometry args={[curve, 52, overclock ? 0.018 : 0.009, 7, false]} />
      <meshBasicMaterial
        color={ACCENTS[index % ACCENTS.length]}
        transparent
        opacity={overclock ? 0.88 : 0.34}
        toneMapped={false}
      />
    </mesh>
  );
}

function SystemsAssembly({ reducedMotion, overclock, assembled }) {
  const assemblyRef = useRef(null);
  const coreRef = useRef(null);
  const coreMaterialRef = useRef(null);
  const topologyRef = useRef(null);
  const monolithRef = useRef(null);
  const nodeGeometryRef = useRef(null);
  const panelRefs = useRef([]);
  const pulseRefs = useRef([]);
  const bootRef = useRef(reducedMotion || assembled ? 1 : 0);
  const { pointer } = useThree();

  const topology = useMemo(() => {
    const count = 210;
    const target = new Float32Array(count * 3);
    const origin = new Float32Array(count * 3);

    for (let index = 0; index < count; index += 1) {
      const layer = index % 3;
      const angle = index * 0.29 + layer * 1.37;
      const radius = 1.5 + layer * 0.55 + Math.sin(index * 0.73) * 0.16;
      target[index * 3] = Math.cos(angle) * radius;
      target[index * 3 + 1] = Math.sin(angle * 1.45) * (0.86 + layer * 0.18);
      target[index * 3 + 2] = Math.sin(angle) * radius;

      const scatter = 5.2 + seeded(index, 7) * 3.6;
      const polar = seeded(index, 8) * Math.PI * 2;
      const elevation = (seeded(index, 9) - 0.5) * Math.PI;
      origin[index * 3] = Math.cos(polar) * Math.cos(elevation) * scatter;
      origin[index * 3 + 1] = Math.sin(elevation) * scatter;
      origin[index * 3 + 2] = Math.sin(polar) * Math.cos(elevation) * scatter;
    }

    return { count, target, origin };
  }, []);

  const nodePositions = useMemo(
    () => new Float32Array(reducedMotion || assembled ? topology.target : topology.origin),
    [assembled, reducedMotion, topology],
  );

  const panels = useMemo(
    () => Array.from({ length: 8 }, (_, index) => {
      const side = index % 2 === 0 ? -1 : 1;
      const tier = Math.floor(index / 2);
      return {
        position: [side * (1.38 + tier * 0.3), (tier - 1.5) * 0.42, -0.42 - tier * 0.16],
        rotation: [0, side * (0.32 + tier * 0.08), side * (0.05 + tier * 0.025)],
        size: [0.34 + tier * 0.055, 3.8 - tier * 0.42, 0.13],
        scatter: [side * (3.8 + tier), (seeded(index, 12) - 0.5) * 6.5, (seeded(index, 13) - 0.5) * 5],
      };
    }),
    [],
  );

  useFrame((state, delta) => {
    const assembly = assemblyRef.current;
    const topologyGroup = topologyRef.current;
    const monolith = monolithRef.current;
    const core = coreRef.current;
    if (!assembly || !topologyGroup || !monolith || !core) return;
    delta = Math.min(delta, 0.05);

    if (reducedMotion || assembled) bootRef.current = 1;
    else bootRef.current = Math.min(1, bootRef.current + delta * 0.48);

    const boot = 1 - Math.pow(1 - bootRef.current, 4);
    const speed = overclock ? 2.8 : 1;
    assembly.rotation.x = reducedMotion ? -0.06 : THREE.MathUtils.damp(assembly.rotation.x, pointer.y * 0.2 - 0.06, 3.5, delta);
    assembly.rotation.y = reducedMotion ? 0.18 : THREE.MathUtils.damp(assembly.rotation.y, pointer.x * 0.34 + 0.18, 3.5, delta);
    assembly.scale.setScalar(0.58 + boot * 0.42);

    if (!reducedMotion) {
      topologyGroup.rotation.y += delta * 0.11 * speed;
      topologyGroup.rotation.z -= delta * 0.025 * speed;
      monolith.rotation.y = Math.sin(state.clock.elapsedTime * 0.22) * 0.08;
      core.rotation.x += delta * 0.09 * speed;
      core.rotation.y -= delta * 0.18 * speed;
    }

    if (coreMaterialRef.current) {
      coreMaterialRef.current.emissiveIntensity = (overclock ? 1.65 : 0.58) + (reducedMotion ? 0 : Math.sin(state.clock.elapsedTime * speed * 2.4) * 0.18);
    }

    const positionAttribute = nodeGeometryRef.current?.attributes?.position;
    if (positionAttribute && boot < 0.999) {
      const positions = positionAttribute.array;
      for (let index = 0; index < topology.count * 3; index += 1) {
        positions[index] = THREE.MathUtils.lerp(topology.origin[index], topology.target[index], boot);
      }
      positionAttribute.needsUpdate = true;
    }

    panels.forEach((panel, index) => {
      const mesh = panelRefs.current[index];
      if (!mesh) return;
      mesh.position.set(
        THREE.MathUtils.lerp(panel.scatter[0], panel.position[0], boot),
        THREE.MathUtils.lerp(panel.scatter[1], panel.position[1], boot),
        THREE.MathUtils.lerp(panel.scatter[2], panel.position[2], boot),
      );
      mesh.rotation.set(
        panel.rotation[0] + (1 - boot) * index * 0.5,
        panel.rotation[1] + (1 - boot) * 1.4,
        panel.rotation[2] + (1 - boot) * index * 0.28,
      );
    });

    pulseRefs.current.forEach((pulse, index) => {
      if (!pulse) return;
      const orbit = 1.72 + (index % 3) * 0.54;
      const phase = (reducedMotion ? 0 : state.clock.elapsedTime * (0.44 + (index % 4) * 0.09) * speed) + index * 0.83;
      pulse.position.set(
        Math.cos(phase) * orbit,
        Math.sin(phase * 1.7 + index) * (0.72 + (index % 2) * 0.24),
        Math.sin(phase) * orbit,
      );
    });
  });

  return (
    <group ref={assemblyRef} rotation={[-0.06, 0.18, 0]}>
      <group ref={monolithRef}>
        {panels.map((panel, index) => (
          <mesh
            key={`compiler-panel-${index}`}
            ref={(node) => { panelRefs.current[index] = node; }}
            position={panel.position}
            rotation={panel.rotation}
          >
            <boxGeometry args={panel.size} />
            <meshPhysicalMaterial
              color={index % 3 === 0 ? "#151717" : "#080909"}
              metalness={0.94}
              roughness={0.18}
              clearcoat={0.9}
              emissive={ACCENTS[index % 3]}
              emissiveIntensity={overclock && index % 2 === 0 ? 0.16 : 0.025}
            />
          </mesh>
        ))}
      </group>

      <group ref={topologyRef}>
        <points>
          <bufferGeometry ref={nodeGeometryRef}>
            <bufferAttribute attach="attributes-position" args={[nodePositions, 3]} />
          </bufferGeometry>
          <pointsMaterial
            color={overclock ? "#d8ff4f" : "#c5cac7"}
            size={overclock ? 0.052 : 0.034}
            sizeAttenuation
            transparent
            opacity={overclock ? 0.96 : 0.65}
            toneMapped={false}
          />
        </points>

        {Array.from({ length: 7 }, (_, index) => (
          <SignalArc key={`signal-arc-${index}`} index={index} overclock={overclock} />
        ))}

        {Array.from({ length: 12 }, (_, index) => (
          <mesh key={`routing-pulse-${index}`} ref={(node) => { pulseRefs.current[index] = node; }}>
            <sphereGeometry args={[index % 4 === 0 ? 0.072 : 0.04, 12, 12]} />
            <meshBasicMaterial color={ACCENTS[index % 3]} toneMapped={false} />
          </mesh>
        ))}

        {[0, 1, 2].map((index) => (
          <mesh key={`topology-ring-${index}`} rotation={[index * 0.72, index * 0.56, 0.32 + index * 0.44]}>
            <torusGeometry args={[1.82 + index * 0.52, 0.008 + index * 0.002, 8, 180]} />
            <meshBasicMaterial color={ACCENTS[index]} transparent opacity={overclock ? 0.72 : 0.28} toneMapped={false} />
          </mesh>
        ))}
      </group>

      <group ref={coreRef}>
        <mesh>
          <icosahedronGeometry args={[0.9, 4]} />
          <meshPhysicalMaterial
            color="#0a0b0b"
            metalness={0.96}
            roughness={0.12}
            clearcoat={1}
            emissive={overclock ? "#d8ff4f" : "#ff5f38"}
            emissiveIntensity={0.58}
          />
        </mesh>
        <mesh scale={0.68} rotation={[0.42, 0.18, 0.2]}>
          <octahedronGeometry args={[1, 2]} />
          <meshPhysicalMaterial
            ref={coreMaterialRef}
            color={overclock ? "#d8ff4f" : "#ff5f38"}
            emissive={overclock ? "#d8ff4f" : "#ff5f38"}
            emissiveIntensity={0.7}
            transparent
            opacity={0.78}
            roughness={0.12}
            toneMapped={false}
          />
        </mesh>
        <mesh scale={1.18} rotation={[0.1, 0.32, 0]}>
          <icosahedronGeometry args={[0.9, 2]} />
          <meshBasicMaterial color="#f4f4ed" wireframe transparent opacity={0.44} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

export function IdentityKernel({ reducedMotion = false }) {
  const rootRef = useRef(null);
  const hasBootedRef = useRef(false);
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState(reducedMotion ? 4 : 0);
  const [overclock, setOverclock] = useState(false);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return undefined;
    let nearViewport = !("IntersectionObserver" in window);
    const updateVisibility = () => setVisible(nearViewport && !document.hidden);
    const observer = "IntersectionObserver" in window ? new IntersectionObserver(([entry]) => {
      nearViewport = entry.isIntersecting;
      updateVisibility();
    }, { rootMargin: "220px" }) : null;
    observer?.observe(node);
    document.addEventListener("visibilitychange", updateVisibility);
    if (!observer) updateVisibility();
    return () => {
      observer?.disconnect();
      document.removeEventListener("visibilitychange", updateVisibility);
    };
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      setPhase(4);
      hasBootedRef.current = true;
      return undefined;
    }
    if (!visible || hasBootedRef.current) return undefined;

    const timers = [
      window.setTimeout(() => setPhase(1), 420),
      window.setTimeout(() => setPhase(2), 980),
      window.setTimeout(() => setPhase(3), 1580),
      window.setTimeout(() => {
        setPhase(4);
        hasBootedRef.current = true;
      }, 2320),
    ];
    return () => timers.forEach(window.clearTimeout);
  }, [reducedMotion, visible]);

  const phaseCopy = overclock ? ["MAX", "OVERCLOCK / ACTIVE"] : BOOT_PHASES[phase];

  return (
    <div className="identity-kernel-shell" ref={rootRef}>
      <button
        className={overclock ? "identity-kernel is-overclocked" : "identity-kernel"}
        type="button"
        onClick={() => setOverclock((value) => !value)}
        aria-label={overclock ? "Return systems kernel to normal power" : "Overclock the interactive systems kernel"}
        aria-pressed={overclock}
      >
        <span className="kernel-canvas" aria-hidden="true">
          {visible && (
            <Canvas
              camera={{ position: [0, 0.08, 7.25], fov: 42 }}
              dpr={[1, 1.5]}
              frameloop={visible && !reducedMotion ? "always" : "demand"}
              gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
            >
              <color attach="background" args={["#050505"]} />
              <fog attach="fog" args={["#050505", 7.6, 13]} />
              <ambientLight intensity={0.28} />
              <directionalLight position={[3.5, 5, 5]} color="#f5f3e9" intensity={3.2} />
              <pointLight position={[-3, -1, 3]} color="#ff5f38" intensity={overclock ? 10 : 5.4} distance={8} />
              <pointLight position={[3, 2, 1]} color="#d8ff4f" intensity={overclock ? 8 : 2.4} distance={7} />
              <pointLight position={[0, -3, -1]} color="#7ea8ff" intensity={2.8} distance={7} />
              <SystemsAssembly reducedMotion={reducedMotion} overclock={overclock} assembled={hasBootedRef.current} />
              <Sparkles
                count={overclock ? 92 : 42}
                scale={[8, 7, 5]}
                size={overclock ? 1.4 : 0.8}
                speed={reducedMotion ? 0 : overclock ? 0.8 : 0.18}
                color={overclock ? "#d8ff4f" : "#8f9693"}
                opacity={overclock ? 0.82 : 0.42}
              />
              <AdaptiveDpr pixelated />
              {!reducedMotion && (
                <EffectComposer multisampling={0}>
                  <Bloom luminanceThreshold={0.35} luminanceSmoothing={0.72} intensity={overclock ? 1.25 : 0.48} mipmapBlur />
                </EffectComposer>
              )}
            </Canvas>
          )}
        </span>

        {visible && !reducedMotion && !hasBootedRef.current && (
          <span className="kernel-boot-grid" aria-hidden="true">
            {BOOT_CELLS.map((cell, index) => (
              <motion.i
                key={index}
                initial={{ opacity: 1, scale: 1, rotate: 0 }}
                animate={{ opacity: 0, scale: 0.08, rotate: cell.rotate * 12 }}
                transition={{ duration: 0.46, delay: cell.delay, ease: [0.77, 0, 0.18, 1] }}
              />
            ))}
          </span>
        )}

        {visible && !reducedMotion && !hasBootedRef.current && (
          <motion.span
            className="kernel-scan"
            aria-hidden="true"
            initial={{ top: "0%", opacity: 0 }}
            animate={{ top: ["0%", "100%", "18%", "84%"], opacity: [0, 1, 0.4, 0] }}
            transition={{ duration: 2.35, times: [0, 0.44, 0.68, 1], ease: "easeInOut" }}
          />
        )}

        <span className="kernel-hud kernel-hud-top">
          <span>AK / SYSTEMS KERNEL</span>
          <strong><i /> LIVE WEBGL</strong>
        </span>

        <span className="kernel-compile-stack" aria-hidden="true">
          <span><i />MODEL LAYER</span>
          <span><i />AGENT BUS</span>
          <span><i />API MESH</span>
          <span><i />DATA PLANE</span>
        </span>

        <span className="kernel-phase" aria-live="polite">
          <strong>{phaseCopy[0]}</strong>
          <span>{phaseCopy[1]}</span>
        </span>

        <span className="identity-kernel-meta">
          <span>NEURAL REACTOR / AGENT TOPOLOGY / COMPILER CORE</span>
          <strong>{overclock ? "CLICK TO STABILIZE" : "CLICK TO OVERCLOCK"}</strong>
        </span>
      </button>
    </div>
  );
}
