import { copyFileSync, cpSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const extensionRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const distDir = join(extensionRoot, 'dist');

mkdirSync(distDir, { recursive: true });

copyFileSync(join(extensionRoot, 'manifest.json'), join(distDir, 'manifest.json'));
copyFileSync(join(extensionRoot, 'sidepanel.html'), join(distDir, 'sidepanel.html'));
copyFileSync(join(extensionRoot, 'sidepanel-bootstrap.js'), join(distDir, 'sidepanel-bootstrap.js'));

const iconsSrc = join(extensionRoot, 'icons');
const iconsDest = join(distDir, 'icons');
if (existsSync(iconsSrc)) {
	cpSync(iconsSrc, iconsDest, { recursive: true });
}
