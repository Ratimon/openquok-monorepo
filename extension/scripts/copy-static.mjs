import { copyFileSync, cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadMergedManifest } from './merge-manifest.mjs';

const extensionRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const buildTarget = process.env.BUILD_TARGET === 'firefox' ? 'firefox' : 'chromium';
const outDirName = process.env.EXTENSION_OUT_DIR?.trim() || 'dist';
const distDir = join(extensionRoot, outDirName);

mkdirSync(distDir, { recursive: true });

const manifest = loadMergedManifest(buildTarget);
writeFileSync(join(distDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
copyFileSync(join(extensionRoot, 'sidepanel.html'), join(distDir, 'sidepanel.html'));
copyFileSync(join(extensionRoot, 'sidepanel-bootstrap.js'), join(distDir, 'sidepanel-bootstrap.js'));

const iconsSrc = join(extensionRoot, 'icons');
const iconsDest = join(distDir, 'icons');
if (existsSync(iconsSrc)) {
	cpSync(iconsSrc, iconsDest, { recursive: true });
}

const linkDirectorySrc = join(extensionRoot, '../web/static/icons/link-directory');
const linkDirectoryDest = join(distDir, 'icons/link-directory');
if (existsSync(linkDirectorySrc)) {
	mkdirSync(linkDirectoryDest, { recursive: true });
	for (const slug of ['peerpush', 'uneed', 'open-launch']) {
		const file = join(linkDirectorySrc, `${slug}.svg`);
		if (existsSync(file)) {
			copyFileSync(file, join(linkDirectoryDest, `${slug}.svg`));
		}
	}
}
