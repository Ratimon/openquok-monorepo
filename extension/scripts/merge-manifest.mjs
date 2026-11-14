import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const extensionRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

function deepMerge(base, overlay) {
	const result = { ...base };
	for (const [key, value] of Object.entries(overlay)) {
		if (
			value &&
			typeof value === 'object' &&
			!Array.isArray(value) &&
			result[key] &&
			typeof result[key] === 'object' &&
			!Array.isArray(result[key])
		) {
			result[key] = deepMerge(result[key], value);
		} else {
			result[key] = value;
		}
	}
	return result;
}

/**
 * Firefox MV3 uses event-page background scripts, not extension service workers.
 * @param {Record<string, unknown>} manifest
 */
function adaptBackgroundForFirefox(manifest) {
	const bg = manifest.background;
	if (!bg || typeof bg !== 'object' || Array.isArray(bg)) {
		throw new Error('manifest.background is required for Firefox build');
	}

	const worker = typeof bg.service_worker === 'string' ? bg.service_worker.trim() : '';
	if (worker) {
		const next = { scripts: [worker] };
		if (bg.type === 'module') {
			next.type = 'module';
		}
		manifest.background = next;
		return;
	}

	if (!Array.isArray(bg.scripts) || bg.scripts.length === 0) {
		throw new Error('Firefox manifest must define background.scripts (or base manifest.service_worker)');
	}
	delete bg.service_worker;
}

/**
 * @param {string} buildTarget `chromium` | `firefox`
 * @returns {Record<string, unknown>}
 */
export function loadMergedManifest(buildTarget = 'chromium') {
	const basePath = join(extensionRoot, 'manifest.json');
	const base = JSON.parse(readFileSync(basePath, 'utf8'));

	if (buildTarget !== 'firefox') {
		return base;
	}

	const overlayPath = join(extensionRoot, 'manifest.firefox.json');
	if (!existsSync(overlayPath)) {
		throw new Error('manifest.firefox.json is required for BUILD_TARGET=firefox');
	}
	const overlay = JSON.parse(readFileSync(overlayPath, 'utf8'));
	const merged = deepMerge(base, overlay);

	delete merged.externally_connectable;
	delete merged.side_panel;

	if (Array.isArray(merged.permissions)) {
		merged.permissions = merged.permissions.filter((permission) => permission !== 'sidePanel');
	}

	adaptBackgroundForFirefox(merged);

	return merged;
}
