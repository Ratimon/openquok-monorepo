import type { DocsConfig, DocsTabDefinition, SidebarSection } from '$lib/docs/types';
import type { IconName } from '$data/icons';

import { icons } from '$data/icons';

/** Overrides `Sidebar.Provider` default (`16rem`) so API-style nav labels (method badge + title) fit. */
export const docsSidebarWidthCss = '--sidebar-width: 20rem';

export const docsSite = {
	title: 'OpenQuok Documentation',
	description: 'Developer Reference',
	url: '',
	social: {
		/** Repo URL for sidebar GitHub + “Edit this page” links. */
		github: 'https://github.com/Ratimon/openquok-monorepo'
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

/** Product usage — `/docs` landing (`getting-started`). */
export const docsSidebarGeneral: DocsSidebarSection[] = [
	{
		label: 'Get started',
		icon: icons.BookOpen.name,
		autogenerate: { directory: 'getting-started' }
	},
	{
		label: 'Channels',
		icon: icons.Share2.name,
		autogenerate: { directory: 'channels' }
	}
];

/** Hosted plans, trial, and billing. */
export const docsSidebarCloud: DocsSidebarSection[] = [
	{
		label: 'Cloud',
		icon: icons.Globe.name,
		autogenerate: { directory: 'cloud' }
	}
];

export const docsSidebarCli: DocsSidebarSection[] = [
	{
		label: 'Get Started',
		icon: icons.Braces.name,
		autogenerate: { directory: 'getting-started-for-cli' }
	},
	{
		label: 'CLI Core Usages',
		icon: icons.Terminal.name,
		autogenerate: { directory: 'cli-usages' }
	},
	{
		label: 'CLI Examples',
		icon: icons.Sparkles.name,
		autogenerate: { directory: 'cli-examples' }
	},
	{
		label: 'Agent Setup Guides',
		icon: icons.Link.name,
		autogenerate: { directory: 'agent-setup-guides' }
	},
	{
		label: 'Other skills',
		icon: icons.Images.name,
		autogenerate: { directory: 'other-skills' }
	}
];

export const docsSidebarMcp: DocsSidebarSection[] = [
	{
		label: 'Getting Started',
		icon: icons.Bot.name,
		autogenerate: { directory: 'getting-started-for-mcp' }
	},
	{
		label: 'MCP Examples',
		icon: icons.Sparkles.name,
		autogenerate: { directory: 'mcp-examples' }
	},
	{
		label: 'MCP References',
		icon: icons.FileText.name,
		autogenerate: { directory: 'mcp-references' }
	},
	{
		label: 'MCP Setup Guides',
		icon: icons.Link.name,
		autogenerate: { directory: 'mcp-setup-guides' }
	},
];

/** Programmatic HTTP API plus third-party OAuth apps (`oauth2-for-apps`). */
export const docsSidebarPublicApi: DocsSidebarSection[] = [
	{
		label: 'Getting Started',
		icon: icons.Code.name,
		autogenerate: { directory: 'getting-started-for-public-api' }
	},
	{
		label: 'OAuth2 for apps',
		icon: icons.Globe.name,
		autogenerate: { directory: 'oauth2-for-apps' }
	},
	{
		label: 'Integrations',
		icon: icons.Link.name,
		autogenerate: { directory: 'apis-integrations' }
	},
	{
		label: 'Posts',
		icon: icons.Send.name,
		autogenerate: { directory: 'apis-posts' }
	},
	{
		label: 'Analytics',
		icon: icons.Activity.name,
		autogenerate: { directory: 'apis-analytics' }
	},
	{
		label: 'Notifications',
		icon: icons.Bell.name,
		autogenerate: { directory: 'apis-notifications' }
	},
	{
		label: 'Uploads',
		icon: icons.Image.name,
		autogenerate: { directory: 'apis-uploads' }
	}
];

/** Operator install, configuration, and self-hosted deployment. Third-party app OAuth lives on Public API (`oauth2-for-apps`). */
export const docsSidebarSelfHosting: DocsSidebarSection[] = [
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
		label: 'CLI Auth Server Setup',
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
	}
];

/** Repository conventions, catalog publishing, and documentation authoring. */
export const docsSidebarContributing: DocsSidebarSection[] = [
	{
		label: 'Developer Guidelines',
		icon: icons.FolderCode.name,
		autogenerate: { directory: 'developer-guidelines' }
	},
	{
		label: 'Publish listings',
		icon: icons.Sparkles.name,
		autogenerate: { directory: 'publish-listings' }
	},
	{
		label: 'Documentation contribution',
		icon: icons.BookOpen.name,
		autogenerate: { directory: 'documentation-contribution' }
	},
];

export const docsTabs: DocsTabDefinition[] = [
	{ id: 'general', label: 'General', sidebar: docsSidebarGeneral },
	{ id: 'cloud', label: 'Cloud', sidebar: docsSidebarCloud },
	{ id: 'self-hosting', label: 'Self-hosting', sidebar: docsSidebarSelfHosting },
	{ id: 'cli', label: 'CLI', sidebar: docsSidebarCli },
	{ id: 'mcp', label: 'MCP', sidebar: docsSidebarMcp },
	{ id: 'public-api', label: 'Public API', sidebar: docsSidebarPublicApi },
	{ id: 'contributing', label: 'Contributing', sidebar: docsSidebarContributing }
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
