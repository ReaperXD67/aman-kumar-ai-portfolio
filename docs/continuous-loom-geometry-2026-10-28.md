# Continuous Loom geometry contract

The hero sculpture now exports `LoomSculpture` for the single persistent world. `SignalCore` remains a standalone fallback. The original titanium/graphite material language, three semantic modes, portrait and recruiter controls remain the visual authority; this change joins geometry through space rather than adding another transition layer.

## Shared ownership

`LoomSculpture` accepts the existing mode, reduced-motion, pause, boot and journey props, plus `shared=false`. With `shared=true`, it returns geometry only: no lights, environment generation, camera mutation or ownership of `journey.current.invalidate`. The world director supplies those resources and owns scroll timing. There is no additional Canvas or compositor in the shared path.

`journey.current.progress` is the hero-to-entry passage, from zero to one. It is already scrubbed by the world director, so the shared sculpture adds no secondary time lag. `journey.current.flight` is the later project flight. Once that exceeds `0.2`, the whole sculpture becomes invisible and skips its frame-update work. Reverse scrolling restores the same objects without a React remount.

## Physical continuity

At passage one, every mode resolves to group position `[0, 0, 6]`, rotation `[0, π/2, 0]` and unit scale. Nine original apertures lie at local X `-4.6 … 4.6`, mapping to world Z `10.6 … 1.4`. Their final local Y/Z scales are `2.6 / 3.6`. Residual entrance scatter, frame wave, torsion and angular metal strain all resolve to zero at this endpoint.

The ribbons unfurl into longitudinal ellipse rails along those apertures. Their local Y/Z radii are `2.07 / 3.35`; the Y radius includes clearance for the actual inward bevel and the thickest signal ribbon. They no longer collapse into a narrow beam. The separate descent continues the same material world after this physical entry.

## Fluid motion and lighting

Mode weights use a smooth, normalized blend with zero velocity at the reasoning boundary. A visitor-triggered mode change introduces a bounded elastic impulse; a coherent traveling wave bends the ribbon field and reorganizes the nine metal sections. The PBR metal vertices also receive a small angular strain. An analytic inverse-transpose normal correction keeps reflections attached to those surfaces, and the edge geometry receives the same deformation. Their culling bounds include the bounded GPU strain.

All scalar, color and vector values still synchronize to the actual GPU material refs, including `uMorph` and the passage uniform. Shared geometry does not replace the world director's camera or PMREM. Pause freezes continuous wave time and the current elastic impulse; reduced motion uses a settled representative form and direct mode changes. No per-frame vertex arrays or React state updates were added.

## Verification

`node --test tests/loom-geometry.test.mjs` passes four focused geometry tests: normalized mode endpoints, finite/nonsingular elastic frames, common world-space entry alignment across modes, and ribbon clearance inside the bevelled opening. JSX bundle parsing and the Impeccable mechanical detector also passed. These checks establish source/math contracts; the root integration's browser pass remains responsible for shader compilation, composition and the complete shared-camera handoff. No new package or borrowed studio asset was introduced.
