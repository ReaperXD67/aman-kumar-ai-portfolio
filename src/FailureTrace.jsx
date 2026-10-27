import { useEffect, useId, useRef, useState } from "react";
import { ArrowRight, ArrowSquareOut, Play, Stop } from "@phosphor-icons/react";
import { PROJECT_TRACES, TRACE_STAGES } from "./project-traces.js";

export function FailureTrace({ project, notes, reducedMotion, onInspect, controlVersion }) {
  const trace = PROJECT_TRACES[project.id];
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const rootRef = useRef(null);
  const outputId = useId();
  const layer = notes.layers[trace.layer];

  // A finite, explicit playback; leaving the viewport or tab stops the sequence.
  useEffect(() => {
    if (!playing || reducedMotion) return undefined;
    const stop = () => { if (document.hidden) setPlaying(false); };
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) setPlaying(false);
    });
    observer.observe(rootRef.current);
    document.addEventListener("visibilitychange", stop);
    const timer = window.setTimeout(() => {
      if (step === 2) setPlaying(false);
      else { setStep(value => value + 1); onInspect(trace.layer, step + 1); }
    }, step === 0 ? 1700 : 2400);
    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
      document.removeEventListener("visibilitychange", stop);
    };
  }, [playing, step, reducedMotion, onInspect, trace.layer]);

  useEffect(() => { if (reducedMotion) setPlaying(false); }, [reducedMotion]);
  useEffect(() => { setPlaying(false); }, [controlVersion]);

  const select = (index) => {
    setPlaying(false);
    setStep(index);
    onInspect(trace.layer, index);
  };

  return (
    <section className="failure-trace" data-trace-step={step} ref={rootRef} aria-label={`${project.name} failure walkthrough`}>
      <header>
        <div><span>CHALLENGE THE SYSTEM / 0{trace.layer + 1}</span><h3>{trace.title}</h3></div>
        <button type="button" className="trace-play" aria-label={playing ? "Stop failure walkthrough" : reducedMotion ? "Show failure guard" : "Play failure walkthrough"} onClick={() => {
          if (playing) { setPlaying(false); return; }
          if (reducedMotion) { select(2); return; }
          setStep(0); onInspect(trace.layer, 0); setPlaying(true);
        }}>{playing ? <Stop size={15} weight="fill" /> : <Play size={15} weight="fill" />}<span>{playing ? "Stop trace" : reducedMotion ? "Show guard" : "Run the trace"}</span></button>
      </header>
      <div className="trace-route" role="group" aria-label="Failure walkthrough stage">
        {TRACE_STAGES.map((stage, index) => (
          <button type="button" key={stage.key} aria-pressed={step === index} aria-controls={outputId} onClick={() => select(index)}>
            <span className="trace-node">0{index + 1}</span><strong>{stage.label}</strong><ArrowRight size={15} aria-hidden="true" />
          </button>
        ))}
      </div>
      <div className="trace-output" id={outputId} aria-live="polite" aria-atomic="true">
        <span className="trace-state"><i aria-hidden="true" />{trace.signal[step]}</span>
        <p key={step}>{trace[TRACE_STAGES[step].key]}</p>
        <a href={`${project.repo}/blob/main/${layer.source}`} target="_blank" rel="noreferrer">Inspect {layer.sourceLabel.toLowerCase()}<ArrowSquareOut size={16} aria-hidden="true" /></a>
      </div>
      <footer>Source walkthrough · illustrative inputs · no requests sent to the project.</footer>
    </section>
  );
}
