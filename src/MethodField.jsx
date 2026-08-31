import { useEffect, useRef } from "react";

const ACCENTS = ["#ff5f38", "#d8ff4f", "#7ea8ff", "#f1f1eb"];
const PARTICLE_COUNT = 84;

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

function drawStructure(context, stage, width, height, accent, time) {
  context.save();
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
  context.globalAlpha = 0.52;
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
      context.globalAlpha = 0.22 + Math.sin(time * 0.0015 + index) * 0.08;
      context.fillRect(frame[0] * width, frame[1] * height, frame[2] * width, 3);
    });
  }
  context.restore();
}

export function MethodField({ activeIndex, reducedMotion }) {
  const canvasRef = useRef(null);
  const pointerRef = useRef({ x: -999, y: -999, active: false });
  const particlesRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const context = canvas.getContext("2d", { alpha: false });
    let frameId = 0;
    let width = 1;
    let height = 1;
    let pixelRatio = 1;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      if (!particlesRef.current.length) {
        particlesRef.current = Array.from({ length: PARTICLE_COUNT }, (_, index) => ({
          x: seeded(index, 1) * width,
          y: seeded(index, 2) * height,
          size: 1.3 + seeded(index, 3) * 2.7,
        }));
      }
    };

    const render = (time = 0) => {
      context.fillStyle = "#070808";
      context.fillRect(0, 0, width, height);
      const accent = ACCENTS[activeIndex];
      drawStructure(context, activeIndex, width, height, accent, time);

      const particles = particlesRef.current;
      particles.forEach((particle, index) => {
        const [targetX, targetY] = targetFor(activeIndex, index, width, height);
        const ease = reducedMotion ? 1 : 0.045 + (index % 5) * 0.006;
        particle.x += (targetX - particle.x) * ease;
        particle.y += (targetY - particle.y) * ease;

        const pointer = pointerRef.current;
        const dx = particle.x - pointer.x;
        const dy = particle.y - pointer.y;
        const distance = Math.hypot(dx, dy);
        if (pointer.active && distance < 105 && distance > 0) {
          const force = (1 - distance / 105) * 2.6;
          particle.x += (dx / distance) * force;
          particle.y += (dy / distance) * force;
        }
      });

      context.lineWidth = 0.7;
      particles.forEach((particle, index) => {
        if (activeIndex === 0) {
          const peer = particles[(index + 4) % particles.length];
          if (Math.hypot(peer.x - particle.x, peer.y - particle.y) < 120) {
            context.strokeStyle = index % 4 === 0 ? accent : "rgba(203, 208, 204, 0.17)";
            context.beginPath();
            context.moveTo(particle.x, particle.y);
            context.lineTo(peer.x, peer.y);
            context.stroke();
          }
        }
        const pulse = reducedMotion ? 0 : Math.sin(time * 0.002 + index) * 0.7;
        context.fillStyle = index % (6 - Math.min(activeIndex, 2)) === 0 ? accent : "rgba(225, 228, 223, 0.76)";
        context.fillRect(particle.x - particle.size / 2, particle.y - particle.size / 2, particle.size + pulse, particle.size + pulse);
      });

      if (!reducedMotion) frameId = requestAnimationFrame(render);
    };

    const observer = new ResizeObserver(() => {
      resize();
      if (reducedMotion) render();
    });
    observer.observe(canvas);
    resize();
    render();

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frameId);
    };
  }, [activeIndex, reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      className="method-field-canvas"
      aria-hidden="true"
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        pointerRef.current = { x: event.clientX - rect.left, y: event.clientY - rect.top, active: true };
      }}
      onPointerLeave={() => { pointerRef.current.active = false; }}
    />
  );
}
