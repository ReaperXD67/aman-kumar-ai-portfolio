import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { captureClipPath, smoothRange } from "./cinematic-motion.js";
import { createEndingFilmGrid, readEndingCamera, updateEndingFilmGrid } from "./ending-film-geometry.js";

/** One open surface and a real perspective camera. Native content only occludes
 * the film: its rectangles never become vertices, silhouettes or camera poses. */
export function ContinuationSignal({ motion }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !motion?.current) return undefined;
    let request = 0, disposed = false, unavailable = false, lost = false, environmentDirty = false;
    let width = 1, height = 1, ratio = 1, renderer, scene, camera, mesh, geometry, material, grid, environment;
    let narrow, signature = "";
    const silver = new THREE.Color("#aebfc8"), paper = new THREE.Color("#efefe9");
    const target = new THREE.Vector3();

    const makeGeometry = () => {
      const phone = width < 700;
      if (geometry && narrow === phone) return;
      narrow = phone;
      geometry?.dispose();
      grid = createEndingFilmGrid(phone ? 64 : 96, phone ? 14 : 20);
      geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(grid.positions, 3).setUsage(THREE.DynamicDrawUsage));
      geometry.setAttribute("normal", new THREE.BufferAttribute(grid.normals, 3).setUsage(THREE.DynamicDrawUsage));
      geometry.setAttribute("uv", new THREE.BufferAttribute(grid.uv, 2));
      geometry.setIndex(new THREE.BufferAttribute(grid.indices, 1));
      if (mesh) mesh.geometry = geometry;
    };
    const refreshEnvironment = () => {
      const room = new RoomEnvironment(), generator = new THREE.PMREMGenerator(renderer);
      const next = generator.fromScene(room, .035);
      room.dispose(); generator.dispose(); environment?.dispose();
      environment = next; scene.environment = environment.texture;
    };
    const initialize = () => {
      if (renderer || unavailable || disposed) return Boolean(renderer);
      try {
        renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "default" });
        renderer.setClearColor(0x000000, 0);
        renderer.setPixelRatio(ratio); renderer.setSize(width, height, false);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.12;
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(38, width / height, .1, 70);
        refreshEnvironment();
        scene.add(new THREE.HemisphereLight("#c4dcea", "#17100c", 1.1));
        for (const [color, intensity, position] of [
          ["#e8f4ff", 4.2, [-3, 5, 7]], ["#ff704b", 3.3, [4, -2, -4]], ["#6e9fbb", 2.2, [-5, 1, -2]],
        ]) { const light = new THREE.DirectionalLight(color, intensity); light.position.set(...position); scene.add(light); }
        makeGeometry();
        material = new THREE.MeshStandardMaterial({ color: silver, roughness: .24, metalness: .88,
          side: THREE.DoubleSide, envMapIntensity: 1.7 });
        mesh = new THREE.Mesh(geometry, material); mesh.frustumCulled = false; scene.add(mesh);
        canvas.dataset.continuationRenderer = "webgl";
        return true;
      } catch {
        unavailable = true; canvas.dataset.continuationRenderer = "unavailable";
        geometry?.dispose(); material?.dispose(); environment?.dispose(); renderer?.dispose(); renderer = null;
        return false;
      }
    };
    const draw = () => {
      request = 0;
      if (disposed || lost) return;
      const current = motion.current, shot = current.scene;
      if (!current.visible || document.hidden || !shot) { renderer?.clear(); return; }
      if (!initialize()) return;
      // Three restores its own resource tables later in the context event.
      // Rebuild generated reflections on the next frame, after that handler.
      if (environmentDirty) {
        environmentDirty = false;
        try { refreshEnvironment(); } catch { scene.environment = null; }
      }
      makeGeometry();
      const coordinate = Math.max(0, Math.min(4, Number.isFinite(shot.coordinate) ? shot.coordinate : 0));
      const reduced = Boolean(current.reduced);
      updateEndingFilmGrid(grid, coordinate, reduced);
      geometry.attributes.position.needsUpdate = true; geometry.attributes.normal.needsUpdate = true;
      const pose = readEndingCamera(coordinate, width / height, reduced);
      camera.position.set(...pose.position); target.set(...pose.target); camera.up.set(...pose.up); camera.lookAt(target);
      camera.fov = pose.fov; camera.aspect = width / height;
      // The soft negative-space centroid reframes the same camera, without
      // fitting the object to an artifact or changing its topology.
      const focus = reduced ? { x: .5, y: .5 } : shot.focus || { x: .5, y: .5 };
      const x = .5 + (Math.max(.2, Math.min(.8, focus.x)) - .5) * .85;
      const y = .5 + (Math.max(.2, Math.min(.8, focus.y)) - .5) * .85;
      camera.setViewOffset(width, height, (.5 - x) * width, (.5 - y) * height, width, height);
      camera.updateProjectionMatrix(); camera.updateMatrixWorld();
      mesh.scale.setScalar(narrow ? .82 : 1);
      const landing = reduced ? 1 : smoothRange(coordinate, 3.15, 4);
      // The film finishes behind the native paper terminal. It must not emerge
      // again as a second blank sheet when the visitor continues to the footer.
      const completion = smoothRange(coordinate, 3.93, 4);
      canvas.style.opacity = String(1 - completion);
      material.color.copy(silver).lerp(paper, landing);
      material.metalness = .88 * (1 - landing); material.roughness = .24 + landing * .56;
      material.envMapIntensity = 1.7 - landing * .9;
      const viewport = { left: 0, top: 0, width, height };
      const clip = captureClipPath(viewport, shot.exclusions || [], width, height);
      if (clip !== signature) { canvas.style.clipPath = clip; signature = clip; }
      canvas.dataset.continuationGeometry = reduced ? "settled-open-sheet" : "single-morphing-film";
      canvas.dataset.continuationAct = shot.act || "method";
      canvas.dataset.continuationCoordinate = coordinate.toFixed(4);
      canvas.dataset.continuationCamera = pose.position.map(value => value.toFixed(3)).join(",");
      canvas.dataset.continuationMaterial = landing.toFixed(3);
      canvas.dataset.continuationCompletion = completion.toFixed(3);
      renderer.render(scene, camera);
      // Scroll, resize or state owns every frame; there is no self-invalidation.
    };
    const invalidate = () => {
      if (disposed || unavailable || lost) return;
      if (!motion.current.visible || document.hidden) { cancelAnimationFrame(request); request = 0; renderer?.clear(); return; }
      if (!request) request = requestAnimationFrame(draw);
    };
    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      width = Math.max(1, bounds.width); height = Math.max(1, bounds.height);
      ratio = Math.min(window.devicePixelRatio || 1, 1.35, Math.sqrt(1_500_000 / (width * height)));
      if (renderer) { renderer.setPixelRatio(ratio); renderer.setSize(width, height, false); }
      signature = ""; invalidate();
    };
    const contextLost = event => { event.preventDefault(); lost = true; cancelAnimationFrame(request); request = 0; canvas.dataset.continuationRenderer = "suspended"; };
    const contextRestored = () => {
      lost = false;
      environmentDirty = true;
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
      geometry?.dispose(); material?.dispose(); environment?.dispose();
      renderer?.dispose(); renderer?.forceContextLoss();
    };
  }, [motion]);
  return <canvas className="continuation-signal-canvas" ref={canvasRef} aria-hidden="true" />;
}
