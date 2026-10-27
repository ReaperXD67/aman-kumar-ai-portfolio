import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import "./project-portal.css";

gsap.registerPlugin(useGSAP);

const OUTGOING = { columns: 3, rows: 2 };
const INCOMING = { columns: 2, rows: 2 };
const DEADLINE_MS = 1080;
const WAIT_LIMIT_MS = 1400;

/** Shared visibility rule for selection scrolling and the deferred performance. */
export function readProjectStagePosition(stage) {
  const bounds = stage.getBoundingClientRect();
  const header = document.querySelector(".site-header")?.getBoundingClientRect();
  const dock = [...document.querySelectorAll(".signal-mobile-dock, .signal-dock")]
    .map(node => node.getBoundingClientRect()).find(bounds => bounds.width > 0 && bounds.height > 0);
  const top = Math.max(0, header?.bottom || 0) + 16;
  const bottom = Math.min(window.innerHeight - 16, dock?.height ? dock.top - 12 : Infinity);
  const visible = Math.max(0, Math.min(bounds.bottom, bottom) - Math.max(bounds.top, top));
  const required = Math.min(bounds.height, Math.max(1, bottom - top)) * 0.62;
  return { ready: bounds.height > 0 && visible >= required - 1, scrollTop: Math.max(0, window.scrollY + bounds.top - top) };
}

function ImagePlanes({ project, grid, direction }) {
  return (
    <div className={`project-handoff-frame project-handoff-${direction}`}>
      {Array.from({ length: grid.columns * grid.rows }, (_, index) => (
        <div
          className="project-handoff-plane"
          key={index}
          style={{
            "--plane-column": index % grid.columns,
            "--plane-row": Math.floor(index / grid.columns),
            "--plane-columns": grid.columns,
            "--plane-rows": grid.rows,
          }}
        >
          <img src={project.image} alt="" decoding="async" draggable="false" />
          <i />
        </div>
      ))}
    </div>
  );
}

/** One keyed performance: an interruption unmounts and reverts the old timeline. */
function SpatialHandoff({ previousProject, project }) {
  const scope = useRef(null);
  const [complete, setComplete] = useState(false);

  useGSAP((context, contextSafe) => {
    const root = scope.current;
    if (!root) return undefined;
    const frame = root.querySelector(".project-handoff-outgoing");
    const outgoing = [...frame.children];
    const incoming = [...root.querySelector(".project-handoff-incoming").children];
    const edge = root.querySelector(".project-handoff-registration");
    const stage = root.closest(".xray-lens");
    // Read geometry once; animate compositor transforms and opacity only.
    // The already-rendered new instrument is never hidden or disabled.
    const { width, height } = frame.getBoundingClientRect();
    const depth = width < 440 ? 370 : 590;
    let expiry, waitExpiry, frameRequest = 0;
    let started = false, finished = false;
    let observer;
    const finish = contextSafe(() => {
      if (finished) return;
      finished = true;
      window.clearTimeout(expiry);
      window.clearTimeout(waitExpiry);
      removeProximityListeners();
      timeline.kill();
      setComplete(true);
    });
    const timeline = gsap.timeline({ paused: true, defaults: { force3D: true }, onComplete: finish });

    gsap.set(outgoing, { opacity: 1, x: 0, y: 0, z: 0, rotationX: 0, rotationY: 0, rotationZ: 0, scale: 1 });
    gsap.set(incoming, { opacity: 0 });

    outgoing.forEach((plane, index) => {
      const column = index % OUTGOING.columns - 1;
      const row = Math.floor(index / OUTGOING.columns) - 0.5;
      // Separate a physical sheet, then curve its six image planes backward.
      timeline.to(plane, {
        x: column * width * 0.045,
        y: row * height * 0.065,
        z: 42 + (1 - Math.abs(column)) * 58,
        rotationX: row * -17,
        rotationY: column * -15,
        rotationZ: column * -2.5,
        duration: 0.24,
        ease: "power2.inOut",
      }, index * 0.012);
      timeline.to(plane, {
        x: -width * 0.63 + column * width * 0.16,
        y: -height * 0.30 + row * height * 0.58,
        z: -depth - (column + 1) * 88,
        rotationX: 22 + row * 32,
        rotationY: 64 + column * 17,
        rotationZ: -13 + column * 8,
        scale: 0.48,
        opacity: 0,
        duration: 0.60,
        ease: "power2.in",
      }, 0.26 + index * 0.014);
    });

    incoming.forEach((plane, index) => {
      const column = index % INCOMING.columns - 0.5;
      const row = Math.floor(index / INCOMING.columns) - 0.5;
      // Assemble the next capture into its existing surface frame. The ordinary
      // new project capture is already rendered underneath these moving planes.
      timeline.fromTo(plane, {
        x: width * (0.23 + column * 0.13),
        y: row * height * 0.25,
        z: -depth * 0.85 - index * 42,
        rotationX: row * -25,
        rotationY: -39 + column * 14,
        rotationZ: 7 + column * 5,
        scale: 0.72,
        opacity: 0,
      }, {
        x: 0, y: 0, z: 0,
        rotationX: 0, rotationY: 0, rotationZ: 0,
        scale: 1,
        opacity: 1,
        duration: 0.70,
        ease: "power3.out",
        immediateRender: true,
      }, 0.22 + index * 0.025);
    });
    timeline.fromTo(edge, { opacity: 0, scale: 0.94 }, { opacity: 0.66, scale: 1, duration: 0.31, ease: "power2.out" }, 0.39);
    timeline.to(edge, { opacity: 0, duration: 0.24 }, 0.77);
    // The 1.04 s performance starts only once most of the stage is visible.
    // Scrolling is native and owned by selection; this observer never scrolls.
    timeline.to(root, { opacity: 0, duration: 0.045, ease: "none" }, 0.995);
    const removeProximityListeners = () => {
      observer?.disconnect();
      window.removeEventListener("scroll", requestStart);
      window.removeEventListener("resize", requestStart);
      window.cancelAnimationFrame(frameRequest);
      frameRequest = 0;
    };
    const startWhenVisible = contextSafe(() => {
      frameRequest = 0;
      if (started || finished || document.hidden || !stage || !readProjectStagePosition(stage).ready) return;
      started = true;
      window.clearTimeout(waitExpiry);
      removeProximityListeners();
      root.dataset.portalState = "playing";
      timeline.play(0);
      expiry = window.setTimeout(finish, DEADLINE_MS);
    });
    function requestStart() {
      if (!started && !finished && !frameRequest) frameRequest = window.requestAnimationFrame(startWhenVisible);
    }
    observer = new IntersectionObserver(requestStart, { threshold: [0, 0.25, 0.5, 0.75, 1] });
    observer.observe(stage);
    window.addEventListener("scroll", requestStart, { passive: true });
    window.addEventListener("resize", requestStart);
    // If the visitor cancels the native scroll or leaves, discard the unplayed
    // decoration rather than surprise them with a delayed performance later.
    waitExpiry = window.setTimeout(finish, WAIT_LIMIT_MS);
    startWhenVisible();
    return () => {
      finished = true;
      window.clearTimeout(expiry);
      window.clearTimeout(waitExpiry);
      removeProximityListeners();
      timeline.kill();
    };
  }, { scope, dependencies: [previousProject.id, project.id], revertOnUpdate: true });

  if (complete) return null;
  return (
    <div
      className="project-handoff"
      ref={scope}
      aria-hidden="true"
      data-project-portal="spatial"
      data-portal-state="waiting"
      data-portal-from={previousProject.id}
      data-portal-to={project.id}
    >
      <div className="project-handoff-volume">
        <ImagePlanes project={project} grid={INCOMING} direction="incoming" />
        <ImagePlanes project={previousProject} grid={OUTGOING} direction="outgoing" />
        <div className="project-handoff-registration"><i /><i /><i /><i /></div>
      </div>
    </div>
  );
}

/** Decorative continuity: the actual project and controls update immediately. */
export function ProjectPortal({ previousProject, project, reducedMotion }) {
  if (!previousProject || previousProject.id === project.id || reducedMotion) return null;
  return <SpatialHandoff key={`${previousProject.id}:${project.id}`} previousProject={previousProject} project={project} />;
}
