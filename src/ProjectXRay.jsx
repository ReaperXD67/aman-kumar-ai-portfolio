import { useEffect, useId, useRef, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowSquareOut, GithubLogo, Scan, Stack } from "@phosphor-icons/react";
import { useReducedMotion } from "./useMotionPreference.js";
import { PROJECT_XRAY, XRAY_PATHS } from "./project-xray-data.js";
import "./project-xray.css";

const STAGES = [
  { name: "Surface", depth: 0 },
  { name: "Structure", depth: 55 },
  { name: "Decisions", depth: 100 },
];

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function InspectionInstrument({ project }) {
  const reducedMotion = useReducedMotion();
  const [depth, setDepth] = useState(0);
  const [layerIndex, setLayerIndex] = useState(1);
  const [manual, setManual] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const visualRef = useRef(null);
  const hasInteracted = useRef(false);
  const sliderId = useId();
  const notes = PROJECT_XRAY[project.id];
  const layer = notes.layers[layerIndex];
  const inspecting = depth >= 25;
  const sourceDepth = depth >= 78;
  const currentStage = depth < 25 ? 0 : depth < 78 ? 1 : 2;

  // A short first peel follows ordinary page scroll. There is no pinned scene,
  // scroll interception or timeline after the visitor touches a control.
  useEffect(() => {
    if (reducedMotion || manual || !window.matchMedia("(min-width: 900px)").matches) return;
    const visual = visualRef.current;
    let frame = 0;
    let visible = false;
    let highestDepth = 0;
    const update = () => {
      frame = 0;
      if (!visible || hasInteracted.current || document.hidden) return;
      const top = visual.getBoundingClientRect().top;
      const next = Math.round(clamp((window.innerHeight * 0.54 - top) / (window.innerHeight * 0.55), 0, 1) * 34);
      if (next > highestDepth) {
        highestDepth = next;
        setDepth(next);
      }
    };
    const request = () => { if (visible && !frame) frame = window.requestAnimationFrame(update); };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) request();
    });
    observer.observe(visual);
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request, { passive: true });
    document.addEventListener("visibilitychange", request);
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
      document.removeEventListener("visibilitychange", request);
      window.cancelAnimationFrame(frame);
    };
  }, [manual, reducedMotion]);

  const takeControl = () => {
    hasInteracted.current = true;
    setManual(true);
  };
  const changeDepth = (value) => {
    takeControl();
    setDepth(value);
  };
  const selectLayer = (index) => {
    takeControl();
    setLayerIndex(index);
    setDepth(100);
  };

  return (
    <div className="xray-instrument" data-depth={Math.round(depth)} data-stage={STAGES[currentStage].name.toLowerCase()} data-project={project.id}>
      <div className="xray-instrument-bar">
        <div className="xray-build-name"><span className="xray-signal-dot" aria-hidden="true" /><strong>{project.name}</strong><span>{project.status}</span></div>
        <div className="xray-stages" role="group" aria-label="Inspection stage">
          {STAGES.map((stage, index) => (
            <button key={stage.name} type="button" aria-pressed={currentStage === index} className={currentStage === index ? "is-active" : ""} onClick={() => changeDepth(stage.depth)}>
              <span aria-hidden="true">0{index + 1}</span>{stage.name}
            </button>
          ))}
        </div>
      </div>

      <div className="xray-main">
        <div className="xray-visual" ref={visualRef} style={{ "--xray-depth": depth / 100 }} data-reduced-motion={Boolean(reducedMotion)}>
          <div className="xray-scene-label"><span>{project.feed}</span><span aria-hidden="true">FIG. {project.index} / EXPLODED VIEW</span></div>
          <div className="xray-lens" aria-label={`${project.name} interface and architectural layers`}>
            <div className="xray-registration" aria-hidden="true"><i /><i /><i /><i /></div>
            <div className="xray-depth-axis" aria-hidden="true"><span>SURFACE</span><i /><span>DECISIONS</span></div>

            <div className="xray-object">
              {notes.layers.map((item, index) => (
                <div className={`xray-plane ${layerIndex === index ? "is-selected" : ""}`} key={item.label} style={{ "--layer-index": index }} aria-hidden="true">
                  <div className="xray-plane-grid">{XRAY_PATHS[project.id][index].map((part) => <span key={part}>{part}</span>)}</div>
                  <div className="xray-plane-label"><span>0{index + 1}</span><strong>{item.label}</strong><small>{item.contract}</small></div>
                  <span className="xray-plane-terminal" />
                </div>
              ))}
              <figure className="xray-surface">
                {imageFailed ? (
                  <div className="xray-image-fallback"><strong>{project.name}</strong><span>Preview unavailable. The architecture and source links remain available.</span></div>
                ) : (
                  <img src={project.image} alt={project.imageAlt} loading="lazy" decoding="async" onError={() => setImageFailed(true)} />
                )}
                <figcaption><span>{project.live ? "CAPTURED INTERFACE" : "AUTHORED SYSTEM BLUEPRINT"}</span><span>{project.name}</span></figcaption>
                <div className="xray-cut-line" aria-hidden="true"><span>CUT THROUGH THE SURFACE</span></div>
              </figure>
            </div>

          </div>
          <div className="xray-lens-caption" aria-hidden="true">
            <span>{inspecting ? "THE PART THE SCREEN DOESN’T SHOW" : "THE PRODUCT IS ONLY THE SURFACE"}</span>
            <strong>{inspecting ? "Every layer has a reason." : "There’s more underneath."}</strong>
          </div>

          <div className="xray-depth-control">
            <label htmlFor={sliderId}><Scan size={18} aria-hidden="true" /><span>Inspection depth</span><output htmlFor={sliderId}>{String(Math.round(depth)).padStart(3, "0")}</output></label>
            <input id={sliderId} type="range" min="0" max="100" step="1" value={depth} aria-label="Inspection depth" aria-valuetext={`${Math.round(depth)} percent — ${STAGES[currentStage].name}`} onPointerDown={takeControl} onKeyDown={takeControl} onChange={(event) => changeDepth(Number(event.target.value))} style={{ "--range-fill": `${depth}%` }} />
            <div className="xray-depth-ends"><span>SEE THE PRODUCT</span><span>UNDERSTAND THE CHOICES <ArrowRight size={12} /></span></div>
          </div>

          <div className="xray-layer-selector" role="group" aria-label="Inspect an architecture layer">
            {notes.layers.map((item, index) => (
              <button type="button" key={item.label} aria-pressed={inspecting && layerIndex === index} aria-controls={`xray-decision-${project.id}`} className={inspecting && layerIndex === index ? "is-active" : ""} onClick={() => selectLayer(index)}>
                <span>0{index + 1}</span><strong>{item.label}</strong><ArrowRight size={14} aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>

        <aside className="xray-readout" id={`xray-decision-${project.id}`}>
          <div className="xray-readout-heading"><span>{inspecting ? "ARCHITECT’S NOTES" : "INSIDE THE BUILD"}</span><Stack size={18} aria-hidden="true" /></div>
          {!inspecting ? (
            <div className="xray-surface-notes">
              <h3>{project.headline}</h3>
              <p>{notes.surface}</p>
              <div className="xray-central-question"><span>THE ENGINEERING QUESTION</span><strong>{notes.boundary}</strong></div>
              <button className="xray-inspect-trigger" type="button" onClick={() => changeDepth(100)}>Open the engineering X-ray <ArrowRight size={20} /></button>
            </div>
          ) : (
            <div className="xray-decision-notes" key={layer.label}>
              <div className="xray-active-layer"><span>0{layerIndex + 1}</span><h3>{layer.component}</h3></div>
              <dl>
                <div><dt>What can fail</dt><dd>{layer.failure}</dd></div>
                <div className="xray-chosen-decision"><dt>The engineering choice</dt><dd>{layer.decision}</dd></div>
                <div><dt>The honest boundary</dt><dd>{layer.tradeoff}</dd></div>
              </dl>
              <a className="xray-source-link" href={`${project.repo}/blob/main/${layer.source}`} target="_blank" rel="noreferrer"><span><small>{sourceDepth ? "READ THE IMPLEMENTATION" : "FOLLOW THE EVIDENCE"}</small><strong>{layer.sourceLabel}</strong></span><ArrowSquareOut size={20} aria-hidden="true" /></a>
              {sourceDepth && <span className="xray-source-path">{layer.source}</span>}
            </div>
          )}
          <p className="xray-honesty-note">{notes.note}</p>
        </aside>
      </div>

      <div className="xray-footer">
        <div className="xray-tech">{project.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
        <div className="xray-project-links">
          {project.live && <a href={project.live} target="_blank" rel="noreferrer">{project.id === "revive" ? "Try live prototype" : "Open live site"}<ArrowSquareOut size={18} /></a>}
          <a href={project.repo} target="_blank" rel="noreferrer">Inspect source<GithubLogo size={19} /></a>
        </div>
      </div>
    </div>
  );
}

export function ProjectXRay({ projects }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeProject = projects[activeIndex];
  const tabRefs = useRef([]);
  const selectByKeyboard = (event, index) => {
    let next;
    if (event.key === "ArrowRight") next = (index + 1) % projects.length;
    if (event.key === "ArrowLeft") next = (index - 1 + projects.length) % projects.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = projects.length - 1;
    if (next === undefined) return;
    event.preventDefault();
    setActiveIndex(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <section className="work-section section xray-work" id="work">
      <header className="work-ledger-heading">
        <h2><span>The work.</span><em>Inside out.</em></h2>
        <p>Six builds. Their interfaces, their fault lines, and the decisions that hold them together. Move the inspection depth. Follow any layer to the source.</p>
      </header>
      <div className="xray-workbench" style={{ "--project-accent": activeProject.accent }}>
        <div className="xray-project-index" role="tablist" aria-label="Select a project to inspect">
          {projects.map((project, index) => (
            <button key={project.id} ref={(element) => { tabRefs.current[index] = element; }} type="button" role="tab" id={`xray-tab-${project.id}`} aria-selected={activeIndex === index} aria-controls="xray-project-panel" tabIndex={activeIndex === index ? 0 : -1} className={activeIndex === index ? "is-active" : ""} onClick={() => setActiveIndex(index)} onKeyDown={(event) => selectByKeyboard(event, index)}>
              <span>{project.index}</span><strong>{project.name}</strong><small>{project.status}</small><ArrowDown size={17} aria-hidden="true" />
            </button>
          ))}
        </div>
        <div id="xray-project-panel" role="tabpanel" aria-labelledby={`xray-tab-${activeProject.id}`}>
          <InspectionInstrument key={activeProject.id} project={activeProject} />
        </div>
        <div className="xray-browse">
          <span><strong>{String(activeIndex + 1).padStart(2, "0")}</strong> / {String(projects.length).padStart(2, "0")} BUILDS</span>
          <p>Real interfaces. Inspectable decisions. No simulated telemetry.</p>
          <div><button type="button" aria-label="Previous project" onClick={() => setActiveIndex((index) => (index - 1 + projects.length) % projects.length)}><ArrowLeft size={20} /></button><button type="button" aria-label="Next project" onClick={() => setActiveIndex((index) => (index + 1) % projects.length)}><ArrowRight size={20} /></button></div>
        </div>
      </div>
    </section>
  );
}
