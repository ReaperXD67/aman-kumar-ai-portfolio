import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Edges, Sparkles, useTexture } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "motion/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const ARTIFACTS = [
  { image: "/assets/atlaslm-landing.png", name: "AtlasLM", position: [3.2, 0.65, -17], rotation: [0, -0.34, -0.035] },
  { image: "/assets/autonomous-agent.svg", name: "Agent Control", position: [-3.3, -0.6, -28], rotation: [0, 0.36, 0.045] },
  { image: "/assets/revive-cinematic-core.png", name: "Revive", position: [2.7, 0.15, -39], rotation: [0, -0.28, -0.02] },
];

const clamp = THREE.MathUtils.clamp;
const smoothstep = (start, end, value) => {
  const normalized = clamp((value - start) / (end - start), 0, 1);
  return normalized * normalized * (3 - 2 * normalized);
};

function ScrollCamera({ progressRef, reducedMotion }) {
  const { camera } = useThree();
  const current = useRef(reducedMotion ? 0.82 : 0);
  const previous = useRef(0);
  const velocity = useRef(0);

  useFrame((state, delta) => {
    const target = reducedMotion ? 0.82 : progressRef.current;
    current.current = THREE.MathUtils.damp(current.current, target, 5.5, delta);
    const progress = current.current;
    velocity.current = THREE.MathUtils.damp(
      velocity.current,
      clamp((progress - previous.current) / Math.max(delta, 0.001), -1.6, 1.6),
      6,
      delta,
    );
    previous.current = progress;

    camera.position.z = THREE.MathUtils.lerp(10.2, -43.5, progress);
    camera.position.x = Math.sin(progress * Math.PI * 4.2) * 0.24 + velocity.current * 0.12;
    camera.position.y = Math.cos(progress * Math.PI * 3.1) * 0.16;
    camera.rotation.z = Math.sin(progress * Math.PI * 5) * 0.012 + velocity.current * 0.018;
    camera.lookAt(camera.position.x * 0.14, camera.position.y * 0.12, camera.position.z - 8);
  });
  return null;
}

function FracturedCore({ progressRef, reducedMotion }) {
  const core = useRef();
  const shell = useRef();
  const fragments = useRef([]);
  const fragmentData = useMemo(
    () => Array.from({ length: 30 }, (_, index) => {
      const angle = index * 2.39996;
      const lift = -1 + (index / 29) * 2;
      const radius = Math.sqrt(1 - lift * lift);
      return {
        vector: new THREE.Vector3(Math.cos(angle) * radius, lift, Math.sin(angle) * radius),
        rotation: [angle * 0.27, angle * 0.17, angle * 0.11],
        scale: 0.07 + (index % 5) * 0.018,
      };
    }),
    [],
  );

  useFrame((state, delta) => {
    const progress = reducedMotion ? 0.2 : progressRef.current;
    const fracture = smoothstep(0.035, 0.2, progress);
    if (core.current) {
      core.current.rotation.y += delta * (0.16 + fracture * 0.5);
      core.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.38) * 0.12;
      core.current.scale.setScalar(1 + fracture * 0.4);
    }
    if (shell.current) {
      shell.current.rotation.z -= delta * 0.08;
      shell.current.scale.setScalar(1 + fracture * 1.5);
    }
    fragments.current.forEach((fragment, index) => {
      if (!fragment) return;
      const data = fragmentData[index];
      const distance = 1.45 + fracture * (4.4 + (index % 6) * 0.38);
      fragment.position.copy(data.vector).multiplyScalar(distance);
      fragment.rotation.x += delta * (0.22 + index * 0.002);
      fragment.rotation.y -= delta * (0.18 + index * 0.003);
    });
  });

  return (
    <group position={[0, 0, 2.2]}>
      <group ref={core}>
        <mesh>
          <icosahedronGeometry args={[1.34, 4]} />
          <meshPhysicalMaterial color="#180a07" metalness={0.85} roughness={0.14} emissive="#ff5f38" emissiveIntensity={0.34} />
        </mesh>
        <mesh scale={1.02}>
          <icosahedronGeometry args={[1.34, 2]} />
          <meshBasicMaterial color="#ff5f38" wireframe transparent opacity={0.68} toneMapped={false} />
        </mesh>
      </group>
      <group ref={shell}>
        <mesh rotation={[Math.PI / 2.3, 0.1, 0.3]}>
          <torusGeometry args={[2.35, 0.018, 10, 220]} />
          <meshBasicMaterial color="#f5f5f1" transparent opacity={0.54} />
        </mesh>
        <mesh rotation={[0.2, Math.PI / 2.1, -0.4]}>
          <torusGeometry args={[2.7, 0.014, 10, 220]} />
          <meshBasicMaterial color="#ff5f38" transparent opacity={0.76} toneMapped={false} />
        </mesh>
      </group>
      {fragmentData.map((fragment, index) => (
        <mesh
          key={index}
          ref={(node) => { fragments.current[index] = node; }}
          rotation={fragment.rotation}
          scale={fragment.scale}
        >
          <tetrahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color={index % 4 === 0 ? "#ff5f38" : "#7e8585"} metalness={0.92} roughness={0.18} emissive={index % 4 === 0 ? "#ff5f38" : "#000000"} emissiveIntensity={0.24} />
        </mesh>
      ))}
    </group>
  );
}

function TunnelGates({ progressRef, reducedMotion }) {
  const group = useRef();
  const gates = useMemo(
    () => Array.from({ length: 13 }, (_, index) => ({
      z: -5 - index * 4.15,
      radius: 3.15 + Math.sin(index * 1.8) * 0.42,
      rotation: [Math.sin(index) * 0.12, Math.cos(index * 0.7) * 0.12, index * 0.31],
      color: index % 4 === 0 ? "#ff5f38" : index % 5 === 0 ? "#d8ff4f" : "#596060",
    })),
    [],
  );
  useFrame((state, delta) => {
    if (!group.current) return;
    const progress = reducedMotion ? 0.82 : progressRef.current;
    group.current.rotation.z = Math.sin(progress * Math.PI * 4) * 0.09;
    group.current.children.forEach((gate, index) => {
      gate.rotation.z += delta * (index % 2 ? -0.045 : 0.038);
      gate.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 0.65 + index) * 0.018);
    });
  });
  return (
    <group ref={group}>
      {gates.map((gate, index) => (
        <mesh key={index} position={[0, 0, gate.z]} rotation={gate.rotation}>
          <torusGeometry args={[gate.radius, index % 3 === 0 ? 0.032 : 0.012, 10, 180]} />
          <meshBasicMaterial color={gate.color} transparent opacity={index % 3 === 0 ? 0.84 : 0.36} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function RealityMembrane({ progressRef, reducedMotion }) {
  const mesh = useRef();
  useFrame((state) => {
    if (!mesh.current) return;
    const progress = reducedMotion ? 0.82 : progressRef.current;
    mesh.current.material.uniforms.uTime.value = state.clock.elapsedTime;
    mesh.current.material.uniforms.uIntensity.value = 1 - smoothstep(0.28, 0.42, progress);
  });
  return (
    <mesh ref={mesh} position={[0, 0, -10.4]}>
      <planeGeometry args={[15, 10, 72, 48]} />
      <shaderMaterial
        transparent
        side={THREE.DoubleSide}
        depthWrite={false}
        uniforms={{
          uTime: { value: 0 },
          uIntensity: { value: 1 },
          uColor: { value: new THREE.Color("#ff5f38") },
        }}
        vertexShader={`
          uniform float uTime;
          uniform float uIntensity;
          varying vec2 vUv;
          varying float vWave;
          void main() {
            vUv = uv;
            vec3 p = position;
            float wave = sin(p.x * 1.55 + uTime * 0.72) * cos(p.y * 1.9 - uTime * 0.58);
            p.z += wave * 0.34 * uIntensity;
            vWave = wave;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
          }
        `}
        fragmentShader={`
          uniform vec3 uColor;
          uniform float uIntensity;
          varying vec2 vUv;
          varying float vWave;
          void main() {
            vec2 centered = vUv - 0.5;
            float radius = length(centered);
            float ring = 1.0 - smoothstep(0.012, 0.042, abs(radius - 0.28 - vWave * 0.012));
            float gridX = 1.0 - smoothstep(0.0, 0.018, abs(fract(vUv.x * 19.0) - 0.5));
            float gridY = 1.0 - smoothstep(0.0, 0.018, abs(fract(vUv.y * 13.0) - 0.5));
            float alpha = (ring * 0.9 + max(gridX, gridY) * 0.12) * uIntensity;
            gl_FragColor = vec4(uColor, alpha);
          }
        `}
      />
    </mesh>
  );
}

function ArtifactScreens({ progressRef, reducedMotion }) {
  const textures = useTexture(ARTIFACTS.map((artifact) => artifact.image));
  const refs = useRef([]);
  useEffect(() => {
    textures.forEach((texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 4;
    });
  }, [textures]);
  useFrame((state, delta) => {
    const progress = reducedMotion ? 0.82 : progressRef.current;
    refs.current.forEach((screen, index) => {
      if (!screen) return;
      const artifact = ARTIFACTS[index];
      const cameraProgress = (10.2 - artifact.position[2]) / 53.7;
      const proximity = 1 - clamp(Math.abs(progress - cameraProgress) / 0.17, 0, 1);
      screen.rotation.y = THREE.MathUtils.damp(screen.rotation.y, artifact.rotation[1] * (1 - proximity * 0.72), 3.4, delta);
      screen.position.y = artifact.position[1] + Math.sin(state.clock.elapsedTime * 0.5 + index) * 0.08;
      screen.scale.setScalar(0.9 + proximity * 0.14);
    });
  });
  return (
    <>
      {ARTIFACTS.map((artifact, index) => (
        <group
          key={artifact.name}
          ref={(node) => { refs.current[index] = node; }}
          position={artifact.position}
          rotation={artifact.rotation}
        >
          <mesh>
            <planeGeometry args={[4.8, 2.95]} />
            <meshBasicMaterial map={textures[index]} toneMapped={false} />
            <Edges color={index === 2 ? "#ff5f38" : "#8d9392"} threshold={15} />
          </mesh>
          <mesh position={[0, 0, -0.06]} scale={[1.055, 1.09, 1]}>
            <planeGeometry args={[4.8, 2.95]} />
            <meshBasicMaterial color="#050505" />
          </mesh>
        </group>
      ))}
    </>
  );
}

function NeuralField({ reducedMotion }) {
  const points = useMemo(() => {
    const positions = new Float32Array(1500 * 3);
    for (let index = 0; index < 1500; index += 1) {
      const z = 7 - Math.random() * 59;
      const angle = Math.random() * Math.PI * 2;
      const radius = 1.1 + Math.pow(Math.random(), 0.54) * 7.2;
      positions[index * 3] = Math.cos(angle) * radius;
      positions[index * 3 + 1] = Math.sin(angle) * radius * 0.67;
      positions[index * 3 + 2] = z;
    }
    return positions;
  }, []);
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[points, 3]} />
      </bufferGeometry>
      <pointsMaterial size={reducedMotion ? 0.025 : 0.035} color="#bbc0be" transparent opacity={0.58} sizeAttenuation depthWrite={false} />
    </points>
  );
}

function DescentScene({ progressRef, reducedMotion }) {
  return (
    <>
      <color attach="background" args={["#020303"]} />
      <fog attach="fog" args={["#020303", 6, 21]} />
      <ambientLight intensity={0.38} />
      <directionalLight position={[3, 4, 8]} intensity={3.8} color="#f5f2e8" />
      <pointLight position={[0, 0, 2]} intensity={10} distance={12} color="#ff5f38" />
      <ScrollCamera progressRef={progressRef} reducedMotion={reducedMotion} />
      <FracturedCore progressRef={progressRef} reducedMotion={reducedMotion} />
      <TunnelGates progressRef={progressRef} reducedMotion={reducedMotion} />
      <RealityMembrane progressRef={progressRef} reducedMotion={reducedMotion} />
      <ArtifactScreens progressRef={progressRef} reducedMotion={reducedMotion} />
      <NeuralField reducedMotion={reducedMotion} />
      <Sparkles count={54} scale={[12, 8, 56]} position={[0, 0, -22]} size={0.8} speed={reducedMotion ? 0 : 0.22} color="#ff8a6d" opacity={0.34} />
      {!reducedMotion && (
        <EffectComposer multisampling={0}>
          <Bloom luminanceThreshold={0.42} luminanceSmoothing={0.7} intensity={0.62} mipmapBlur />
        </EffectComposer>
      )}
    </>
  );
}

const CHAPTERS = [
  { word: "SIGNAL", line: "Noise becomes evidence." },
  { word: "REASON", line: "Evidence becomes a decision." },
  { word: "ACTION", line: "The decision becomes a system." },
];

export function CognitiveDescent() {
  const sectionRef = useRef(null);
  const progressRef = useRef(0);
  const reducedMotion = useReducedMotion();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!sectionRef.current || !("IntersectionObserver" in window)) return undefined;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: "220px" });
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useGSAP(() => {
    if (reducedMotion) {
      progressRef.current = 0.82;
      return undefined;
    }
    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.55,
        onUpdate: (self) => {
          progressRef.current = self.progress;
          sectionRef.current?.style.setProperty("--journey-progress", self.progress.toFixed(4));
        },
      },
    });
    timeline
      .to(".descent-intro", { autoAlpha: 0, y: -90, duration: 0.11, ease: "power2.in" }, 0.035)
      .fromTo(".descent-chapter-signal", { autoAlpha: 0, y: 130, scale: 0.82 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.12, ease: "expo.out" }, 0.14)
      .to(".descent-chapter-signal", { autoAlpha: 0, y: -110, scale: 1.08, duration: 0.1, ease: "power2.in" }, 0.29)
      .fromTo(".descent-chapter-reason", { autoAlpha: 0, y: 130, scale: 0.82 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.12, ease: "expo.out" }, 0.36)
      .to(".descent-chapter-reason", { autoAlpha: 0, y: -110, scale: 1.08, duration: 0.1, ease: "power2.in" }, 0.51)
      .fromTo(".descent-chapter-action", { autoAlpha: 0, y: 130, scale: 0.82 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.12, ease: "expo.out" }, 0.58)
      .to(".descent-chapter-action", { autoAlpha: 0, y: -110, scale: 1.08, duration: 0.1, ease: "power2.in" }, 0.72)
      .fromTo(".descent-exit", { autoAlpha: 0, clipPath: "inset(48% 0 48% 0)" }, { autoAlpha: 1, clipPath: "inset(0% 0 0% 0)", duration: 0.17, ease: "expo.out" }, 0.79)
      .fromTo(".descent-exit-word span", { opacity: 0.08 }, { opacity: 1, stagger: 0.022, duration: 0.08, ease: "none" }, 0.82);

    gsap.fromTo(".descent-velocity-line", { scaleY: 0 }, {
      scaleY: 1,
      ease: "none",
      scrollTrigger: { trigger: sectionRef.current, start: "top top", end: "bottom bottom", scrub: true },
    });
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    return () => timeline.kill();
  }, { scope: sectionRef, dependencies: [reducedMotion] });

  return (
    <section className="descent-section" ref={sectionRef} aria-label="Scroll-controlled cognitive system journey">
      <div className="descent-stage">
        <div className="descent-canvas" aria-hidden="true">
          {visible && <Canvas
            className="descent-webgl"
            camera={{ position: [0, 0, 10.2], fov: 48 }}
            dpr={[1, 1.2]}
            frameloop={!reducedMotion ? "always" : "demand"}
            gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
          >
            <DescentScene progressRef={progressRef} reducedMotion={reducedMotion} />
          </Canvas>}
        </div>

        <div className="descent-hud" aria-hidden="true">
          <div className="descent-hud-top"><span>SCROLL OWNS TIME</span><span>LIVE SYSTEM / NO AUTOPLAY</span></div>
          <div className="descent-velocity"><i className="descent-velocity-line" /></div>
          <div className="descent-hud-bottom"><span>DEPTH / <b>53.7</b></span><span>WEBGL / ACTIVE</span></div>
        </div>

        <div className="descent-intro" aria-hidden="true">
          <p>Don’t watch the system.</p>
          <h2>Enter it.</h2>
          <span>Keep scrolling. Every movement is yours.</span>
        </div>

        {CHAPTERS.map((chapter, index) => (
          <div key={chapter.word} className={`descent-chapter descent-chapter-${chapter.word.toLowerCase()}`} aria-hidden="true">
            <h2>{chapter.word}</h2>
            <p>{chapter.line}</p>
            <span>{String(index + 1).padStart(2, "0")} / {String(CHAPTERS.length).padStart(2, "0")}</span>
          </div>
        ))}

        <div className="descent-exit">
          <div className="descent-exit-word" aria-hidden="true">
            {"THE SYSTEM BECOMES PROOF".split(" ").map((word) => <span key={word}>{word}</span>)}
          </div>
          <p>Six systems survived the descent.</p>
          <a href="#work">Open the evidence</a>
        </div>

        <p className="sr-only">A scroll-controlled visualization shows signals becoming evidence, evidence becoming decisions, and decisions becoming production systems.</p>
      </div>
    </section>
  );
}
