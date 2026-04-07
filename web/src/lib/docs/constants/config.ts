import type { DocsConfig } from '$lib/docs/types';

import type { IconName } from '$data/icon';

import { icons } from '$data/icon';

export const docsSite = {
	title: 'OpenQuok Documentation',
	description: 'Developer Reference',
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
		label: 'Installation',
		icon: icons.Terminal.name,
		autogenerate: { directory: 'Installation' }
	},
	{
		label: 'Backend Setup',
		icon: icons.Settings.name,
		autogenerate: { directory: 'configuration-backend' }
	},
	{
		label: 'Workers Setup',
		icon: icons.Activity.name,
		autogenerate: { directory: 'configuration-worker' }
	},
	{
		label: 'Frontend Setup',
		icon: icons.Settings.name,
		autogenerate: { directory: 'configuration-web' }
	},
	{
		label: 'Admin Roles',
		icon: icons.ShieldCheck.name,
		autogenerate: { directory: 'admin' }
	},
	{
		label: 'Social integrations',
		icon: icons.Share2.name,
		autogenerate: { directory: 'social-integration' }
	},
	{
		label: 'Developer Guidelines',
		icon: icons.Code.name,
		autogenerate: { directory: 'developer-guidelines' }
	},
	{
		label: 'How to write docs',
		icon: icons.BookOpen.name,
		autogenerate: { directory: 'how-to-write-docs' }
	}
];

export const docsConfig: DocsConfig = {
	site: docsSite,
	sidebar: docsSidebar,
	toc: {
		minDepth: 2,
		maxDepth: 3
	},
	i18n: {
		defaultLocale: docsI18n.defaultLocale,
		locales: docsI18n.locales.map((l) => ({ ...l }))
	}
};
