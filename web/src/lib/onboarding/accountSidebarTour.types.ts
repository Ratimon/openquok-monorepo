import type { IconName } from '$data/icons';

export type AccountSidebarTourId =
	| 'home'
	| 'calendar'
	| 'templates'
	| 'playbooks'
	| 'plugs'
	| 'analytics'
	| 'media';

export const ACCOUNT_SIDEBAR_TOUR_IDS: AccountSidebarTourId[] = [
	'home',
	'calendar',
	'templates',
	'playbooks',
	'plugs',
	'analytics',
	'media'
];

/** Plain string or highlighted phrase within a paragraph. */
export type AccountSidebarTourTextPart = string | { highlight: string };

export type AccountSidebarTourStep = {
	title: string;
	subtitle: string;
	iconName: IconName;
	paragraphs: AccountSidebarTourTextPart[][];
	/** Optional tip below the paragraphs (e.g. “Remember …”). */
	remember?: string;
};

export type AccountSidebarTourDefinition = {
	id: AccountSidebarTourId;
	steps: AccountSidebarTourStep[];
};
