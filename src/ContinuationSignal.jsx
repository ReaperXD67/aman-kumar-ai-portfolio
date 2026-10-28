import { useEffect, useRef } from "react";
import * as THREE from "three";
import { captureClipPath, smoothRange } from "./cinematic-motion.js";
import { createSignalSeeds, dampSignalCoordinate, readSignalCamera, signalCurrentFragment, signalCurrentVertex } from "./signal-current.js";

/** A single GPU current follows the reading route. Native content is protected
 * immediately; only the decorative camera and current settle behind scrolling. */
export function ContinuationSignal({ motion }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !motion?.current) return undefined;
    let request = 0, disposed = false, unavailable = false, lost = false;
    let width = 1, height = 1, ratio = 1, renderer, scene, camera, points, geometry, material;
    let narrow, signature = "", coordinate = null, lastTimestamp = 0, activeTime = 0;
    const target = new THREE.Vector3();
    const rectangles = Array.from({ length: 24 }, () => new THREE.Vector4());
    const uniforms = {
      uCoordinate: { value: 0 }, uTime: { value: 0 }, uAspect: { value: 1 },
      uPixelRatio: { value: 1 }, uReduced: { value: 0 },
      uRects: { value: rectangles }, uRectCount: { value: 0 },
      uViewport: { value: new THREE.Vector2(1, 1) },
    };

    const makeGeometry = () => {
      const phone = width < 700;
      if (geometry && narrow === phone) return;
      narrow = phone;
      geometry?.dispose();
      const count = phone ? 4_000 : 12_000;
      const seeds = createSignalSeeds(count);
      geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(seeds.positions, 3));
      geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds.seeds, 4));
      if (points) points.geometry = geometry;
      canvas.dataset.continuationPointcount = String(count);
    };
    const initialize = () => {
      if (renderer || unavailable || disposed) return Boolean(renderer);
      try {
        renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: "default" });
        renderer.setClearColor(0x000000, 0);
        renderer.setPixelRatio(ratio); renderer.setSize(width, height, false);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(38, width / height, .1, 70);
        makeGeometry();
        material = new THREE.ShaderMaterial({
          uniforms, vertexShader: signalCurrentVertex, fragmentShader: signalCurrentFragment,
          transparent: true, depthWrite: false, depthTest: false,
          blending: THREE.AdditiveBlending, toneMapped: false,
        });
        points = new THREE.Points(geometry, material); points.frustumCulled = false; scene.add(points);
        canvas.dataset.continuationRenderer = "webgl";
        canvas.dataset.continuationGeometry = "gpu-signal-current";
        return true;
      } catch {
        unavailable = true; canvas.dataset.continuationRenderer = "unavailable";
        geometry?.dispose(); material?.dispose(); renderer?.dispose(); renderer = null;
        return false;
      }
    };
    const protectContent = shot => {
      // CSS pixels match the shader's projected screen-space guard. Exclusions
      // are never damped: the words remain safe even during a fast anchor jump.
      let count = 0;
      for (const box of shot.exclusions || []) {
        if (count === rectangles.length) break;
        if (![box?.left, box?.top, box?.width, box?.height].every(Number.isFinite) || box.width <= 0 || box.height <= 0) continue;
        const right = box.left + box.width, bottom = box.top + box.height;
        if (right < 0 || bottom < 0 || box.left > width || box.top > height) continue;
        rectangles[count++].set(box.left, box.top, right, bottom);
      }
      uniforms.uRectCount.value = count;
      canvas.dataset.continuationRectcount = String(count);
      // Only owner/chrome bounds need a hard safety cut. Content uses the
      // shader's soft guard, so moving paragraphs no longer slice a solid form.
      const viewport = { left: 0, top: 0, width, height };
      const clip = captureClipPath(viewport, shot.hardExclusions || [], width, height);
      if (clip !== signature) { canvas.style.clipPath = clip; signature = clip; }
    };
    const suspend = () => {
      cancelAnimationFrame(request); request = 0; lastTimestamp = 0; coordinate = null;
      renderer?.clear();
    };
    const draw = timestamp => {
      request = 0;
      if (disposed || lost) return;
      const current = motion.current;
      // A flowing rAF can precede the director's scroll callback. Refresh its
      // native measurements first so masks never paint a frame behind scrolling.
      if (current.scrollY !== window.scrollY) current.refreshScene?.();
      const shot = current.scene;
      if (!current.visible || document.hidden || !shot) { suspend(); return; }
      if (!initialize()) return;
      makeGeometry();
      const next = Math.max(0, Math.min(4, Number.isFinite(shot.coordinate) ? shot.coordinate : 0));
      const reduced = Boolean(current.reduced), paused = Boolean(current.paused);
      const delta = lastTimestamp ? Math.min(.05, Math.max(0, (timestamp - lastTimestamp) / 1_000)) : 0;
      lastTimestamp = timestamp;
      if (coordinate === null || reduced) coordinate = next;
      else coordinate = dampSignalCoordinate(coordinate, next, delta || 1 / 60);
      if (Math.abs(coordinate - next) <= .0001) coordinate = next;
      const settling = !reduced && coordinate !== next;
      const flowing = !reduced && !paused;
      if (flowing) activeTime += delta;
      const aspect = width / height;
      const pose = readSignalCamera(coordinate, aspect, reduced);
      camera.position.set(...pose.position); target.set(...pose.target); camera.up.set(0, 1, 0); camera.lookAt(target);
      camera.fov = pose.fov; camera.aspect = aspect;
      camera.updateProjectionMatrix(); camera.updateMatrixWorld();
      uniforms.uCoordinate.value = coordinate; uniforms.uTime.value = activeTime;
      uniforms.uAspect.value = aspect; uniforms.uPixelRatio.value = ratio; uniforms.uReduced.value = reduced ? 1 : 0;
      uniforms.uViewport.value.set(width, height);
      protectContent(shot);
      // Discharge fully before the footer; a finished current does not linger
      // as a second visual behind the final native actions.
      const completion = smoothRange(coordinate, 3.93, 4);
      canvas.style.opacity = String(1 - completion);
      canvas.dataset.continuationAct = shot.act || "method";
      canvas.dataset.continuationCoordinate = coordinate.toFixed(4);
      canvas.dataset.continuationTarget = next.toFixed(4);
      canvas.dataset.continuationCamera = pose.position.map(value => value.toFixed(3)).join(",");
      canvas.dataset.continuationCompletion = completion.toFixed(3);
      canvas.dataset.continuationTime = activeTime.toFixed(3);
      canvas.dataset.continuationMotion = reduced ? "reduced" : settling ? "settling" : paused ? "paused" : "flowing";
      renderer.render(scene, camera);
      // Active flow runs only on screen. Paused motion can finish its camera
      // settle, then releases rAF completely; reduced motion is a single still.
      if (settling || (flowing && completion < 1)) request = requestAnimationFrame(draw);
      else lastTimestamp = 0;
    };
    const invalidate = () => {
      if (disposed || unavailable || lost) return;
      if (!motion.current.visible || document.hidden) { suspend(); return; }
      if (!request) request = requestAnimationFrame(draw);
    };
    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      width = Math.max(1, bounds.width); height = Math.max(1, bounds.height);
      ratio = Math.min(window.devicePixelRatio || 1, 1.35, Math.sqrt(1_200_000 / (width * height)));
      if (renderer) { renderer.setPixelRatio(ratio); renderer.setSize(width, height, false); }
      signature = ""; invalidate();
    };
    const contextLost = event => {
      event.preventDefault(); lost = true; cancelAnimationFrame(request); request = 0; lastTimestamp = 0;
      canvas.dataset.continuationRenderer = "suspended";
    };
    const contextRestored = () => {
      lost = false; lastTimestamp = 0;
      canvas.dataset.continuationRenderer = "webgl"; invalidate();
    };
    canvas.addEventListener("webglcontextlost", contextLost);
    canvas.addEventListener("webglcontextrestored", contextRestored);
    motion.current.invalidate = invalidate;
    const observer = new ResizeObserver(resize); observer.observe(canvas);
    document.addEventListener("visibilitychange", invalidate);
    resize();
    return () => {
      disposed = true; cancelAnimationFrame(request); observer.disconnect();
      document.removeEventListener("visibilitychange", invalidate);
      canvas.removeEventListener("webglcontextlost", contextLost); canvas.removeEventListener("webglcontextrestored", contextRestored);
      if (motion.current.invalidate === invalidate) motion.current.invalidate = null;
      geometry?.dispose(); material?.dispose(); renderer?.dispose(); renderer?.forceContextLoss();
    };
  }, [motion]);
  return <canvas className="continuation-signal-canvas" ref={canvasRef} aria-hidden="true" />;
}
