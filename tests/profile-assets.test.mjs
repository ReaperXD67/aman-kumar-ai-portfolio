import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";

const publicFile = (path) => new URL(`../public${path}`, import.meta.url);
const socialPath = "/assets/portfolio-social-preview-v2.png";
const socialUrl = `https://aman-kumar-ai-portfolio.vercel.app${socialPath}`;
const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

function pngDimensions(bytes) {
  assert.ok(bytes.length > 24, "PNG must contain its header and dimensions");
  assert.deepEqual(bytes.subarray(0, 8), pngSignature, "Expected PNG signature");
  assert.equal(bytes.toString("ascii", 12, 16), "IHDR", "Expected PNG IHDR chunk");
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

function metaValue(html, name) {
  const matches = [...html.matchAll(/<meta\b[^>]*>/gi)]
    .map(([tag]) => Object.fromEntries(
      [...tag.matchAll(/([\w:-]+)\s*=\s*["']([^"']*)["']/g)]
        .map(([, key, value]) => [key.toLowerCase(), value]),
    ))
    .filter((attributes) => attributes.property === name || attributes.name === name);
  assert.equal(matches.length, 1, `Expected exactly one ${name} meta tag`);
  return matches[0].content;
}

test("canonical resume manifest matches the actual PDF bytes", async () => {
  const manifest = JSON.parse(await readFile(publicFile("/profile/resume.json"), "utf8"));
  assert.equal(manifest.url, "/profile/aman-kumar-resume.pdf");
  assert.equal(manifest.preview, "/profile/aman-kumar-resume-preview.png");
  assert.match(manifest.version, /^\d{4}\.\d{2}\.\d{1,2}$/);
  assert.match(manifest.updated, /^\d{2} [A-Z]{3} \d{4}$/);
  assert.match(manifest.sha256, /^[a-f0-9]{64}$/);

  const pdf = await readFile(publicFile(manifest.url));
  assert.equal(pdf.toString("ascii", 0, 5), "%PDF-");
  assert.ok(pdf.byteLength > 10_000, "PDF must contain more than an empty document");
  assert.ok(pdf.byteLength < 1_000_000, "Keep the single-page resume below 1 MB");
  assert.equal(createHash("sha256").update(pdf).digest("hex"), manifest.sha256);
  // The runtime manifest has no byte-size field: validate the actual bytes,
  // rather than adding a second mutable number that could become stale.
});

test("canonical resume preview is a nonempty portrait PNG", async () => {
  const preview = await readFile(publicFile("/profile/aman-kumar-resume-preview.png"));
  const { width, height } = pngDimensions(preview);
  assert.ok(width >= 1000 && height > width, "Expected a legible full-page portrait preview");
});

test("professional social preview v2 is exactly 1200 by 630", async () => {
  const preview = await readFile(publicFile(socialPath));
  assert.deepEqual(pngDimensions(preview), { width: 1200, height: 630 });
  assert.ok(preview.byteLength > 1000, "Social preview must not be an empty placeholder");
});

test("Open Graph and Twitter reference the same versioned social artwork", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  assert.equal(metaValue(html, "og:image"), socialUrl);
  assert.equal(metaValue(html, "og:image:secure_url"), socialUrl);
  assert.equal(metaValue(html, "twitter:image"), socialUrl);
  assert.equal(metaValue(html, "og:image:width"), "1200");
  assert.equal(metaValue(html, "og:image:height"), "630");
  assert.equal(metaValue(html, "og:image:type"), "image/png");
  assert.equal(metaValue(html, "twitter:card"), "summary_large_image");
  assert.ok(metaValue(html, "og:image:alt").includes("Aman Kumar"));
  assert.ok(metaValue(html, "twitter:image:alt").includes("Aman Kumar"));
});

test("approved portrait and optimized delivery assets are present", async () => {
  const originals = await readFile(publicFile("/profile/aman-portrait-20260924.png"));
  const dimensions = pngDimensions(originals);
  assert.ok(dimensions.width >= 800 && dimensions.height >= 800);

  const jpeg = await readFile(publicFile("/profile/aman-avatar-20260924.jpg"));
  assert.ok(jpeg.byteLength > 1000);
  assert.deepEqual(jpeg.subarray(0, 3), Buffer.from([255, 216, 255]));

  for (const path of ["/profile/aman-portrait.webp", "/profile/aman-portrait-small.webp"]) {
    const webp = await readFile(publicFile(path));
    assert.ok(webp.byteLength > 1000, `${path} must not be a placeholder`);
    assert.equal(webp.toString("ascii", 0, 4), "RIFF");
    assert.equal(webp.toString("ascii", 8, 12), "WEBP");
  }
});
