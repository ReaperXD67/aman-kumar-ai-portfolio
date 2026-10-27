import { useEffect, useState } from "react";

const SHUTTERS = 8;

/** A bounded optical handoff between real captures, never an empty loading screen. */
export function ProjectPortal({ previousProject, project, reducedMotion }) {
  const [complete, setComplete] = useState(!previousProject || reducedMotion);

  useEffect(() => {
    if (!previousProject || reducedMotion) {
      setComplete(true);
      return undefined;
    }
    setComplete(false);
    const timer = window.setTimeout(() => setComplete(true), 780);
    return () => window.clearTimeout(timer);
  }, [previousProject, project.id, reducedMotion]);

  if (complete) return null;

  return (
    <div className="project-portal" aria-hidden="true" style={{ "--shutter-count": SHUTTERS }}>
      {Array.from({ length: SHUTTERS }, (_, index) => (
        <div className="project-portal-shutter" key={index} style={{ "--shutter-index": index, "--shutter-direction": index % 2 ? 1 : -1 }}>
          <img src={previousProject.image} alt="" decoding="async" />
          <i />
        </div>
      ))}
      <span className="project-portal-name">{project.name}</span>
    </div>
  );
}
