import { WRITER_SOFT_OPT_IN_STORAGE_KEY } from '$lib/ai-writer/constants/config';

/** Whether the user has accepted the AI Writer soft opt-in. Safe during SSR (always false). */
export function hasWriterSoftOptIn(): boolean {
	if (typeof window === 'undefined' || typeof localStorage === 'undefined') return false;
	try {
		return localStorage.getItem(WRITER_SOFT_OPT_IN_STORAGE_KEY) === 'true';
	} catch {
		return false;
	}
}
