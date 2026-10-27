import { useEffect, useRef } from "react";
import { XRAY_CIRCUITS, circuitPath } from "./XRayCircuit.jsx";
import { fitEntryPoint, sampleCircuitEntry } from "./methodEntryGeometry.js";

const ACCENTS = ["#ff5f38", "#d8ff4f", "#7ea8ff", "#f1f1eb"];
const PARTICLE_COUNT = 84;
const ENTRY_DURATION = 1200;

function seeded(index, salt = 0) {
  const value = Math.sin((index + 1) * (12.9898 + salt * 17.17)) * 43758.5453;
  return value - Math.floor(value);
}

function targetFor(stage, index, width, height) {
  const pad = Math.min(width, height) * 0.13;
  const usableW = width - pad * 2;
  const usableH = height - pad * 2;
  const column = index % 12;
  const row = Math.floor(index / 12);

  if (stage === 0) {
    const hubs = [
      [0.18, 0.32], [0.38, 0.63], [0.58, 0.29], [0.8, 0.57],
    ];
    const hub = hubs[index % hubs.length];
    const angle = index * 2.14;
    const radius = 12 + (index % 7) * 3.2;
    return [pad + hub[0] * usableW + Math.cos(angle) * radius, pad + hub[1] * usableH + Math.sin(angle) * radius];
  }

  if (stage === 1) {
    const gate = Math.floor(column / 3);
    const lane = row % 7;
    return [pad + (0.08 + gate * 0.29 + (column % 3) * 0.035) * usableW, pad + (0.1 + lane * 0.13) * usableH];
  }

  if (stage === 2) {
    const lane = index % 6;
    const progress = Math.floor(index / 6) / 13;
    return [pad + progress * usableW, pad + (0.13 + lane * 0.145) * usableH + Math.sin(progress * Math.PI * 4 + lane) * 6];
  }

  const frame = index % 3;
  const local = Math.floor(index / 3);
  const frameX = [0.06, 0.41, 0.72][frame];
  const frameW = [0.27, 0.24, 0.22][frame];
  const localCol = local % 5;
  const localRow = Math.floor(local / 5) % 6;
  return [pad + (frameX + localCol * (frameW / 4)) * usableW, pad + (0.12 + localRow * 0.145) * usableH];
}

function drawStructure(context, stage, width, height, accent, time, strength = 1) {
  context.save();
  context.globalAlpha = strength;
  context.strokeStyle = "rgba(197, 203, 199, 0.12)";
  context.lineWidth = 1;
  for (let x = 0; x <= width; x += 48) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, height);
    context.stroke();
  }
  for (let y = 0; y <= height; y += 48) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(width, y);
    context.stroke();
  }

  context.strokeStyle = accent;
  context.globalAlpha = 0.52 * strength;
  if (stage === 1) {
    [0.24, 0.48, 0.72].forEach((ratio, index) => {
      const x = width * ratio;
      context.setLineDash([4, 7]);
      context.beginPath();
      context.moveTo(x, height * 0.12);
      context.lineTo(x, height * 0.88);
      context.stroke();
      context.setLineDash([]);
      context.strokeRect(x - 13, height * (0.24 + index * 0.18), 26, 42);
    });
  } else if (stage === 2) {
    for (let lane = 0; lane < 6; lane += 1) {
      const y = height * (0.2 + lane * 0.12);
      context.beginPath();
      context.moveTo(width * 0.08, y);
      context.bezierCurveTo(width * 0.35, y - 18, width * 0.65, y + 18, width * 0.92, y);
      context.stroke();
    }
  } else if (stage === 3) {
    [[0.1, 0.18, 0.26, 0.62], [0.42, 0.18, 0.22, 0.62], [0.7, 0.18, 0.2, 0.62]].forEach((frame, index) => {
      context.strokeRect(frame[0] * width, frame[1] * height, frame[2] * width, frame[3] * height);
      context.fillStyle = accent;
      context.globalAlpha = (0.22 + Math.sin(time * 0.0015 + index) * 0.08) * strength;
      context.fillRect(frame[0] * width, frame[1] * height, frame[2] * width, 3);
    });
  }
  context.restore();
}

function entryFor(signal) {
  const circuit = XRAY_CIRCUITS[signal?.projectId]?.[signal?.layerIndex];
  if (!circuit) return null;
  const geometry = sampleCircuitEntry(circuit.nodes, circuit.routes.map(connection => circuitPath(circuit, connection)), PARTICLE_COUNT);
  return geometry ? { projectId: signal.projectId, layerIndex: signal.layerIndex, geometry } : null;
}

function drawEntryStructure(context, geometry, width, height, accent, strength) {
  if (strength <= 0) return;
  context.save();
  context.globalAlpha = strength;
  context.strokeStyle = accent;
  context.lineWidth = 1.2;
  geometry.paths.forEach(path => {
    context.beginPath();
    path.forEach((point, index) => {
      const [x, y] = fitEntryPoint(point, width, height);
      if (index === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    });
    context.stroke();
  });
  context.fillStyle = "#070808";
  geometry.nodes.forEach(point => {
    const [x, y] = fitEntryPoint(point, width, height);
    context.fillRect(x - 5, y - 5, 10, 10);
    context.strokeRect(x - 5, y - 5, 10, 10);
  });
  context.restore();
}

export function MethodField({ activeIndex, reducedMotion, entrySignal, continuation }) {
  const canvasRef = useRef(null);
  const pointerRef = useRef({ x: -999, y: -999, active: false });
  const particlesRef = useRef([]);
  const controllerRef = useRef(null);
  const entryLifeRef = useRef({ phase: "pending", elapsed: 0, entry: null });
  const continuationRef = useRef(continuation);
  continuationRef.current = continuation;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) return undefined;
    let frameId = 0;
    let width = 1;
    let height = 1;
    let pixelRatio = 1;
    let visible = !("IntersectionObserver" in window);
    let previousTime = 0;
    let targets = [];
    let sourcePoints = [];
    let outputPoints = [];
    const displayedPoints = Array.from({ length: PARTICLE_COUNT }, () => ({ x: 0, y: 0 }));
    const normalizedPoints = Array.from({ length: PARTICLE_COUNT }, () => ({ x: 0, y: 0 }));
    let measured = false;
    let stage = activeIndex;
    let reduced = Boolean(reducedMotion);
    let candidateEntry = entryFor(entrySignal);
    const life = entryLifeRef.current;

    const reportEntry = () => {
      const entry = life.entry || candidateEntry;
      canvas.dataset.entryProject = entry?.projectId || "";
      canvas.dataset.entryLayer = entry ? String(entry.layerIndex) : "";
      canvas.dataset.entryState = life.phase;
    };
    const setPhase = phase => { life.phase = phase; reportEntry(); };
    const refreshTargets = () => {
      targets = Array.from({ length: PARTICLE_COUNT }, (_, index) => targetFor(stage, index, width, height));
      const entry = life.entry || candidateEntry;
      sourcePoints = entry ? entry.geometry.points.map(point => fitEntryPoint(point, width, height)) : [];
      // One continuous perimeter, sampled by physical edge length rather than
      // four equal-count sides. This becomes the next artifact's registration.
      const pad = Math.min(width, height) * .13;
      const innerWidth = width - pad * 2, innerHeight = height - pad * 2;
      const perimeter = 2 * (innerWidth + innerHeight);
      outputPoints = Array.from({ length: PARTICLE_COUNT }, (_, index) => {
        let distance = index / PARTICLE_COUNT * perimeter;
        if (distance <= innerWidth) return [pad + distance, pad];
        distance -= innerWidth;
        if (distance <= innerHeight) return [width - pad, pad + distance];
        distance -= innerHeight;
        if (distance <= innerWidth) return [width - pad - distance, height - pad];
        return [pad, height - pad - (distance - innerWidth)];
      });
    };
    const takeControl = () => {
      // Lock the provenance even if a visitor interrupts before the first frame.
      if (!life.entry) life.entry = candidateEntry;
      setPhase("interactive");
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const previousWidth = width;
      const previousHeight = height;
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      if (!particlesRef.current.length) {
        particlesRef.current = Array.from({ length: PARTICLE_COUNT }, (_, index) => ({
          x: 0,
          y: 0,
          size: 1.3 + seeded(index, 3) * 2.7,
        }));
      } else if (measured) {
        particlesRef.current.forEach((particle) => {
          particle.x *= width / previousWidth;
          particle.y *= height / previousHeight;
        });
      }
      refreshTargets();
      if (!measured || life.phase === "pending") {
        particlesRef.current.forEach((particle, index) => {
          const point = !reduced && life.phase === "pending" && sourcePoints.length ? sourcePoints[index] : targets[index];
          [particle.x, particle.y] = point;
        });
      }
      measured = true;
    };

    const render = (time = 0) => {
      frameId = 0;
      if (!visible || document.hidden) return;
      // Keep convergence consistent on both 60 Hz phones and high-refresh displays.
      const delta = previousTime ? Math.min(time - previousTime, 50) : 0;
      const frameScale = delta ? delta / (1000 / 60) : 1;
      previousTime = time;
      if (life.phase === "pending") {
        life.entry = candidateEntry;
        setPhase(!reduced && life.entry ? "transferring" : "settled");
      }
      if (reduced && life.phase === "transferring") setPhase("settled");
      if (life.phase === "transferring") life.elapsed = Math.min(ENTRY_DURATION, life.elapsed + delta);
      const progress = life.phase === "transferring" ? life.elapsed / ENTRY_DURATION : 1;
      // A short readable source hold, then one finite redistribution. The clock
      // accumulates visible frame time only; scrolling back cannot restart it.
      const t = Math.max(0, Math.min(1, (progress - 0.14) / 0.86));
      const transfer = t * t * t * (t * (t * 6 - 15) + 10);
      const output = continuationRef.current?.current;
      const outputProgress = reduced ? 0 : Math.max(0, Math.min(1, output?.methodExit || 0));
      const exit = outputProgress * outputProgress * outputProgress * (outputProgress * (outputProgress * 6 - 15) + 10);
      context.fillStyle = "#070808";
      context.fillRect(0, 0, width, height);
      const accent = ACCENTS[stage];
      drawStructure(context, stage, width, height, accent, time, transfer * (1 - exit));
      if (life.phase === "transferring") drawEntryStructure(context, life.entry.geometry, width, height, accent, (1 - transfer) * (1 - exit));

      const particles = particlesRef.current;
      particles.forEach((particle, index) => {
        const [targetX, targetY] = targets[index];
        if (life.phase === "transferring") {
          const [sourceX, sourceY] = sourcePoints[index];
          particle.x = sourceX + (targetX - sourceX) * transfer;
          particle.y = sourceY + (targetY - sourceY) * transfer;
        } else {
          const ease = reduced ? 1 : 1 - Math.pow(1 - (0.045 + (index % 5) * 0.006), frameScale);
          particle.x += (targetX - particle.x) * ease;
          particle.y += (targetY - particle.y) * ease;
        }

        const pointer = pointerRef.current;
        const dx = particle.x - pointer.x;
        const dy = particle.y - pointer.y;
        const distance = Math.hypot(dx, dy);
        if (!reduced && pointer.active && distance < 105 && distance > 0) {
          const force = (1 - distance / 105) * 2.6 * frameScale;
          particle.x += (dx / distance) * force;
          particle.y += (dy / distance) * force;
        }
        // Scroll changes only the visible projection, never simulation state.
        // Reversing restores the current principle without replaying entry.
        const displayed = displayedPoints[index], framePoint = outputPoints[index];
        displayed.x = particle.x + (framePoint[0] - particle.x) * exit;
        displayed.y = particle.y + (framePoint[1] - particle.y) * exit;
        normalizedPoints[index].x = displayed.x / width;
        normalizedPoints[index].y = displayed.y / height;
      });

      if (output) {
        const changed = output.points !== normalizedPoints || output.accent !== accent;
        output.points = normalizedPoints;
        output.accent = accent;
        if (changed) {
          if (output.scene) { output.scene.points = normalizedPoints; output.scene.accent = accent; }
          output.invalidate?.();
        }
      }
      const reportedExit = outputProgress.toFixed(3);
      if (canvas.dataset.outputProgress !== reportedExit) canvas.dataset.outputProgress = reportedExit;

      if (exit > 0) {
        const pad = Math.min(width, height) * .13;
        context.strokeStyle = accent;
        context.globalAlpha = exit * .34;
        context.lineWidth = 1;
        context.strokeRect(pad, pad, width - pad * 2, height - pad * 2);
        context.globalAlpha = 1;
      }

      context.lineWidth = 0.7;
      displayedPoints.forEach((particle, index) => {
        if (stage === 0 && life.phase !== "transferring") {
          const peer = displayedPoints[(index + 4) % displayedPoints.length];
          if (Math.hypot(peer.x - particle.x, peer.y - particle.y) < 120) {
            context.strokeStyle = index % 4 === 0 ? accent : "rgba(203, 208, 204, 0.17)";
            context.globalAlpha = 1 - exit;
            context.beginPath();
            context.moveTo(particle.x, particle.y);
            context.lineTo(peer.x, peer.y);
            context.stroke();
            context.globalAlpha = 1;
          }
        }
        const size = particles[index].size;
        const pulse = reduced ? 0 : Math.sin(time * 0.002 + index) * 0.7;
        context.fillStyle = index % (6 - Math.min(stage, 2)) === 0 ? accent : "rgba(225, 228, 223, 0.76)";
        context.fillRect(particle.x - size / 2, particle.y - size / 2, size + pulse, size + pulse);
      });

      if (life.phase === "transferring" && progress === 1) setPhase("settled");
      if (!reduced) frameId = requestAnimationFrame(render);
    };

    const resume = () => {
      if (visible && !document.hidden && !frameId) frameId = requestAnimationFrame(render);
    };
    const pause = () => {
      cancelAnimationFrame(frameId);
      frameId = 0;
      previousTime = 0;
      pointerRef.current.active = false;
    };
    const onVisibilityChange = () => {
      if (document.hidden) pause();
      else resume();
    };
    const chamber = canvas.closest(".method-chamber");
    const onChamberInput = event => {
      if (event.type === "pointerdown" || event.type === "keydown" || event.target.closest?.('[role="tab"]')) {
        takeControl();
        resume();
      }
    };
    controllerRef.current = {
      takeControl,
      resume,
      setStage(next) {
        if (stage === next) return;
        stage = next;
        takeControl();
        refreshTargets();
        resume();
      },
      setReduced(next) {
        reduced = Boolean(next);
        if (reduced && life.phase !== "interactive") setPhase("settled");
        resume();
      },
      setEntry(signal) {
        if (life.phase !== "pending") return;
        candidateEntry = entryFor(signal);
        resize();
        reportEntry();
        resume();
      },
    };
    const visibilityObserver = "IntersectionObserver" in window ? new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && entry.intersectionRatio >= 0.12;
      if (visible) resume();
      else pause();
    }, { threshold: [0, 0.12] }) : null;
    const observer = new ResizeObserver(() => {
      resize();
      resume();
    });
    observer.observe(canvas);
    visibilityObserver?.observe(canvas);
    document.addEventListener("visibilitychange", onVisibilityChange);
    ["pointerdown", "keydown", "pointerover", "focusin"].forEach(name => chamber?.addEventListener(name, onChamberInput, true));
    resize();
    reportEntry();
    resume();

    return () => {
      observer.disconnect();
      visibilityObserver?.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      ["pointerdown", "keydown", "pointerover", "focusin"].forEach(name => chamber?.removeEventListener(name, onChamberInput, true));
      controllerRef.current = null;
      pause();
    };
  }, []);

  useEffect(() => {
    controllerRef.current?.setStage(activeIndex);
    // A tab can remain visible after its canvas has left the viewport. Carry
    // that explicit selection onward without waking an offscreen simulation.
    const output = continuationRef.current?.current;
    if (output) {
      output.accent = ACCENTS[activeIndex];
      if (output.scene) output.scene.accent = output.accent;
      output.invalidate?.();
    }
  }, [activeIndex]);
  useEffect(() => { controllerRef.current?.setReduced(reducedMotion); }, [reducedMotion]);
  useEffect(() => { controllerRef.current?.setEntry(entrySignal); }, [entrySignal?.projectId, entrySignal?.layerIndex]);
  useEffect(() => {
    const state = continuation?.current;
    const request = controllerRef.current?.resume;
    if (!state || !request) return undefined;
    state.requestMethodFrame = request;
    return () => { if (state.requestMethodFrame === request) state.requestMethodFrame = null; };
  }, [continuation]);

  return (
    <canvas
      ref={canvasRef}
      className="method-field-canvas"
      aria-hidden="true"
      data-entry-project=""
      data-entry-layer=""
      data-entry-state="pending"
      data-output-progress="0.000"
      onPointerDown={() => { controllerRef.current?.takeControl(); controllerRef.current?.resume(); }}
      onPointerMove={(event) => {
        if (reducedMotion || event.pointerType === "touch") return;
        controllerRef.current?.takeControl();
        controllerRef.current?.resume();
        const rect = event.currentTarget.getBoundingClientRect();
        pointerRef.current = { x: event.clientX - rect.left, y: event.clientY - rect.top, active: true };
      }}
      onPointerLeave={() => { pointerRef.current.active = false; }}
      onPointerCancel={() => { pointerRef.current.active = false; }}
    />
  );
}
