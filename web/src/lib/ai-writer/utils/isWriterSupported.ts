/**
 * Returns whether the browser exposes the Writer API on the global object.
 * Safe during SSR (always false when `globalThis` has no Writer).
 */
export function isWriterSupported(): boolean {
	return typeof globalThis !== 'undefined' && 'Writer' in globalThis;
}
