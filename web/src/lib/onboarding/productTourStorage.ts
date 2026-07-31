import { clearAccountSidebarTours } from '$lib/onboarding/accountSidebarTourStorage';

export const ONBOARDING_COMPLETED_STORAGE_KEY = 'onboarding:completed';

export const HOME_NOTICE_STORAGE_PREFIX = 'home:notice';
export const GETTING_STARTED_NOTICE_KIND = 'getting-started';

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

/** Clears onboarding completion and the Getting started panel dismiss flag for the workspace. */
export function resetProductTours(workspaceId: string | null): void {
	if (typeof localStorage === 'undefined') return;
	try {
		localStorage.removeItem(ONBOARDING_COMPLETED_STORAGE_KEY);
		clearAccountSidebarTours(workspaceId);
		if (workspaceId) {
			localStorage.removeItem(homeNoticeStorageKey(GETTING_STARTED_NOTICE_KIND, workspaceId));
		}
	} catch {
		// ignore
	}
}
