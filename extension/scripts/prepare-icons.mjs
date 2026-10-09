import { existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const extensionRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const iconsDir = join(extensionRoot, 'icons');
const sizes = [16, 48, 128];

const allExist = sizes.every((size) => existsSync(join(iconsDir, `icon-${size}.png`)));
if (allExist) {
	process.exit(0);
}

const sourceSvg = join(extensionRoot, '..', 'web', 'static', 'icon.svg');
if (!existsSync(sourceSvg)) {
	console.error(
		'[extension] Missing icons and web/static/icon.svg. Add PNGs under extension/icons/ or run from the monorepo root.'
	);
	process.exit(1);
}

mkdirSync(iconsDir, { recursive: true });

const sharp = (await import('sharp')).default;
for (const size of sizes) {
	const out = join(iconsDir, `icon-${size}.png`);
	await sharp(sourceSvg).resize(size, size).png().toFile(out);
}

console.log('[extension] Generated icon PNGs from web/static/icon.svg');
