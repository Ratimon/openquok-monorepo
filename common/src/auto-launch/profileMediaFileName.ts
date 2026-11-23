import { sanitizeMediaDisplayName } from '../media/virtualPaths.js';

/**
 * True when the object basename came from legacy `Math.random()` uploads
 * (e.g. `0.6739143119534297.png`) — not suitable for compare-rail display.
 */
export function isLegacyRandomAutoLaunchMediaBasename(basename: string): boolean {
	const name = basename.trim().split('?')[0] ?? '';
	if (!name) return true;
	return /^0\.\d+\.[a-z0-9]+$/i.test(name);
}

/** Sanitize an upload's `originalname` for `auto_launch_profile_media` object keys. */
export function sanitizeAutoLaunchProfileMediaFileName(originalname: string): string {
	const trimmed = String(originalname ?? '').trim();
	if (!trimmed) {
		return 'file.bin';
	}

	const lastDot = trimmed.lastIndexOf('.');
	const hasExt = lastDot > 0 && lastDot < trimmed.length - 1;
	const basePart = hasExt ? trimmed.slice(0, lastDot) : trimmed;
	const rawExt = hasExt ? trimmed.slice(lastDot + 1) : '';
	const ext = (rawExt.replace(/[^a-zA-Z0-9]/g, '').slice(0, 16) || (hasExt ? 'bin' : '')).toLowerCase();

	const safeBase = sanitizeMediaDisplayName(basePart);
	if (ext) {
		return `${safeBase}.${ext}`;
	}
	return safeBase.length > 0 ? safeBase : 'file';
}

/**
 * Pick a filename unique within a storage prefix. On collision, inserts `-2`, `-3`, … before the extension.
 */
export function resolveUniqueAutoLaunchProfileMediaFileName(
	sanitizedFileName: string,
	existingNames: Iterable<string>
): string {
	const taken = new Set(existingNames);
	if (!taken.has(sanitizedFileName)) {
		return sanitizedFileName;
	}

	const lastDot = sanitizedFileName.lastIndexOf('.');
	const hasExt = lastDot > 0;
	const base = hasExt ? sanitizedFileName.slice(0, lastDot) : sanitizedFileName;
	const extWithDot = hasExt ? sanitizedFileName.slice(lastDot) : '';

	for (let suffix = 2; suffix < 10_000; suffix += 1) {
		const candidate = `${base}-${suffix}${extWithDot}`;
		if (!taken.has(candidate)) {
			return candidate;
		}
	}

	return `${base}-${Date.now()}${extWithDot}`;
}