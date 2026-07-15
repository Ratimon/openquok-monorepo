import { WRITER_SOFT_OPT_IN_STORAGE_KEY } from '$lib/ai-writer/constants/config';

/** Persist soft opt-in acceptance so the consent screen is skipped next time. No-op during SSR. */
export function acceptWriterSoftOptIn(): void {
	if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
	try {
		localStorage.setItem(WRITER_SOFT_OPT_IN_STORAGE_KEY, 'true');
	} catch {
		// ignore quota / private-mode failures
	}
}
