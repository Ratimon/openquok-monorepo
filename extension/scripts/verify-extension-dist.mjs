import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const extensionRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const distDir = join(extensionRoot, 'dist');
const contentDir = join(distDir, 'content/directory-launch');
const manifestPath = join(distDir, 'manifest.json');

const allowedContentScripts = new Set([
	'openquok-directory-peerpush.js',
	'openquok-directory-uneed.js',
]);

function fail(message) {
	console.error(`[verify-extension-dist] ${message}`);
	process.exit(1);
}

if (!existsSync(manifestPath)) {
	fail('Missing dist/manifest.json — run pnpm --filter @openquok/browser-extension build');
}

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const version = manifest.version ?? '?';
const scriptPaths = (manifest.content_scripts ?? []).flatMap((entry) => entry.js ?? []);

for (const scriptPath of scriptPaths) {
	const base = scriptPath.split('/').pop() ?? '';
	if (!allowedContentScripts.has(base)) {
		fail(
			`manifest.json references unexpected content script "${scriptPath}". Expected only ${[...allowedContentScripts].join(', ')}.`
		);
	}
	const absolute = join(distDir, scriptPath);
	if (!existsSync(absolute)) {
		fail(`manifest lists "${scriptPath}" but file is missing under dist/`);
	}
}

if (!existsSync(contentDir)) {
	fail('Missing dist/content/directory-launch/');
}

for (const name of readdirSync(contentDir)) {
	if (name.endsWith('.js') && !allowedContentScripts.has(name)) {
		fail(
			`Stale content script "${name}" in dist/. Remove extension/dist and rebuild (v${version}).`
		);
	}
}

const staleNames = [
	'peerpush-standard-launch.js',
	'peerpush-free-queue.js',
	'uneed-join-line.js',
	'uneed-paid-launch.js',
	'uneed-maker-profile.js',
	'directory-site-gate.js',
	'peerpush-host.js',
	'uneed-host.js',
];

if (manifest.action?.default_popup) {
	fail(
		`manifest.action must not set default_popup — toolbar opens the side panel (got ${JSON.stringify(manifest.action.default_popup)})`
	);
}

const sidePanelPath = manifest.side_panel?.default_path;
if (sidePanelPath !== 'sidepanel.html') {
	fail(`manifest.side_panel.default_path must be "sidepanel.html" (got ${JSON.stringify(sidePanelPath)})`);
}
for (const required of [
	'sidepanel.html',
	'sidepanel-bootstrap.js',
	'sidepanel.js',
	'sidepanel.css',
]) {
	if (!existsSync(join(distDir, required))) {
		fail(`Missing dist/${required} — rebuild the extension`);
	}
}
for (const removed of ['popup.html', 'popup.js', 'popup.css']) {
	if (existsSync(join(distDir, removed))) {
		fail(`Obsolete ${removed} in dist/. Remove extension/dist and rebuild (v${version}).`);
	}
}
for (const stale of staleNames) {
	if (existsSync(join(contentDir, stale))) {
		fail(`Obsolete bundle still present: ${stale}. Rebuild with extension v${version}.`);
	}
}

console.log(`[verify-extension-dist] OK (extension v${version}, ${scriptPaths.length} content script(s))`);
