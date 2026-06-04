import type { ModuleConfigSchema } from '$lib/config/constants/types';
import { getRootPathPublicBlog } from '$lib/area-public/constants/getRootPathPublicBlog';
import { getRootPathPublicDocs } from '$lib/area-public/constants/getRootPathPublicDocs';
import { normalizeApiBaseUrl, route } from '$lib/utils/path';

const publicBlogPath = route(getRootPathPublicBlog());
const publicDocsPath = route(getRootPathPublicDocs());

const appName = 'Openquok';
const appTitle = 'Openquok | Agentic Social Media Scheduler';
const appDescription =
	'Draft, review, and schedule social posts from AI agents across platforms and workspaces—stay in control of what goes live.';
const appKeywords =
	'social media scheduler, AI content, content scheduling, social media management, multi-platform posting, content approval, agentic AI, Openquok';

function getApiBaseUrl(): string {
	const fromMeta =
		typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL !== undefined
			? String(import.meta.env.VITE_API_BASE_URL)
			: undefined;
	const fromProcess =
		typeof process !== 'undefined' && process.env?.VITE_API_BASE_URL !== undefined
			? String(process.env.VITE_API_BASE_URL)
			: undefined;
	const explicit = fromMeta ?? fromProcess;
	if (explicit !== undefined) {
		return normalizeApiBaseUrl(explicit);
	}
	// Dev + Vite proxy: empty base → relative `/api/...` on the web origin so cookies stay same-site with HTTPS dev.
	if (typeof import.meta !== 'undefined' && import.meta.env.DEV) {
		return '';
	}
	// Production default: use same-origin relative API paths (deploy behind a reverse proxy).
	// If your backend is on a different host, you must set VITE_API_BASE_URL explicitly.
	return '';
}

export const CONFIG_SCHEMA_BACKEND: ModuleConfigSchema = {
	API_BASE_URL: {
		description: 'The base URL for all backend API requests.',
		type: 'string',
		default: getApiBaseUrl(),
		inputType: 'input'
	}
};

export const CONFIG_SCHEMA_COMPANY: ModuleConfigSchema = {
	NAME: {
		description: "Company's trading name.",
		type: 'string',
		default: appName,
		inputType: 'input',
		maxInputLength: 60
	},
	URL: {
		description: 'Primary website URL.',
		type: 'string',
		default: 'https://openquok.com',
		inputType: 'input'
	},
	FOUNDING_YEAR: {
		description: 'Year the company was established.',
		type: 'string',
		default: new Date().getFullYear().toString(),
		inputType: 'input'
	},
	LEGAL_NAME: {
		description: "Company's legal name (if different from trading name).",
		type: 'string',
		default: appName,
		inputType: 'input',
		maxInputLength: 120
	},
	VAT_ID: {
		description: 'VAT / tax identifier.',
		type: 'string',
		default: '',
		inputType: 'input',
		maxInputLength: 64
	},
	COMPANY_ADDRESS: {
		description: 'Registered company address.',
		type: 'string',
		default: '',
		inputType: 'textarea',
		maxInputLength: 240
	},
	SUPPORT_EMAIL: {
		description: 'Support contact email (used by legal pages).',
		type: 'string',
		default: 'support@openquok.com',
		inputType: 'input',
		maxInputLength: 160
	},
	SUPPORT_PHONE: {
		description: 'Support contact phone.',
		type: 'string',
		default: '',
		inputType: 'input',
		maxInputLength: 40
	},
	RESPONSIBLE_PERSON: {
		description:
			'Name of the person legally responsible for site content (used by legal pages).',
		type: 'string',
		default: '',
		inputType: 'input',
		maxInputLength: 120
	}
};

export const CONFIG_SCHEMA_MARKETING: ModuleConfigSchema = {
	META_TITLE: {
		description: 'Default meta title.',
		type: 'string',
		default: appTitle,
		inputType: 'input'
	},
	META_DESCRIPTION: {
		description: 'Default meta description.',
		type: 'string',
		default: appDescription,
		inputType: 'textarea'
	},
	META_KEYWORDS: {
		description: 'Meta keywords, comma-separated.',
		type: 'string',
		default: appKeywords,
		inputType: 'input'
	},
	SOCIAL_LINKS_X: {
		description: 'X (Twitter) profile URL.',
		type: 'string',
		default: '',
		inputType: 'input'
	},
	SOCIAL_LINKS_FACEBOOK: {
		description: 'Facebook page URL.',
		type: 'string',
		default: '',
		inputType: 'input'
	},
	SOCIAL_LINKS_INSTAGRAM: {
		description: 'Instagram profile URL.',
		type: 'string',
		default: '',
		inputType: 'input'
	},
	SOCIAL_LINKS_YOUTUBE: {
		description: 'YouTube channel URL.',
		type: 'string',
		default: '',
		inputType: 'input'
	}
};


// Landing page (public home) content defaults
export const CONFIG_SCHEMA_LANDING_PAGE: ModuleConfigSchema = {
	HERO_TITLE: {
		description: 'The primary headline displayed in the hero section of your landing page',
		type: 'string',
		default: 'Save hours\nmanaging AI content\nat scale',
		inputType: 'input',
		maxInputLength: 80
	},
	HERO_SLOGAN: {
		description: 'The secondary text or tagline shown below the hero title',
		type: 'string',
		default:
			'Let AI agents handle volume — drafting and scheduling at scale. You handle quality: review and approve what goes live across your channels. Connect OpenClaw, Hermes, or Claude.',
		inputType: 'textarea',
		maxInputLength: 200
	},
	ACTIVE_TOP_BANNER: {
		description: 'Enable or disable the top banner display on the landing page',
		type: 'boolean',
		default: false,
		inputType: 'switch'
	},
	DEMO_SUBTITLE: {
		description: 'Tag above the product demo video section',
		type: 'string',
		default: 'How it works',
		inputType: 'input',
		maxInputLength: 60
	},
	DEMO_TITLE: {
		description:
			'Headline for the product demo video section (comma separates accent phrase; "in action" is highlighted)',
		type: 'string',
		default: 'See OpenQuok, in action',
		inputType: 'input',
		maxInputLength: 100
	},
	DEMO_DESCRIPTION: {
		description: 'Support copy for the product demo video section',
		type: 'string',
		default:
			'Watch how teams review AI drafts, schedule posts, and run multi-agent workspaces at scale.',
		inputType: 'textarea',
		maxInputLength: 300
	},
	FEATURE_1_SUBTITLE: {
		description: 'Tag above the first secondary hero section',
		type: 'string',
		default: 'Multi Agent Workspaces',
		inputType: 'input',
		maxInputLength: 60
	},
	FEATURE_1_TITLE: {
		description: 'Headline for the first secondary hero section (comma separates accent phrase)',
		type: 'string',
		default: 'Multi agent, multi platforms, minimal hallucinations',
		inputType: 'input',
		maxInputLength: 100
	},
	FEATURE_1_DESCRIPTION: {
		description: 'Support copy for the first secondary hero section',
		type: 'string',
		default:
			'Give each brand, client, or OpenClaw agent its own workspace with isolated channels and drafts. Run dozens of accounts without one shared context — or your AI mixing up with wrong workflow.',
		inputType: 'textarea',
		maxInputLength: 300
	},
	FEATURE_2_SUBTITLE: {
		description: 'Tag above the second secondary hero section',
		type: 'string',
		default: 'Calendar + smart filters',
		inputType: 'input',
		maxInputLength: 60
	},
	FEATURE_2_TITLE: {
		description: 'Headline for the second secondary hero section (comma separates accent phrase)',
		type: 'string',
		default: 'Plan weeks ahead, find any post effortlessly',
		inputType: 'input',
		maxInputLength: 100
	},
	FEATURE_2_DESCRIPTION: {
		description: 'Support copy for the second secondary hero section',
		type: 'string',
		default:
			'Day, week, and month calendar views plus filters by platform, channel group, or tags. Schedule ahead and surface the right drafts without scrolling an endless AI queue.',
		inputType: 'textarea',
		maxInputLength: 300
	},
	FEATURE_3_SUBTITLE: {
		description: 'Tag above the third secondary hero section',
		type: 'string',
		default: 'Kanban + smart filters',
		inputType: 'input',
		maxInputLength: 60
	},
	FEATURE_3_TITLE: {
		description: 'Headline for the third secondary hero section (comma separates accent phrase)',
		type: 'string',
		default: 'Review every AI draft, sign off confidently, before it goes live',
		inputType: 'input',
		maxInputLength: 100
	},
	FEATURE_3_DESCRIPTION: {
		description: 'Support copy for the third secondary hero section',
		type: 'string',
		default:
			'Move agent-generated posts from draft to review to scheduled on a kanban board—with the same smart filters as your calendar. Approve quality at scale instead of trusting autopilot.',
		inputType: 'textarea',
		maxInputLength: 300
	},
	FEATURE_4_SUBTITLE: {
		description: 'Tag above the fourth secondary hero section',
		type: 'string',
		default: 'File manager',
		inputType: 'input',
		maxInputLength: 60
	},
	FEATURE_4_TITLE: {
		description: 'Headline for the fourth secondary hero section (comma separates accent phrase)',
		type: 'string',
		default: 'Organize media, keep assets separated, find footages efficiently',
		inputType: 'input',
		maxInputLength: 100
	},
	FEATURE_4_DESCRIPTION: {
		description: 'Support copy for the fourth secondary hero section',
		type: 'string',
		default:
			'Create, rename, and manage files in each agent workspace. Keep client assets, B-roll, and uploads separated so posting stays fast when you run many accounts.',
		inputType: 'textarea',
		maxInputLength: 300
	},
	FEATURE_5_SUBTITLE: {
		description: 'Tag above the fifth secondary hero section',
		type: 'string',
		default: 'Analytics',
		inputType: 'input',
		maxInputLength: 60
	},
	FEATURE_5_TITLE: {
		description: 'Headline for the fifth secondary hero section (comma separates accent phrase)',
		type: 'string',
		default: 'See what worked, across every channel',
		inputType: 'input',
		maxInputLength: 100
	},
	FEATURE_5_DESCRIPTION: {
		description: 'Support copy for the fifth secondary hero section',
		type: 'string',
		default:
			'Track impressions, likes, comments, shares, and engagement in one place. Compare performance by platform and channel—and improve the posts you approved, not just the volume AI produced.',
		inputType: 'textarea',
		maxInputLength: 300
	}
};

/** Default landing_page module values (SSR fallback and client-side). */
export function getLandingPageConfigDefaults(): Record<string, string> {
	return Object.fromEntries(
		Object.entries(CONFIG_SCHEMA_LANDING_PAGE).map(([key, field]) => [
			key,
			String(field.default)
		])
	);
}

export type NavOptions = 'tab' | 'scroll' | 'menu';

export interface DropdownLink {
	href: string;
	title: string;
}

export interface Link {
	pathname: string;
	title: string;
	navType: NavOptions;
	dropdownItems?: DropdownLink[];
	preload?: 'hover' | 'tap' | 'off' | 'intent';
}


export const PUBLIC_NAVBAR_LINKS: Link[] = [
	{ pathname: publicDocsPath, title: 'Dev Docs', navType: 'tab' },
	{ pathname: publicBlogPath, title: 'Blog', navType: 'tab' },
	{ pathname: '/pricing', title: 'Pricing', navType: 'tab' }
];

export const PUBLIC_NAVBAR_MOBILE_LINKS: Link[] = [...PUBLIC_NAVBAR_LINKS];

export const PUBLIC_FOOTER_LINKS: Record<string, { label: string; href: string }[]> = {
	Resources: [
		{ label: 'Developer Docs', href: publicDocsPath },
		{ label: 'Blog', href: publicBlogPath },
		{ label: 'Blog Topics', href: '/blog/topic' },
		{ label: 'Blog Authors', href: '/blog/author' }
	],
	Legal: [
		{ label: 'Terms', href: '/terms' },
		{ label: 'Privacy', href: '/privacy-policy' },
		{ label: 'Cookies', href: '/cookie-policy' }
	],
	Company: [
		{ label: 'About Us', href: '/about' },
		{ label: 'Pricing', href: '/pricing' },
		{ label: 'Sitemap', href: '/sitemap.xml' }
	]
};
