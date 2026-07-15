import {
	REWRITER_SOFT_OPT_IN_STORAGE_KEY,
	WRITER_SOFT_OPT_IN_STORAGE_KEY
} from '$lib/ai-writer/constants/config';

function readSoftOptIn(key: string): boolean {
	if (typeof window === 'undefined' || typeof localStorage === 'undefined') return false;
	try {
		return localStorage.getItem(key) === 'true';
	} catch {
		return false;
	}
}

function writeSoftOptIn(key: string): void {
	if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
	try {
		localStorage.setItem(key, 'true');
	} catch {
		// ignore quota / private-mode failures
	}
}

/** Whether the user has accepted the AI Writer soft opt-in. Safe during SSR (always false). */
export function hasWriterSoftOptIn(): boolean {
	return readSoftOptIn(WRITER_SOFT_OPT_IN_STORAGE_KEY);
}

/** Persist soft opt-in acceptance so the consent screen is skipped next time. No-op during SSR. */
export function acceptWriterSoftOptIn(): void {
	writeSoftOptIn(WRITER_SOFT_OPT_IN_STORAGE_KEY);
}

/** Whether the user has accepted the AI Writer Rewriter soft opt-in. Safe during SSR (always false). */
export function hasRewriterSoftOptIn(): boolean {
	return readSoftOptIn(REWRITER_SOFT_OPT_IN_STORAGE_KEY);
}

/** Persist Rewriter soft opt-in so the refine consent screen is skipped next time. No-op during SSR. */
export function acceptRewriterSoftOptIn(): void {
	writeSoftOptIn(REWRITER_SOFT_OPT_IN_STORAGE_KEY);
}
