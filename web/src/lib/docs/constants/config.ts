import type { DocsConfig, DocsTabDefinition, SidebarSection } from '$lib/docs/types';
import type { IconName } from '$data/icons';

import { icons } from '$data/icons';

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

/** CLI & programmatic usage — default `/docs` landing. Order: left tab → middle → right in the header. */
export const docsSidebarCli: DocsSidebarSection[] = [
	{
		label: 'Get Started',
		icon: icons.Braces.name,
		autogenerate: { directory: 'getting-started-for-cli' }
	}
];

export const docsSidebarPublicApi: DocsSidebarSection[] = [
	{
		label: 'Getting Started',
		icon: icons.Code.name,
		autogenerate: { directory: 'getting-started-for-public-api' }
	},
	{
		label: 'Integrations',
		icon: icons.Link.name,
		autogenerate: { directory: 'apis-integrations' }
	}
];

/** Self-hosting, contributing, and deeper product setup. */
export const docsSidebarLearnMore: DocsSidebarSection[] = [
	{
		label: 'Getting Started',
		icon: icons.Rocket.name,
		autogenerate: { directory: 'getting-started-for-dev' }
	},
	{
		label: 'Installation',
		icon: icons.Terminal.name,
		autogenerate: { directory: 'installation' }
	},
	{
		label: 'Backend Setup',
		icon: icons.Settings.name,
		autogenerate: { directory: 'configuration-backend' }
	},
	{
		label: 'Frontend Setup',
		icon: icons.Settings.name,
		autogenerate: { directory: 'configuration-web' }
	},
	{
		label: 'Workers Setup',
		icon: icons.Activity.name,
		autogenerate: { directory: 'configuration-worker' }
	},
	{
		label: 'CLI Auth Setup',
		icon: icons.Lock.name,
		autogenerate: { directory: 'configuration-agent' }
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
		icon: icons.FolderCode.name,
		autogenerate: { directory: 'developer-guidelines' }
	},
	{
		label: 'How to write docs',
		icon: icons.BookOpen.name,
		autogenerate: { directory: 'how-to-write-docs' }
	}
];

export const docsTabs: DocsTabDefinition[] = [
	{ id: 'cli', label: 'CLI', sidebar: docsSidebarCli },
	{ id: 'public-api', label: 'Public API', sidebar: docsSidebarPublicApi },
	{ id: 'learn-more', label: 'Learn more', sidebar: docsSidebarLearnMore }
];

/** Flattened sidebar order for ordering pages (prev/next fallbacks, llms.txt, etc.). */
export const docsSidebarMerged: SidebarSection[] = docsTabs.flatMap((t) => t.sidebar);

export const docsConfig: DocsConfig = {
	site: docsSite,
	sidebar: docsSidebarMerged,
	tabs: docsTabs,
	toc: {
		minDepth: 2,
		maxDepth: 3
	},
	i18n: {
		defaultLocale: docsI18n.defaultLocale,
		locales: docsI18n.locales.map((l) => ({ ...l }))
	}
};
