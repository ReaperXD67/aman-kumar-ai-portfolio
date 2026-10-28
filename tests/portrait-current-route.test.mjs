import test from "node:test";
import assert from "node:assert/strict";
import { readPortraitCurrentPorts, currentFooterExit } from "../src/portrait-current-route.js";

test("portrait source and contact receiver register to native edges at phone and desktop widths", () => {
  for (const width of [320, 390, 844, 1440]) {
    const viewport = { width, height: 844 };
    const portrait = { left: 18, top: 100, width: Math.min(490, width - 36), height: 560 };
    const image = { ...portrait, top: 148, height: 450 };
    const contact = { left: 18, top: 650, width: width - 36, height: 650 };
    const ports = readPortraitCurrentPorts(portrait, image, contact, viewport);
    assert.equal(ports.source.x, portrait.left + portrait.width + .5);
    assert.equal(ports.source.y, image.top + image.height * .69);
    assert.equal(ports.receiver.x, contact.left + Math.min(48, contact.width * .12));
    assert.equal(ports.receiver.y, contact.top - .5);
    assert.deepEqual(ports.portrait, [18, 100, portrait.left + portrait.width, 660]);
    assert.equal(ports.source.ready, 1);
    assert.equal(readPortraitCurrentPorts(portrait, image, contact, viewport, false).source.ready, 0);
  }
});

test("native scroll and sticky release move endpoints immediately without changing their registration", () => {
  const viewport = { width: 390, height: 844 };
  const base = { left: 18, top: 400, width: 344, height: 560 };
  const contact = { left: 18, top: 900, width: 344, height: 650 };
  const before = readPortraitCurrentPorts(base, base, contact, viewport);
  for (const delta of [1, 79, 400]) {
    const moved = box => ({ ...box, top: box.top - delta });
    const after = readPortraitCurrentPorts(moved(base), moved(base), moved(contact), viewport);
    assert.equal(before.sourceActual.y - after.sourceActual.y, delta);
    assert.equal(before.receiverActual.y - after.receiverActual.y, delta);
    assert.equal(after.source.y, after.sourceActual.y);
    assert.equal(after.receiver.y, after.receiverActual.y);
  }
});

test("offscreen endpoints are bounded while invalid geometry disables attachment", () => {
  const box = { left: 18, top: -20000, width: 284, height: 560 };
  const viewport = { width: 320, height: 568 };
  const ports = readPortraitCurrentPorts(box, box, { ...box, top: 20000 }, viewport);
  assert.equal(ports.source.y, -568 * .75);
  assert.equal(ports.receiver.y, 568 * 1.75);
  assert.equal(readPortraitCurrentPorts(null, box, box, viewport), null);
  assert.equal(readPortraitCurrentPorts(box, { ...box, width: 0 }, box, viewport), null);
  assert.equal(readPortraitCurrentPorts(box, box, box, { width: NaN, height: 568 }), null);
});

test("contact stays connected until the actual footer enters, then discharges at document end", () => {
  assert.equal(currentFooterExit(900, 1600, 1840), 0);
  assert.equal(currentFooterExit(1600, 1600, 1840), 0);
  assert(currentFooterExit(1720, 1600, 1840) > 0);
  assert(currentFooterExit(1720, 1600, 1840) < 1);
  assert.equal(currentFooterExit(1840, 1600, 1840), 1);
  assert.equal(currentFooterExit(2000, 1600, 1840), 1);
});
