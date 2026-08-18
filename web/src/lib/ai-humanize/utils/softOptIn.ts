import { HUMANIZE_SOFT_OPT_IN_STORAGE_KEY } from '$lib/ai-humanize/constants/config';

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

/** Whether the user has accepted the Humanize soft opt-in. Safe during SSR (always false). */
export function hasHumanizeSoftOptIn(): boolean {
	return readSoftOptIn(HUMANIZE_SOFT_OPT_IN_STORAGE_KEY);
}

/** Persist soft opt-in acceptance so the consent screen is skipped next time. No-op during SSR. */
export function acceptHumanizeSoftOptIn(): void {
	writeSoftOptIn(HUMANIZE_SOFT_OPT_IN_STORAGE_KEY);
}
