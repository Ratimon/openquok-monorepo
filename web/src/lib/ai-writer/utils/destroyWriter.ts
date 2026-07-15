import { destroyAiSession } from '$lib/ai-writer/utils/destroyAiSession';

/**
 * Releases a Writer session. Idempotent for null/undefined.
 * Prefer {@link destroyAiSession} when tearing down Writer or Rewriter interchangeably.
 */
export function destroyWriter(writer: Writer | null | undefined): void {
	destroyAiSession(writer);
}
