import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const webRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);

/**
 * pwag only emits PNGs up to 512×512. Store / OAuth verification often needs 1024×1024.
 * Reuse sharp from the pwag dependency tree (no extra web/package.json dep).
 */
const pwagPkgDir = dirname(require.resolve("pwag/package.json", { paths: [webRoot] }));
const sharp = require(require.resolve("sharp", { paths: [pwagPkgDir] }));

const input = join(webRoot, "static/icon.svg");
const output = join(webRoot, "static/pwa/icon-1024x1024.png");

await sharp(input).resize(1024, 1024).png({ compressionLevel: 9 }).toFile(output);
console.log(`Wrote ${output}`);
