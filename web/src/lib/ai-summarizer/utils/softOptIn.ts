import { SUMMARIZER_SOFT_OPT_IN_STORAGE_KEY } from '$lib/ai-summarizer/constants/config';

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

/** Whether the user has accepted the AI Summarizer soft opt-in. Safe during SSR (always false). */
export function hasSummarizerSoftOptIn(): boolean {
	return readSoftOptIn(SUMMARIZER_SOFT_OPT_IN_STORAGE_KEY);
}

/** Persist soft opt-in acceptance so the consent screen is skipped next time. No-op during SSR. */
export function acceptSummarizerSoftOptIn(): void {
	writeSoftOptIn(SUMMARIZER_SOFT_OPT_IN_STORAGE_KEY);
}
