import { useEffect, useRef } from "react";
import * as THREE from "three";
import { captureClipPath } from "./cinematic-motion.js";
import { createSignalSeeds, dampSignalCoordinate, readSignalCamera, signalCurrentFragment, signalCurrentVertex } from "./signal-current.js";
import { createPortraitColours, portraitCoverCrop } from "./portrait-colours.js";

/** A single GPU current follows the reading route. Native content is protected
 * immediately; only the decorative camera and current settle behind scrolling. */
export function ContinuationSignal({ motion }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !motion?.current) return undefined;
    let request = 0, disposed = false, unavailable = false, lost = false;
    let width = 1, height = 1, ratio = 1, renderer, scene, camera, points, geometry, material;
    let narrow, signature = "", coordinate = null, sourcePresence = null, lastTimestamp = 0, activeTime = 0;
    let protectedScene = null, cameraCoordinate = null, cameraAspect = null, cameraReduced = null, pose;
    let diagnosticAt = -Infinity, diagnosticState = "", opacity = null;
    let seedValues, palette = null, sampleCanvas, sampler, failedPaletteKey = "";
    const owner = canvas.closest(".cinematic-continuation");
    const watchedImages = new Set();
    const target = new THREE.Vector3();
    const rectangles = Array.from({ length: 24 }, () => new THREE.Vector4());
    const uniforms = {
      uCoordinate: { value: 0 }, uTime: { value: 0 }, uAspect: { value: 1 },
      uPixelRatio: { value: 1 }, uReduced: { value: 0 },
      uRects: { value: rectangles }, uRectCount: { value: 0 },
      uViewport: { value: new THREE.Vector2(1, 1) },
      uSource: { value: new THREE.Vector4() }, uReceiver: { value: new THREE.Vector4() },
      uPortrait: { value: new THREE.Vector4() }, uContact: { value: new THREE.Vector4() },
      uPeel: { value: new THREE.Vector2() }, uScroll: { value: 0 },
    };

    const applyPalette = () => {
      if (!geometry || !seedValues) return;
      const colours = createPortraitColours(seedValues, palette?.pixels, palette ? 64 : 0, palette ? 64 : 0);
      const attribute = geometry.getAttribute("aPortraitColor");
      if (attribute?.array.length === colours.length) {
        attribute.array.set(colours); attribute.needsUpdate = true;
      } else geometry.setAttribute("aPortraitColor", new THREE.BufferAttribute(colours, 3));
      canvas.dataset.continuationPalette = palette?.kind || "fallback";
    };
    const imageLoaded = () => {
      if (disposed) return;
      refreshPalette();
      // A paused or reduced-motion still also needs one frame after image load.
      invalidate();
    };
    const refreshPalette = () => {
      const full = owner?.querySelector(".raster-portrait > img");
      const thumbnail = document.querySelector(".portrait-signature-image img");
      const candidates = [full, thumbnail].filter(Boolean);
      for (const image of watchedImages) {
        if (candidates.includes(image)) continue;
        image.removeEventListener("load", imageLoaded); watchedImages.delete(image);
      }
      for (const image of candidates) {
        if (watchedImages.has(image)) continue;
        image.addEventListener("load", imageLoaded); watchedImages.add(image);
      }
      const frame = owner?.querySelector(".portrait-instrument-stage");
      const frameWidth = frame?.clientWidth, frameHeight = frame?.clientHeight;
      if (!frameWidth || !frameHeight) return;
      const frameKey = `${Math.round(frameWidth)}/${Math.round(frameHeight)}`;
      const ready = image => image?.complete && image.naturalWidth > 0 && image.naturalHeight > 0;
      // Retain the full-photo palette when System temporarily removes its IMG.
      if (!ready(full) && palette?.kind === "portrait" && palette.frameKey === frameKey) return;
      const image = ready(full) ? full : ready(thumbnail) ? thumbnail : null;
      if (!image) return;
      const kind = image === full ? "portrait" : "portrait-thumbnail";
      const key = `${kind}/${image.currentSrc || image.src}/${image.naturalWidth}/${image.naturalHeight}/${frameKey}`;
      if (palette?.key === key || failedPaletteKey === key) return;
      const crop = portraitCoverCrop(image.naturalWidth, image.naturalHeight, frameWidth, frameHeight);
      if (!crop) return;
      try {
        if (!sampleCanvas) {
          sampleCanvas = document.createElement("canvas"); sampleCanvas.width = 64; sampleCanvas.height = 64;
          sampler = sampleCanvas.getContext("2d", { willReadFrequently: true });
        }
        if (!sampler) { failedPaletteKey = key; return; }
        // Read only the already-decoded source image. No texture, fetch, decode
        // request, assembly pixels, editorial overlay or per-frame readback.
        sampler.clearRect(0, 0, 64, 64);
        sampler.drawImage(image, ...crop, 0, 0, 64, 64);
        palette = { key, kind, frameKey, pixels: sampler.getImageData(0, 0, 64, 64).data };
        failedPaletteKey = "";
        applyPalette();
      } catch {
        failedPaletteKey = key;
        // Unavailable/tainted readback leaves the native photograph untouched.
        // Keep the previous real-photo palette, or the conservative fallback.
      }
    };
    const makeGeometry = () => {
      const phone = width < 700;
      if (geometry && narrow === phone) return;
      narrow = phone;
      geometry?.dispose();
      const count = phone ? 4_000 : 12_000;
      const seeds = createSignalSeeds(count);
      seedValues = seeds.seeds;
      geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(seeds.positions, 3));
      geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds.seeds, 4));
      applyPalette();
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
          blending: THREE.NormalBlending, toneMapped: false,
        });
        points = new THREE.Points(geometry, material); points.frustumCulled = false; scene.add(points);
        canvas.dataset.continuationRenderer = "webgl";
        canvas.dataset.continuationGeometry = "portrait-contact-current";
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
      // Only owner/chrome bounds need a hard safety cut. Content uses the
      // shader's soft guard, so moving paragraphs no longer slice a solid form.
      const viewport = { left: 0, top: 0, width, height };
      const clip = captureClipPath(viewport, shot.hardExclusions || [], width, height);
      if (clip !== signature) { canvas.style.clipPath = clip; signature = clip; }
    };
    const suspend = () => {
      cancelAnimationFrame(request); request = 0; lastTimestamp = 0; coordinate = null; sourcePresence = null;
      renderer?.clear();
    };
    const draw = timestamp => {
      request = 0;
      if (disposed || lost) return;
      const current = motion.current;
      // A flowing rAF can precede the director's scroll callback. Refresh its
      // native measurements first so masks never paint a frame behind scrolling.
      if (current.sceneDirty || current.scrollY !== window.scrollY || current.width !== window.innerWidth || current.height !== window.innerHeight) current.refreshScene?.();
      const shot = current.scene;
      if (!current.visible || document.hidden || !shot) { suspend(); return; }
      if (shot !== protectedScene) refreshPalette();
      if (!initialize()) return;
      makeGeometry();
      if (!shot.ports) { renderer.clear(); return; }
      const next = Math.max(0, Math.min(4, Number.isFinite(shot.coordinate) ? shot.coordinate : 0));
      const reduced = Boolean(current.reduced), paused = Boolean(current.paused);
      const delta = lastTimestamp ? Math.min(.05, Math.max(0, (timestamp - lastTimestamp) / 1_000)) : 0;
      lastTimestamp = timestamp;
      if (coordinate === null || reduced) coordinate = next;
      else coordinate = dampSignalCoordinate(coordinate, next, delta || 1 / 60);
      if (Math.abs(coordinate - next) <= .0001) coordinate = next;
      const sourceTarget = shot.ports.source.ready;
      if (sourcePresence === null || reduced) sourcePresence = sourceTarget;
      else sourcePresence = dampSignalCoordinate(sourcePresence, sourceTarget, delta || 1 / 60);
      const settling = !reduced && (coordinate !== next || sourcePresence !== sourceTarget);
      const flowing = !reduced && !paused;
      if (flowing) activeTime += delta;
      const aspect = width / height;
      if (coordinate !== cameraCoordinate || aspect !== cameraAspect || reduced !== cameraReduced) {
        pose = readSignalCamera(coordinate, aspect, reduced);
        camera.position.set(...pose.position); target.set(...pose.target); camera.up.set(0, 1, 0); camera.lookAt(target);
        if (camera.fov !== pose.fov || camera.aspect !== aspect) {
          camera.fov = pose.fov; camera.aspect = aspect; camera.updateProjectionMatrix();
        }
        camera.updateMatrixWorld();
        cameraCoordinate = coordinate; cameraAspect = aspect; cameraReduced = reduced;
      }
      uniforms.uCoordinate.value = coordinate; uniforms.uTime.value = activeTime;
      // Pause freezes particle transport, while native ports remain registered
      // and the camera can finish its existing settle. Reduced motion is a still.
      if (flowing) uniforms.uScroll.value = coordinate;
      else if (reduced) uniforms.uScroll.value = 0;
      uniforms.uAspect.value = aspect; uniforms.uPixelRatio.value = ratio; uniforms.uReduced.value = reduced ? 1 : 0;
      uniforms.uViewport.value.set(width, height);
      const { source, receiver, portrait, contact } = shot.ports;
      // Attachment pixels follow native scrolling immediately. Only the spatial
      // spine and camera are damped, so the stream cannot lag off its photo edge.
      uniforms.uSource.value.set(source.x, source.y, source.side, sourcePresence);
      if (shot !== protectedScene) {
        uniforms.uReceiver.value.set(receiver.x, receiver.y, 0, receiver.ready);
        uniforms.uPortrait.value.fromArray(portrait); uniforms.uContact.value.fromArray(contact);
        uniforms.uPeel.value.fromArray(shot.ports.peel || [source.y, source.y]);
        protectContent(shot);
        protectedScene = shot;
      }
      // Discharge fully before the footer; a finished current does not linger
      // as a second visual behind the final native actions.
      const completion = Math.max(0, Math.min(1, shot.exit || 0));
      if (opacity !== completion) { canvas.style.opacity = String(1 - completion); opacity = completion; }
      const state = completion === 1 ? "complete" : reduced ? "reduced" : settling ? "settling" : paused ? "paused" : "flowing";
      const stateKey = `${state}/${shot.act}/${source.ready}`;
      if (timestamp - diagnosticAt >= 150 || stateKey !== diagnosticState || (!flowing && !settling)) {
        const data = {
          continuationAct: shot.act || "method", continuationCoordinate: coordinate.toFixed(4), continuationTarget: next.toFixed(4),
          continuationCamera: pose.position.map(value => value.toFixed(3)).join(","), continuationCompletion: completion.toFixed(3),
          continuationTime: activeTime.toFixed(3), continuationSource: [source.x, source.y].map(value => value.toFixed(2)).join(","),
          continuationReceiver: [receiver.x, receiver.y].map(value => value.toFixed(2)).join(","), continuationSourceReady: String(source.ready),
          continuationSourceVisibility: sourcePresence.toFixed(3), continuationRectcount: String(uniforms.uRectCount.value), continuationMotion: state,
        };
        for (const [key, value] of Object.entries(data)) if (canvas.dataset[key] !== value) canvas.dataset[key] = value;
        diagnosticAt = timestamp; diagnosticState = stateKey;
      }
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
      signature = ""; protectedScene = null; cameraAspect = null; invalidate();
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
    // The director can already be visible before this lazy module mounts. Its
    // latest ports and masks are ready; resize invalidates that current scene.
    resize();
    return () => {
      disposed = true; cancelAnimationFrame(request); observer.disconnect();
      for (const image of watchedImages) image.removeEventListener("load", imageLoaded);
      watchedImages.clear(); palette = null; sampleCanvas = null; sampler = null;
      document.removeEventListener("visibilitychange", invalidate);
      canvas.removeEventListener("webglcontextlost", contextLost); canvas.removeEventListener("webglcontextrestored", contextRestored);
      if (motion.current.invalidate === invalidate) motion.current.invalidate = null;
      geometry?.dispose(); material?.dispose(); renderer?.dispose(); renderer?.forceContextLoss();
    };
  }, [motion]);
  return <canvas className="continuation-signal-canvas" ref={canvasRef} aria-hidden="true" />;
}
