/**
 * Returns whether the browser exposes the Rewriter API on the global object.
 * Safe during SSR (always false when `globalThis` has no Rewriter).
 */
export function isRewriterSupported(): boolean {
	return typeof globalThis !== 'undefined' && 'Rewriter' in globalThis;
}
