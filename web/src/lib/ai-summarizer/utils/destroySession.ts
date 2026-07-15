/**
 * Releases an on-device AI session. Re-exports the shared helper so the
 * summarizer module can tear down Summarizer (and other DestroyableModel) instances
 * without depending on Writer session types at call sites.
 */
export { destroyAiSession } from '$lib/ai-writer/utils/destroySession';

/**
 * Releases a Summarizer session. Idempotent for null/undefined.
 * Prefer {@link destroyAiSession} when tearing down interchangeably.
 */
export function destroySummarizer(summarizer: Summarizer | null | undefined): void {
	if (!summarizer) return;
	try {
		summarizer.destroy();
	} catch {
		// Session may already be aborted or torn down.
	}
}
