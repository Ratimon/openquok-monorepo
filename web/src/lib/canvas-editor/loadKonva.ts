/**
 * Dynamic import so Konva is not evaluated during SSR.
 * Kept in `.ts` (not `.svelte`) so TypeScript resolves the `konva` package typings reliably.
 */
export async function loadKonva() {
	const { default: Konva } = await import('konva');
	return Konva;
}
