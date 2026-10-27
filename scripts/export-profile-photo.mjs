import { createRequire } from 'node:module';
import { existsSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';

// Mechanical delivery exports. Retouch is authored with Imagegen; this step
// preserves the appearance and sizes it for each consuming surface.
const require = createRequire(import.meta.url);
let sharp;
try { sharp = require('sharp'); }
catch {
  const bundled = path.join(os.homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
  if (!existsSync(bundled)) throw new Error('Install sharp locally, or run with the bundled workspace dependencies.');
  sharp = require(bundled);
}
const base = path.resolve(import.meta.dirname, '../public/profile');
const source = path.resolve(process.argv[2] || path.join(base, 'aman-portrait-20261027.png'));
const version = process.argv[3] || '20261027';
if (!/^\d{8}$/.test(version)) throw new Error('Portrait version must use YYYYMMDD.');
const variants = [
  ['aman-portrait.webp', 1000, 'webp', 89],
  ['aman-portrait-small.webp', 160, 'webp', 86],
  [`aman-avatar-${version}.jpg`, 800, 'jpeg', 94],
  ['linkedin/linkedin-aman-editorial-portrait-v3.jpg', 800, 'jpeg', 94],
];
for (const [filename, size, format, quality] of variants) {
  const info = await sharp(source).rotate().resize(size, size, { fit: 'cover' })[format]({ quality }).toFile(path.join(base, filename));
  console.log(`${filename}: ${info.width}x${info.height}, ${info.size} bytes`);
}
