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

/**
 * Releases a Writer session. Idempotent for null/undefined.
 * Prefer {@link destroyAiSession} when tearing down Writer or Rewriter interchangeably.
 */
export function destroyWriter(writer: Writer | null | undefined): void {
	destroyAiSession(writer);
}
