import type { IconName } from '$data/icon';

import { icons } from '$data/icon';

export const docsSite = {
	title: 'Documentation',
	description: 'Product documentation.',
	url: '',
	social: {
		github: 'https://github.com/Ratimon/openquok-monorepo',
		/** X (Twitter); set empty string to hide in UI */
		twitter: 'https://x.com/'
	}
};

export const docsI18n = {
	defaultLocale: 'en',
	locales: [
		{ code: 'en', label: 'English', flag: '🇺🇸' },
		{ code: 'es', label: 'Español', flag: '🇪🇸' }
	]
} as const;

export type DocsSidebarSection = {
	label: string;
	icon?: IconName;
	autogenerate?: { directory: string };
	items?: { label: string; href: string }[];
};

export const docsSidebar: DocsSidebarSection[] = [
	{
		label: 'Getting Started',
		icon: icons.Rocket.name,
		autogenerate: { directory: 'getting-started' }
	},
	{
		label: 'Guides',
		icon: icons.BookOpen.name,
		autogenerate: { directory: 'guides' }
	}
];
