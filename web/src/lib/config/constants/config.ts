import type { ModuleConfigSchema } from '$lib/config/constants/types';
import { getDefaultPublicFaqConfigItems } from '$lib/content/utils/parsePublicFaqConfig';
import { getRootPathPublicBlog } from '$lib/area-public/constants/getRootPathPublicBlog';
import { getRootPathPublicAgents } from '$lib/area-public/constants/getRootPathPublicAgents';
import { getRootPathPublicChannels } from '$lib/area-public/constants/getRootPathPublicChannels';
import { getRootPathPublicDocs } from '$lib/area-public/constants/getRootPathPublicDocs';
import { getRootPathPublicExtensions } from '$lib/area-public/constants/getRootPathPublicExtensions';
import { normalizeApiBaseUrl, route } from '$lib/utils/path';

const publicBlogPath = route(getRootPathPublicBlog());
const publicAgentsPath = route(getRootPathPublicAgents());
const publicChannelsPath = route(getRootPathPublicChannels());
const publicExtensionsPath = route(getRootPathPublicExtensions());
const publicDocsPath = route(getRootPathPublicDocs());

const appName = 'openquok';
const appTitle = 'Openquok | Agentic Social Media Scheduler';
const appDescription =
	'OpenQuok is a social media scheduler to plan, draft, and schedule social media posts across every channel. Calendar, kanban review, and AI agents — start with a 7-day free trial.';
const appKeywords =
	'social media scheduler, social media scheduling tool, schedule social media posts, social media scheduler free, post scheduler, social media posting tool, social media planning tool, free social media scheduling tools, content calendar, multi-platform posting, OpenQuok';

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
		default: 'admin@openquok.com',
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
		inputType: 'textarea',
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
			'Watch how teams schedule social media posts, review AI drafts on a kanban board, and publish across channels from one workspace.',
		inputType: 'textarea',
		maxInputLength: 300
	},
	DEMO_YOUTUBE_VIDEO_ID: {
		description: 'YouTube video ID for the landing page product demo (not the full URL)',
		type: 'string',
		default: 'iKNimZ9FBu8',
		inputType: 'input',
		maxInputLength: 20
	},
	DEMO_THUMBNAIL_ALT: {
		description: 'Alt text for the demo video thumbnail image',
		type: 'string',
		default: 'OpenQuok demo video',
		inputType: 'input',
		maxInputLength: 120
	},
	AUDIENCE_SUBTITLE: {
		description: 'Tag above the audience pillars card section',
		type: 'string',
		default: 'Why OpenQuok',
		inputType: 'input',
		maxInputLength: 60
	},
	AUDIENCE_TITLE: {
		description:
			'Headline for the audience pillars card section (comma separates accent phrase)',
		type: 'string',
		default: 'Who is OpenQuok for?',
		inputType: 'input',
		maxInputLength: 100
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
			'Give each brand, client, or agent its own workspace with isolated channels. Reach your agents from Telegram or other chat apps (ChatGPT, Claude, Openclaw, etc.), then run dozens of social channels without one shared context — or your AI mixing up workflows.',
		inputType: 'textarea',
		maxInputLength: 300
	},
	FEATURE_2_SUBTITLE: {
		description: 'Tag above the second secondary hero section',
		type: 'string',
		default: 'Post scheduler + smart filters',
		inputType: 'input',
		maxInputLength: 60
	},
	FEATURE_2_TITLE: {
		description: 'Headline for the second secondary hero section (comma separates accent phrase)',
		type: 'string',
		default: 'Schedule social media posts ahead, find any draft effortlessly',
		inputType: 'input',
		maxInputLength: 100
	},
	FEATURE_2_DESCRIPTION: {
		description: 'Support copy for the second secondary hero section',
		type: 'string',
		default:
			'Day, week, and month calendar views plus filters by platform, channel group, or tags. Use OpenQuok as your social media planning tool — queue posts ahead and surface the right drafts without scrolling an endless AI queue.',
		inputType: 'textarea',
		maxInputLength: 300
	},
	FEATURE_3_SUBTITLE: {
		description: 'Tag above the third secondary hero section',
		type: 'string',
		default: 'Per-network Post Editor',
		inputType: 'input',
		maxInputLength: 60
	},
	FEATURE_3_TITLE: {
		description: 'Headline for the third secondary hero section (comma separates accent phrase)',
		type: 'string',
		default: 'One draft, then craft for each platform, with per-network settings quickly',
		inputType: 'input',
		maxInputLength: 100
	},
	FEATURE_3_DESCRIPTION: {
		description: 'Support copy for the third secondary hero section',
		type: 'string',
		default:
			'Write once in global mode, then customize any connected account — Facebook link previews, Threads replies, Instagram post types, and more — without losing your shared copy.',
		inputType: 'textarea',
		maxInputLength: 300
	},
	FEATURE_4_SUBTITLE: {
		description: 'Tag above the fourth secondary hero section',
		type: 'string',
		default: 'Kanban + smart filters',
		inputType: 'input',
		maxInputLength: 60
	},
	FEATURE_4_TITLE: {
		description: 'Headline for the fourth secondary hero section (comma separates accent phrase)',
		type: 'string',
		default: 'Review every AI draft, sign off confidently, before it goes live',
		inputType: 'input',
		maxInputLength: 100
	},
	FEATURE_4_DESCRIPTION: {
		description: 'Support copy for the fourth secondary hero section',
		type: 'string',
		default:
			'Chat, move agent-generated posts from draft to review to scheduled on a kanban board—with the same smart filters as your calendar. Approve quality at scale instead of trusting autopilot.',
		inputType: 'textarea',
		maxInputLength: 300
	},
	FEATURE_5_SUBTITLE: {
		description: 'Tag above the fifth secondary hero section',
		type: 'string',
		default: 'Content Management',
		inputType: 'input',
		maxInputLength: 60
	},
	FEATURE_5_TITLE: {
		description: 'Headline for the fifth secondary hero section (comma separates accent phrase)',
		type: 'string',
		default: 'Organize media, keep assets separated, find footages efficiently',
		inputType: 'input',
		maxInputLength: 100
	},
	FEATURE_5_DESCRIPTION: {
		description: 'Support copy for the fifth secondary hero section',
		type: 'string',
		default:
			'Create, rename, and manage files in each agent workspace. Keep client assets, B-roll, and uploads separated so posting stays fast when you run many social channels.',
		inputType: 'textarea',
		maxInputLength: 300
	},
	FEATURE_6_SUBTITLE: {
		description: 'Tag above the sixth secondary hero section',
		type: 'string',
		default: 'Analytics',
		inputType: 'input',
		maxInputLength: 60
	},
	FEATURE_6_TITLE: {
		description: 'Headline for the sixth secondary hero section (comma separates accent phrase)',
		type: 'string',
		default: 'Track engagement, see winners, and adapt correctly',
		inputType: 'input',
		maxInputLength: 100
	},
	FEATURE_6_DESCRIPTION: {
		description: 'Support copy for the sixth secondary hero section',
		type: 'string',
		default:
			'Track impressions, likes, comments, shares, and engagement in one place. Compare performance by platform and channel, and improve the posts you approved.',
		inputType: 'textarea',
		maxInputLength: 300
	},
	FEATURE_7_SUBTITLE: {
		description: 'Tag above the seventh secondary hero section',
		type: 'string',
		default: 'Scale what works',
		inputType: 'input',
		maxInputLength: 60
	},
	FEATURE_7_TITLE: {
		description: 'Headline for the seventh secondary hero section (comma separates accent phrase)',
		type: 'string',
		default:
			'when a format hits, add workspaces and parallel sessions — keep every brand isolated',
		inputType: 'input',
		maxInputLength: 100
	},
	FEATURE_7_DESCRIPTION: {
		description: 'Support copy for the seventh secondary hero section',
		type: 'string',
		default:
			'Spot a winner in analytics, then clone more dedicated workspaces for the next brand while parallel sessions queue the next wave and track performance — channels, and agent context stay isolated as you scale.',
		inputType: 'textarea',
		maxInputLength: 300
	},
	FEATURES_GRID_TITLE: {
		description:
			'Headline for the supported social channels grid (the word "channels" is highlighted like other landing accent words)',
		type: 'string',
		default: 'Supported social media channels',
		inputType: 'input',
		maxInputLength: 120
	},
	FEATURES_GRID_DESCRIPTION: {
		description: 'Support copy below the supported social channels grid headline',
		type: 'string',
		default:
			'Connect the networks you publish to and manage them from one workspace — no switching tools per platform.',
		inputType: 'textarea',
		maxInputLength: 300
	},
	PRICING_SUBTITLE: {
		description: 'Tag above the landing pricing tabs section',
		type: 'string',
		default: 'Pricings',
		inputType: 'input',
		maxInputLength: 60
	},
	PRICING_TITLE: {
		description:
			'Headline for the landing pricing tabs section (comma separates accent phrase; words like "plan" can be highlighted)',
		type: 'string',
		default: 'Find your perfect plan',
		inputType: 'input',
		maxInputLength: 100
	},
	PRICING_DESCRIPTION: {
		description: 'Support copy for the landing pricing tabs section',
		type: 'string',
		default:
			'Transparent pricing for our social media scheduling tool. No hidden fees — cancel anytime. Start with a 7-day free trial.',
		inputType: 'textarea',
		maxInputLength: 300
	},
	FAQ_SUBTITLE: {
		description: 'Tag above the landing FAQ section',
		type: 'string',
		default: 'FAQs',
		inputType: 'input',
		maxInputLength: 60
	},
	FAQ_TITLE: {
		description:
			'Headline for the landing FAQ section (comma separates accent phrase; words like "questions" can be highlighted)',
		type: 'string',
		default: 'Frequently asked questions',
		inputType: 'input',
		maxInputLength: 100
	},
	FAQ_DESCRIPTION: {
		description: 'Support copy for the landing FAQ section',
		type: 'string',
		default: 'Common questions and answers. Contact us if you need more help.',
		inputType: 'textarea',
		maxInputLength: 300
	},
};

/** Public FAQ section copy (pricing page and deep links). */
export const CONFIG_SCHEMA_PUBLIC_FAQ: ModuleConfigSchema = {
	SUBTITLE: {
		description: 'Tag above the public FAQ section',
		type: 'string',
		default: 'FAQs',
		inputType: 'input',
		maxInputLength: 60
	},
	TITLE: {
		description:
			'Headline for the public FAQ section (comma separates accent phrase; words like "questions" can be highlighted)',
		type: 'string',
		default: 'Frequently asked, questions',
		inputType: 'input',
		maxInputLength: 100
	},
	DESCRIPTION: {
		description: 'Support copy for the public FAQ section',
		type: 'string',
		default: 'Common questions and answers. Contact us if you need more help.',
		inputType: 'textarea',
		maxInputLength: 300
	},
	ITEMS: {
		description: 'Questions and answers shown on the landing and pricing FAQ sections',
		type: 'object',
		default: getDefaultPublicFaqConfigItems(),
		inputType: 'faq'
	}
};

/** Public CTA banner copy (agents, channels, blog). */
export const PUBLIC_BANNER_CTA_TEXT = 'Start for $0';

export const CENTERED_DARK_CTA_BANNER_TITLE = 'Your workspace, your approval gate';
export const CENTERED_DARK_CTA_BANNER_DESCRIPTION =
	'OpenQuok is where agent drafts land for review — schedule across channels, track what performs, and publish only what you sign off on.';

export const ACCENT_SPLIT_CTA_BANNER_TITLE = 'Connect your agent today';

export function accentSplitCtaBannerDescription(agentLabel: string): string {
	return `Install openquok-core on ${agentLabel}, draft from chat, and move every post through your OpenQuok calendar or kanban before it publishes.`;
}

/** Compact CTA banner on documentation article pages. */
export const DOCS_PAGE_CTA_BANNER_TITLE = 'Connect your agent today';

export const DOCS_PAGE_CTA_BANNER_DESCRIPTION =
	'Draft from chat, review in your calendar, and publish only what you approve.';

/** Default landing_page copy (git-managed via CONFIG_SCHEMA_LANDING_PAGE). */
export function getLandingPageConfigDefaults(): Record<string, string> {
	return Object.fromEntries(
		Object.entries(CONFIG_SCHEMA_LANDING_PAGE).map(([key, field]) => [
			key,
			String(field.default)
		])
	);
}

/** Default company_information values (git-managed; no runtime API on public routes). */
export function getCompanyConfigDefaults(): Record<string, string> {
	return Object.fromEntries(
		Object.entries(CONFIG_SCHEMA_COMPANY).map(([key, field]) => [
			key,
			field.default != null ? String(field.default) : ''
		])
	);
}

/** Default marketing_information values (git-managed; no runtime API on public routes). */
export function getMarketingConfigDefaults(): Record<string, string> {
	return Object.fromEntries(
		Object.entries(CONFIG_SCHEMA_MARKETING).map(([key, field]) => [
			key,
			field.default != null ? String(field.default) : ''
		])
	);
}

/** Default public_faq module string values (SSR fallback and client-side). */
export function getPublicFaqConfigDefaults(): Record<string, string> {
	return Object.fromEntries(
		Object.entries(CONFIG_SCHEMA_PUBLIC_FAQ)
			.filter(([, field]) => field.inputType !== 'faq')
			.map(([key, field]) => [key, String(field.default)])
	);
}

export type NavOptions = 'tab' | 'scroll' | 'menu' | 'channels' | 'agents';

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
	{ pathname: publicAgentsPath, title: 'Agents', navType: 'agents' },
	{ pathname: publicChannelsPath, title: 'Channels', navType: 'channels' },
	{ pathname: publicExtensionsPath, title: 'Extensions', navType: 'tab' },
	{ pathname: publicBlogPath, title: 'Blog', navType: 'tab' },
	{ pathname: '/pricing', title: 'Pricing', navType: 'tab' }
];

export const PUBLIC_NAVBAR_MOBILE_LINKS: Link[] = [...PUBLIC_NAVBAR_LINKS];

export const PUBLIC_FOOTER_LINKS: Record<string, { label: string; href: string }[]> = {
	Resources: [
		{ label: 'Developer Docs', href: publicDocsPath },
		{ label: 'Agents', href: publicAgentsPath },
		{ label: 'Channels', href: publicChannelsPath },
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
