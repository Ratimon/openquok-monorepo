import { copyFileSync, cpSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const extensionRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const distDir = join(extensionRoot, 'dist');

mkdirSync(distDir, { recursive: true });

copyFileSync(join(extensionRoot, 'manifest.json'), join(distDir, 'manifest.json'));

const iconsSrc = join(extensionRoot, 'icons');
const iconsDest = join(distDir, 'icons');
if (existsSync(iconsSrc)) {
	cpSync(iconsSrc, iconsDest, { recursive: true });
}
