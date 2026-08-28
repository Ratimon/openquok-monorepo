import { clearAccountSidebarTours } from '$lib/onboarding/accountSidebarTourStorage';

export const ONBOARDING_COMPLETED_STORAGE_KEY = 'onboarding:completed';

/** Per-user acquisition survey dismiss key prefix (`{prefix}:{userId}`). Not a product tour. */
export const ACQUISITION_SURVEY_DONE_STORAGE_PREFIX = 'acquisition-survey:done';

export const HOME_NOTICE_STORAGE_PREFIX = 'home:notice';
export const GETTING_STARTED_NOTICE_KIND = 'getting-started';
export const GETTING_STARTED_TIKTOK_WARMUP_KIND = 'getting-started-tiktok-warmup';

export function homeNoticeStorageKey(kind: string, orgId: string): string {
	return `${HOME_NOTICE_STORAGE_PREFIX}:${kind}:${orgId}`;
}

export function readHomeNoticeDismissed(kind: string, orgId: string | null): boolean {
	if (typeof localStorage === 'undefined' || !orgId) return false;
	try {
		return localStorage.getItem(homeNoticeStorageKey(kind, orgId)) === 'true';
	} catch {
		return false;
	}
}

export function persistHomeNoticeDismissed(kind: string, orgId: string): void {
	if (typeof localStorage === 'undefined') return;
	try {
		localStorage.setItem(homeNoticeStorageKey(kind, orgId), 'true');
	} catch {
		// ignore
	}
}

export function isOnboardingCompleted(): boolean {
	if (typeof localStorage === 'undefined') return false;
	try {
		return localStorage.getItem(ONBOARDING_COMPLETED_STORAGE_KEY) === 'true';
	} catch {
		return false;
	}
}

export function markOnboardingCompleted(): void {
	if (typeof localStorage === 'undefined') return;
	try {
		localStorage.setItem(ONBOARDING_COMPLETED_STORAGE_KEY, 'true');
	} catch {
		// ignore
	}
}

/**
 * Clears onboarding completion, sidebar tours, and Getting started dismiss flags for the workspace.
 * Does not clear acquisition survey keys (`ACQUISITION_SURVEY_DONE_STORAGE_PREFIX`) — the survey is
 * not a product tour and should not reappear after "Reset product tours".
 */
export function resetProductTours(workspaceId: string | null): void {
	if (typeof localStorage === 'undefined') return;
	try {
		localStorage.removeItem(ONBOARDING_COMPLETED_STORAGE_KEY);
		clearAccountSidebarTours(workspaceId);
		if (workspaceId) {
			localStorage.removeItem(homeNoticeStorageKey(GETTING_STARTED_NOTICE_KIND, workspaceId));
			localStorage.removeItem(homeNoticeStorageKey(GETTING_STARTED_TIKTOK_WARMUP_KIND, workspaceId));
		}
	} catch {
		// ignore
	}
}
