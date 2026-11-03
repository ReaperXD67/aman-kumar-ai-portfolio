import { smoothRange } from "./cinematic-motion.js";

const validFrame = frame => frame && [frame.left, frame.top, frame.width, frame.height].every(Number.isFinite)
  && frame.width > 0 && frame.height > 0;

/** One reversible native-scroll camera pose. Photo stays axis-aligned so its
 * image edge, cover crop and GPU attachment have an exact common projection. */
export function portraitDepthPose(anchor, viewport, reduced = false) {
  if (!validFrame(anchor) || !viewport || ![viewport.width, viewport.height].every(Number.isFinite)
    || viewport.width <= 0 || viewport.height <= 0) return null;
  const phone = viewport.width <= 600;
  const progress = reduced ? .5 : smoothRange(viewport.height - anchor.top, 0, viewport.height + anchor.height);
  const sweep = progress * 2 - 1;
  const scale = reduced ? 1 : 1 - (phone ? .065 : .12) * sweep * sweep;
  const x = reduced ? 0 : sweep * (phone ? 5 : 16);
  const y = reduced ? 0 : -sweep * (phone ? 18 : 40);
  // The foreground's top follows the lower shoulder, never the facial region.
  // Independent lateral travel and perspective create depth without crossing it.
  const frontY = y + anchor.height * (1 - scale) / 2 + anchor.height * scale * .84;
  return { progress, scale, x, y, frontY,
    frontX: reduced ? 0 : -sweep * (phone ? 9 : 32),
    frontAngle: reduced || phone ? 0 : -sweep * 7,
    rearY: reduced ? 0 : sweep * (phone ? 24 : 74),
    rearX: reduced ? 0 : -sweep * (phone ? 8 : 30),
  };
}

export function projectPortraitPlane(anchor, pose) {
  if (!validFrame(anchor)) return null;
  if (!pose || ![pose.x, pose.y, pose.scale].every(Number.isFinite) || pose.scale <= 0) return anchor;
  return { left: anchor.left + pose.x + anchor.width * (1 - pose.scale) / 2,
    top: anchor.top + pose.y + anchor.height * (1 - pose.scale) / 2,
    width: anchor.width * pose.scale, height: anchor.height * pose.scale };
}
