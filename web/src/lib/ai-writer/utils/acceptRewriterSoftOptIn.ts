import { REWRITER_SOFT_OPT_IN_STORAGE_KEY } from '$lib/ai-writer/constants/config';

/** Persist Rewriter soft opt-in so the refine consent screen is skipped next time. No-op during SSR. */
export function acceptRewriterSoftOptIn(): void {
	if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
	try {
		localStorage.setItem(REWRITER_SOFT_OPT_IN_STORAGE_KEY, 'true');
	} catch {
		// ignore quota / private-mode failures
	}
}
