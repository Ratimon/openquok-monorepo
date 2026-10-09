import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const extensionRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const distDir = join(extensionRoot, 'dist');
const zipPath = join(extensionRoot, 'openquok-browser-extension.zip');

if (!existsSync(distDir)) {
	console.error('[extension] dist/ not found — run pnpm build first.');
	process.exit(1);
}

const result = spawnSync('zip', ['-r', zipPath, '.'], { cwd: distDir, stdio: 'inherit' });
if (result.status !== 0) {
	process.exit(result.status === null ? 1 : result.status);
}

console.log(`[extension] Wrote ${zipPath}`);
