/**
 * Releases an on-device AI session (Writer, Rewriter, etc.). Idempotent for null/undefined.
 */
export function destroyAiSession(session: DestroyableModel | null | undefined): void {
	if (!session) return;
	try {
		session.destroy();
	} catch {
		// Session may already be aborted or torn down.
	}
}
