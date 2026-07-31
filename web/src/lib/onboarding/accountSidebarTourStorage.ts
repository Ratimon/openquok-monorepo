import {
	ACCOUNT_SIDEBAR_TOUR_IDS,
	type AccountSidebarTourId
} from '$lib/onboarding/accountSidebarTour.types';

const STORAGE_PREFIX = 'account-sidebar-tour';

export function accountSidebarTourStorageKey(
	workspaceId: string,
	tourId: AccountSidebarTourId
): string {
	return `${STORAGE_PREFIX}:${workspaceId}:${tourId}`;
}

export function readAccountSidebarTourCompleted(
	workspaceId: string | null,
	tourId: AccountSidebarTourId
): boolean {
	if (typeof localStorage === 'undefined' || !workspaceId) return false;
	try {
		return localStorage.getItem(accountSidebarTourStorageKey(workspaceId, tourId)) === 'true';
	} catch {
		return false;
	}
}

export function persistAccountSidebarTourCompleted(
	workspaceId: string,
	tourId: AccountSidebarTourId
): void {
	if (typeof localStorage === 'undefined') return;
	try {
		localStorage.setItem(accountSidebarTourStorageKey(workspaceId, tourId), 'true');
	} catch {
		// ignore
	}
}

export function hasAnyAccountSidebarTourCompleted(workspaceId: string | null): boolean {
	if (!workspaceId) return false;
	return ACCOUNT_SIDEBAR_TOUR_IDS.some((id) => readAccountSidebarTourCompleted(workspaceId, id));
}

export function clearAccountSidebarTours(workspaceId: string | null): void {
	if (typeof localStorage === 'undefined') return;
	try {
		if (!workspaceId) {
			for (let i = localStorage.length - 1; i >= 0; i -= 1) {
				const key = localStorage.key(i);
				if (key?.startsWith(`${STORAGE_PREFIX}:`)) localStorage.removeItem(key);
			}
			return;
		}
		for (const tourId of ACCOUNT_SIDEBAR_TOUR_IDS) {
			localStorage.removeItem(accountSidebarTourStorageKey(workspaceId, tourId));
		}
	} catch {
		// ignore
	}
}
