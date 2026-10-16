/**
 * Runs extension Vitest via Node on `web/node_modules/vitest/vitest.mjs` (same pattern as agent/).
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const extensionDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.dirname(extensionDir);
const config = path.join(extensionDir, 'vitest.config.mjs');
const vitestEntry = path.join(rootDir, 'web', 'node_modules', 'vitest', 'vitest.mjs');

const passthrough = process.argv.slice(2);
let vitestArgs = passthrough.length ? passthrough : ['run'];
if (vitestArgs[0] !== 'run' && vitestArgs[0] !== '--watch') {
	vitestArgs = ['run', ...vitestArgs];
}

if (!fs.existsSync(vitestEntry)) {
	console.error(
		`Missing Vitest at ${vitestEntry}. From the repo root run: pnpm install\n` +
			'(Vitest is a devDependency of web/; extension tests reuse that binary.)'
	);
	process.exit(1);
}

const r = spawnSync(
	process.execPath,
	[vitestEntry, ...vitestArgs, '--config', config],
	{ cwd: rootDir, stdio: 'inherit', shell: false, env: process.env }
);

process.exit(r.status === null ? 1 : r.status);
