import { smoothRange } from "./cinematic-motion.js";

const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const valid = box => box && [box.left, box.top, box.width, box.height].every(Number.isFinite)
  && box.width > 0 && box.height > 0;
const rectangle = box => [box.left, box.top, box.left + box.width, box.top + box.height];

/** Endpoints register to native edges, independently of decorative camera lag.
 * Only already-offscreen endpoints are bounded to keep the long route precise. */
export function readPortraitCurrentPorts(portrait, image, contact, viewport, ready = true) {
  if (![portrait, image, contact].every(valid) || !valid({ left: 0, top: 0, ...viewport })) return null;
  const source = { x: portrait.left + portrait.width + .5, y: image.top + image.height * .69 };
  const receiver = { x: contact.left + Math.min(48, contact.width * .12), y: contact.top - .5 };
  const bound = port => ({ x: clamp(port.x, -viewport.width * .5, viewport.width * 1.5),
    y: clamp(port.y, -viewport.height * .75, viewport.height * 1.75) });
  const boundedSource = bound(source);
  // Keep the measured image span registered to the source, even when its
  // already-offscreen center is bounded for the long contact approach.
  const imageTop = image.top + boundedSource.y - source.y;
  return { source: { ...boundedSource, side: 1, ready: ready ? 1 : 0 },
    receiver: { ...bound(receiver), ready: 1 }, portrait: rectangle(portrait), contact: rectangle(contact),
    peel: [imageTop, imageTop + image.height],
    sourceActual: source, receiverActual: receiver };
}

/** Contact remains connected at route coordinate four. Only footer entry fades. */
export function currentFooterExit(viewportBottom, ownerBottom, documentBottom) {
  if (![viewportBottom, ownerBottom, documentBottom].every(Number.isFinite)) return 0;
  return smoothRange(viewportBottom, ownerBottom, Math.max(ownerBottom + 1, documentBottom));
}
