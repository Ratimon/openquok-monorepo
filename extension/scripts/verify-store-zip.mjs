import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const extensionRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDirName = process.env.EXTENSION_OUT_DIR?.trim() || 'dist';
const isFirefox = outDirName === 'dist-firefox';
const zipPath = join(
	extensionRoot,
	isFirefox ? 'openquok-browser-extension-firefox.zip' : 'openquok-browser-extension.zip'
);

function fail(message) {
	console.error(`[verify-store-zip] ${message}`);
	process.exit(1);
}

if (!existsSync(zipPath)) {
	fail(`${zipPath} not found — run pnpm zip${isFirefox ? ':firefox' : ''} first.`);
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
		`manifest.json must be at the zip root (found "${nestedManifest}"). Rebuild with scripts/zip.mjs from ${outDirName}/.`
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
			`manifest description must be browser-neutral (remove "Chrome"): ${JSON.stringify(description)}`
		);
	}

	if (isFirefox) {
		const name = typeof manifest.name === 'string' ? manifest.name : '';
		if (name.length > 45) {
			fail(
				`Firefox AMO limits manifest name to 45 characters (got ${name.length}): ${JSON.stringify(name)}. Override in manifest.firefox.json.`
			);
		}
		const gecko = manifest.browser_specific_settings?.gecko;
		const dataPerms = gecko?.data_collection_permissions;
		if (!dataPerms || !Array.isArray(dataPerms.required) || dataPerms.required.length === 0) {
			fail(
				'Firefox manifest must set browser_specific_settings.gecko.data_collection_permissions.required (see manifest.firefox.json).'
			);
		}
		if (manifest.sidebar_action?.default_panel !== 'sidepanel.html') {
			fail('Firefox manifest must set sidebar_action.default_panel to "sidepanel.html".');
		}
		if (manifest.side_panel) {
			fail('Firefox manifest must not include side_panel.');
		}
		if (manifest.background?.service_worker) {
			fail('Firefox manifest must use background.scripts, not service_worker.');
		}
	} else if (!manifest.side_panel?.default_path) {
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

const distManifest = join(extensionRoot, outDirName, 'manifest.json');
if (existsSync(distManifest)) {
	const dist = JSON.parse(readFileSync(distManifest, 'utf8'));
	const zipped = JSON.parse(extract.stdout);
	if (dist.version !== zipped.version) {
		fail(
			`Zip manifest version ${zipped.version} does not match ${outDirName}/manifest.json ${dist.version} — rebuild and re-zip.`
		);
	}
}

const storeLabel = isFirefox ? 'Mozilla AMO' : 'Chrome Web Store and Microsoft Edge Add-ons';
console.log(`[verify-store-zip] OK (${entries.length} files; ready for ${storeLabel})`);