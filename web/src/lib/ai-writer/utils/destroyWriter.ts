/**
 * Releases a Writer session. Idempotent for null/undefined.
 */
export function destroyWriter(writer: Writer | null | undefined): void {
	if (!writer) return;
	try {
		writer.destroy();
	} catch {
		// Session may already be aborted or torn down.
	}
}
