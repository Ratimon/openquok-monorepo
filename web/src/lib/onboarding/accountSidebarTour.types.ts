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

/** Plain string, highlighted phrase, or link to a Guide page (`/docs/…`). */
export type AccountSidebarTourTextPart =
	| string
	| { highlight: string }
	| { link: { label: string; href: string } };

export type AccountSidebarTourStepImage = {
	src: string;
	alt: string;
};

export type AccountSidebarTourStep = {
	title: string;
	subtitle: string;
	iconName: IconName;
	paragraphs: AccountSidebarTourTextPart[][];
	/** Optional screenshot from `/docs/_assets/…`. */
	image?: AccountSidebarTourStepImage;
	/** Optional tip below the paragraphs (e.g. “Remember …”). */
	remember?: string;
	rememberParts?: AccountSidebarTourTextPart[];
};

export type AccountSidebarTourDefinition = {
	id: AccountSidebarTourId;
	steps: AccountSidebarTourStep[];
};
