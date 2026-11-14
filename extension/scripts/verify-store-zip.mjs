import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const extensionRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const zipPath = join(extensionRoot, 'openquok-browser-extension.zip');

function fail(message) {
	console.error(`[verify-store-zip] ${message}`);
	process.exit(1);
}

if (!existsSync(zipPath)) {
	fail('openquok-browser-extension.zip not found — run pnpm zip first.');
}

const list = spawnSync('unzip', ['-Z1', zipPath], { encoding: 'utf8' });
if (list.status !== 0) {
	fail(`Could not list zip (${list.stderr?.trim() || 'unzip failed'})`);
}

const entries = list.stdout
	.split('\n')
	.map((line) => line.trim())
	.filter(Boolean);

if (entries.length === 0) {
	fail('Zip archive is empty.');
}

const nestedManifest = entries.find(
	(name) => name.endsWith('/manifest.json') && name !== 'manifest.json'
);
if (nestedManifest) {
	fail(
		`manifest.json must be at the zip root (found "${nestedManifest}"). Rebuild with scripts/zip.mjs from dist/.`
	);
}

if (!entries.includes('manifest.json')) {
	fail('Zip is missing manifest.json at archive root.');
}

const requiredRoots = [
	'manifest.json',
	'background.js',
	'sidepanel.html',
	'sidepanel.js',
	'icons/icon-128.png',
];
for (const path of requiredRoots) {
	if (!entries.includes(path)) {
		fail(`Zip missing required file: ${path}`);
	}
}

const tmpManifest = join(tmpdir(), `openquok-manifest-${process.pid}.json`);
const extract = spawnSync('unzip', ['-p', zipPath, 'manifest.json'], { encoding: 'utf8' });
if (extract.status !== 0 || !extract.stdout?.trim()) {
	fail('Could not read manifest.json from zip.');
}

try {
	writeFileSync(tmpManifest, extract.stdout, 'utf8');
	const manifest = JSON.parse(extract.stdout);

	if (manifest.manifest_version !== 3) {
		fail(`Expected manifest_version 3 (got ${manifest.manifest_version}).`);
	}

	const description = manifest.description ?? '';
	if (/\bchrome\b/i.test(description)) {
		fail(
			`manifest description must be browser-neutral for Edge Add-ons (remove "Chrome"): ${JSON.stringify(description)}`
		);
	}

	if (!manifest.side_panel?.default_path) {
		fail('manifest.side_panel.default_path is required for Chromium side panel builds.');
	}
} catch (err) {
	fail(`Invalid manifest.json in zip: ${err instanceof Error ? err.message : String(err)}`);
} finally {
	if (existsSync(tmpManifest)) {
		try {
			unlinkSync(tmpManifest);
		} catch {
			// ignore
		}
	}
}

const distManifest = join(extensionRoot, 'dist', 'manifest.json');
if (existsSync(distManifest)) {
	const dist = JSON.parse(readFileSync(distManifest, 'utf8'));
	const zipped = JSON.parse(extract.stdout);
	if (dist.version !== zipped.version) {
		fail(
			`Zip manifest version ${zipped.version} does not match dist/manifest.json ${dist.version} — rebuild and re-zip.`
		);
	}
}

console.log(
	`[verify-store-zip] OK (${entries.length} files; ready for Chrome Web Store and Microsoft Edge Add-ons)`
);
