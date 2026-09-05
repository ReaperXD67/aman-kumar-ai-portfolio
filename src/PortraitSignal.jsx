import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { ArrowCounterClockwise, ArrowUpRight, Cpu, User } from "@phosphor-icons/react";
import { useReducedMotion } from "./useMotionPreference.js";
import "./portrait-signal.css";

const PORTRAIT = "/profile/aman-portrait.webp";
const Kernel = lazy(() => import("./IdentityKernel.jsx").then((module) => ({ default: module.IdentityKernel })));
const clamp = (value) => Math.min(1, Math.max(0, value));
const noise = (index) => ((index * 7919 + 104729) % 65521) / 65521;

/** Finite, viewport-aware raster assembly. The actual photograph remains the final image. */
function RasterPortrait({ reducedMotion, replay, onComplete }) {
  const frameRef = useRef(null);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const [complete, setComplete] = useState(Boolean(reducedMotion));

  useEffect(() => {
    const frame = frameRef.current;
    const canvas = canvasRef.current;
    const photo = imageRef.current;
    if (!frame || !canvas || !photo) return undefined;
    const context = canvas.getContext("2d", { alpha: false });
    let disposed = false;
    let raf = 0;
    let visible = false;
    let ready = false;
    let finished = Boolean(reducedMotion || !context);
    let elapsed = 0;
    let previous = 0;
    let width = 0;
    let height = 0;
    let pixels;
    const cols = 36;
    const rows = 44;
    const sample = document.createElement("canvas");
    sample.width = cols;
    sample.height = rows;
    const sampler = sample.getContext("2d", { willReadFrequently: true });
    let crop = [0, 0, 1, 1];

    const finish = () => {
      finished = true;
      setComplete(true);
      onComplete();
    };
    setComplete(finished);
    if (finished) { onComplete(); return undefined; }

    const resize = () => {
      ({ width, height } = frame.getBoundingClientRect());
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (photo.naturalWidth && height) {
        const scale = Math.max(width / photo.naturalWidth, height / photo.naturalHeight);
        const sw = width / scale;
        const sh = height / scale;
        crop = [(photo.naturalWidth - sw) / 2, (photo.naturalHeight - sh) * 0.32, sw, sh];
        sampler.drawImage(photo, ...crop, 0, 0, cols, rows);
        pixels = sampler.getImageData(0, 0, cols, rows).data;
      }
      if (ready) draw(elapsed / 2850);
    };

    const draw = (progress) => {
      if (!width || !height || !pixels) return;
      context.globalAlpha = 1;
      context.fillStyle = "#080b0b";
      context.fillRect(0, 0, width, height);
      const cw = width / cols;
      const ch = height / rows;
      const [sx, sy, sw, sh] = crop;
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const index = row * cols + col;
          const n = noise(index);
          const phase = clamp((progress - row / rows * 0.52 - n * 0.13) / 0.31);
          const x = col * cw;
          const y = row * ch;
          if (!phase) {
            context.fillStyle = n > 0.94 ? "#374128" : "#101616";
            context.fillRect(x + cw / 2, y + ch / 2, 1, 1);
            continue;
          }
          const settle = 1 - Math.pow(1 - phase, 3);
          const dx = x + (n - 0.5) * width * 0.55 * (1 - settle);
          const dy = y - (1 - settle) * height * (0.14 + n * 0.23);
          const size = 0.15 + 0.85 * settle;
          const pixel = index * 4;
          context.globalAlpha = Math.min(1, phase * 2.5);
          context.fillStyle = `rgb(${pixels[pixel]} ${pixels[pixel + 1]} ${pixels[pixel + 2]})`;
          context.fillRect(dx, dy, cw * size + 0.5, ch * size + 0.5);
          if (phase > 0.35) {
            context.globalAlpha = clamp((phase - 0.35) / 0.65);
            context.drawImage(photo, sx + col / cols * sw, sy + row / rows * sh,
              sw / cols, sh / rows, dx, dy, cw + 0.5, ch + 0.5);
          }
        }
      }
      context.globalAlpha = Math.sin(clamp(progress / 0.87) * Math.PI) * 0.65;
      context.fillStyle = "#d8ff4f";
      context.fillRect(0, height * clamp((progress - 0.05) / 0.73), width, 1);
      context.globalAlpha = 1;
      frame.style.setProperty("--raster-progress", clamp(progress).toFixed(3));
    };
    const tick = (now) => {
      if (!visible || document.hidden || finished || disposed) { previous = 0; raf = 0; return; }
      // Duration follows visible wall time, even when a low-power device drops frames.
      if (previous) elapsed += Math.max(0, now - previous);
      previous = now;
      draw(clamp(elapsed / 2850));
      if (elapsed >= 2850) { raf = 0; finish(); }
      else raf = requestAnimationFrame(tick);
    };
    const start = () => {
      if (ready && visible && !document.hidden && !finished && !raf) raf = requestAnimationFrame(tick);
    };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; start(); }, { threshold: 0.18 });
    observer.observe(frame);
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(frame);
    document.addEventListener("visibilitychange", start);
    photo.decode().then(() => {
      if (disposed) return;
      ready = true;
      resize();
      start();
    }).catch(() => { if (!disposed) finish(); });
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      observer.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", start);
    };
  }, [reducedMotion, replay, onComplete]);

  return (
    <div className={`raster-portrait ${complete ? "is-resolved" : "is-assembling"}`} ref={frameRef}>
      <img ref={imageRef} src={PORTRAIT} alt="Aman Kumar, AI Engineer and Full-Stack Developer" width="1000" height="1000" decoding="async" />
      <canvas ref={canvasRef} aria-hidden="true" />
      <div className="portrait-registration" aria-hidden="true"><i /><i /><i /><i /></div>
      <span className="portrait-edge-label" aria-hidden="true">A.K. / THE PERSON BEHIND THE SYSTEM</span>
      <div className="portrait-nameplate">
        <span>HELLO, I'M</span>
        <strong>Aman<span>Kumar.</span></strong>
        <p>Engineering is personal.<br />So is the responsibility.</p>
      </div>
    </div>
  );
}

export function PortraitSignal() {
  const reducedMotion = useReducedMotion();
  const [view, setView] = useState("person");
  const [replay, setReplay] = useState(0);
  const [resolved, setResolved] = useState(false);
  const frameRef = useRef(null);
  // Stable callback prevents animation restarts when status changes.
  const completeRef = useRef(() => setResolved(true));
  const move = (event) => {
    if (reducedMotion || event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    frameRef.current?.style.setProperty("--portrait-x", `${((event.clientX - rect.left) / rect.width - 0.5) * 5}px`);
    frameRef.current?.style.setProperty("--portrait-y", `${((event.clientY - rect.top) / rect.height - 0.5) * 5}px`);
  };
  const reset = () => {
    frameRef.current?.style.setProperty("--portrait-x", "0px");
    frameRef.current?.style.setProperty("--portrait-y", "0px");
  };
  return (
    <div className={`portrait-instrument is-${view}`} ref={frameRef} onPointerMove={move} onPointerLeave={reset}>
      <header className="portrait-instrument-header">
        <span>01 / HUMAN IN THE LOOP</span>
        <span className="portrait-state" role="status"><i />{view === "system" ? "SYSTEM VIEW" : resolved ? "AMAN / ONLINE" : "RESOLVING IDENTITY"}</span>
      </header>
      <div className="portrait-instrument-stage" id="identity-view" role="region" aria-label={view === "person" ? "Meet Aman Kumar" : "Interactive systems kernel"}>
        {view === "person" ? <RasterPortrait reducedMotion={reducedMotion} replay={replay} onComplete={completeRef.current} /> : (
          <Suspense fallback={<div className="identity-kernel-fallback">INITIALIZING SYSTEMS KERNEL</div>}>
            <Kernel reducedMotion={reducedMotion} />
          </Suspense>
        )}
      </div>
      <footer className="portrait-instrument-footer">
        <div role="group" aria-label="Identity view">
          <button type="button" aria-pressed={view === "person"} aria-controls="identity-view" onClick={() => { if (view !== "person") setResolved(false); setView("person"); }}><User size={15} />The person</button>
          <button type="button" aria-pressed={view === "system"} aria-controls="identity-view" onClick={() => setView("system")}><Cpu size={16} />The system</button>
        </div>
        <button type="button" className="portrait-replay" aria-label="Replay portrait assembly" title={reducedMotion ? "Reduced motion is enabled" : "Replay portrait assembly"} disabled={Boolean(reducedMotion) || view === "system"} onClick={() => { setResolved(false); setReplay(value => value + 1); }}><ArrowCounterClockwise size={17} /></button>
      </footer>
    </div>
  );
}

export function PortraitSignature() {
  return (
    <a className="portrait-signature" href="#about" aria-label="Meet Aman Kumar, previously AI Engineer Intern at micro1">
      <span className="portrait-signature-image"><img src="/profile/aman-portrait-small.webp" alt="Aman Kumar" width="160" height="160" /><i aria-hidden="true" /></span>
      <span className="portrait-signature-copy"><strong>Aman Kumar<span>THE ENGINEER BEHIND THE SYSTEMS</span></strong><small>BUILDING AT SIP <b>↗</b> PREVIOUSLY AT micro1</small></span>
      <ArrowUpRight size={18} aria-hidden="true" />
    </a>
  );
}
