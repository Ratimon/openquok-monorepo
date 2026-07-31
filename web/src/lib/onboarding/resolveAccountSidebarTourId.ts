import type { AccountSidebarTourId } from '$lib/onboarding/accountSidebarTour.types';
import {
	getRootPathAccount,
	getRootPathAnalytics,
	getRootPathCalendar,
	getRootPathMedia,
	getRootPathPlaybooksHub,
	getRootPathPlugs,
	getRootPathTemplates
} from '$lib/area-protected/getRootPathProtectedArea';
import { route } from '$lib/utils/path';

type TourPathRule = { id: AccountSidebarTourId; path: string };

function buildTourPathRules(): TourPathRule[] {
	const account = route(getRootPathAccount());
	return [
		{ id: 'playbooks', path: `${account}/${getRootPathPlaybooksHub()}` },
		{ id: 'calendar', path: `${account}/${getRootPathCalendar()}` },
		{ id: 'templates', path: `${account}/${getRootPathTemplates()}` },
		{ id: 'plugs', path: `${account}/${getRootPathPlugs()}` },
		{ id: 'analytics', path: `${account}/${getRootPathAnalytics()}` },
		{ id: 'media', path: `${account}/${getRootPathMedia()}` },
		{ id: 'home', path: account }
	];
}

function matchesSection(pathname: string, sectionPath: string): boolean {
	if (sectionPath === '/') return pathname === '/';
	return pathname === sectionPath || pathname.startsWith(`${sectionPath}/`);
}

/** Maps an account-area pathname to a sidebar feature tour, or `null` for routes without a tour. */
export function resolveAccountSidebarTourId(pathname: string): AccountSidebarTourId | null {
	const p = route(pathname);
	const rules = buildTourPathRules();

	for (const rule of rules) {
		if (rule.id === 'home') {
			if (p === rule.path || p === `${rule.path}/`) return 'home';
			continue;
		}
		if (matchesSection(p, rule.path)) return rule.id;
	}

	return null;
}
