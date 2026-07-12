import type { IconName } from '$data/icons';
import type { ModuleConfigSchema } from '$lib/config/constants/types';

import { icons } from '$data/icons';
import { getDefaultPublicFaqConfigItems } from '$lib/content/constants/publicFaqConfig';
import { getRootPathPublicBlog } from '$lib/area-public/constants/getRootPathPublicBlog';
import { getRootPathPublicAgents } from '$lib/area-public/constants/getRootPathPublicAgents';
import { getRootPathPublicChannels } from '$lib/area-public/constants/getRootPathPublicChannels';
import { getRootPathPublicCompare } from '$lib/area-public/constants/getRootPathPublicCompare';
import { getRootPathPublicAlternatives } from '$lib/area-public/constants/getRootPathPublicAlternatives';
import { getRootPathPublicDocs, getRootPathPublicDocsGettingStartedForDev } from '$lib/area-public/constants/getRootPathPublicDocs';
import { getRootPathPublicBuildingBlocks } from '$lib/area-public/constants/getRootPathPublicBuildingBlocks';
import {
	getRootPathPublicBuildingBlocksCategories,
	getRootPathPublicBuildingBlocksTags
} from '$lib/area-public/constants/getRootPathPublicBuildingBlocks';
import { getRootPathPublicCreators } from '$lib/area-public/constants/getRootPathPublicCreators';
import { getRootPathPublicPlaybooks } from '$lib/area-public/constants/getRootPathPublicPlaybooks';
import {
	getRootPathPublicPlaybooksCategories,
	getRootPathPublicPlaybooksTags
} from '$lib/area-public/constants/getRootPathPublicPlaybooks';
import {
	getRootPathPublicSkillBuilder,
	getRootPathPublicPhotoEditor,
	getRootPathPublicTools
} from '$lib/area-public/constants/getRootPathPublicTools';
import { normalizeApiBaseUrl, route } from '$lib/utils/path';

const publicBlogPath = route(getRootPathPublicBlog());
const publicAgentsPath = route(getRootPathPublicAgents());
const publicChannelsPath = route(getRootPathPublicChannels());
const publicComparePath = route(getRootPathPublicCompare());
const publicAlternativesPath = route(getRootPathPublicAlternatives());
const publicPlaybooksPath = route(getRootPathPublicPlaybooks());
const publicPlaybooksCategoriesPath = route(getRootPathPublicPlaybooksCategories());
const publicPlaybooksTagsPath = route(getRootPathPublicPlaybooksTags());
const publicBuildingBlocksPath = route(getRootPathPublicBuildingBlocks());
const publicBuildingBlocksCategoriesPath = route(getRootPathPublicBuildingBlocksCategories());
const publicBuildingBlocksTagsPath = route(getRootPathPublicBuildingBlocksTags());
const publicCreatorsPath = route(getRootPathPublicCreators());
const publicDocsPath = route(getRootPathPublicDocs());
const publicDocsGettingStartedForDevPath = route(getRootPathPublicDocsGettingStartedForDev());
const publicToolsPath = route(getRootPathPublicTools());
const publicSkillBuilderPath = route(getRootPathPublicSkillBuilder());
const publicPhotoEditorPath = route(getRootPathPublicPhotoEditor());

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
		default: 'https://x.com/openquok',
		inputType: 'input'
	},
	SOCIAL_LINKS_FACEBOOK: {
		description: 'Facebook page URL.',
		type: 'string',
		default: 'https://www.facebook.com/profile.php?id=61591368794883',
		inputType: 'input'
	},
	SOCIAL_LINKS_INSTAGRAM: {
		description: 'Instagram profile URL.',
		type: 'string',
		default: 'https://www.instagram.com/openquok',
		inputType: 'input'
	},
	SOCIAL_LINKS_YOUTUBE: {
		description: 'YouTube channel URL.',
		type: 'string',
		default: '',
		inputType: 'input'
	},
	SOCIAL_LINKS_LINKEDIN: {
		description: 'LinkedIn profile or company page URL.',
		type: 'string',
		default: 'https://www.linkedin.com/company/openquok',
		inputType: 'input'
	}
};

/** Marketing config keys for public social profile URLs (`CONFIG_SCHEMA_MARKETING`). */
export type SocialLinkChannelId =
	| 'SOCIAL_LINKS_FACEBOOK'
	| 'SOCIAL_LINKS_X'
	| 'SOCIAL_LINKS_INSTAGRAM'
	| 'SOCIAL_LINKS_LINKEDIN'
	| 'SOCIAL_LINKS_YOUTUBE';

export type SocialProfileLink = {
	CHANNEL_ID: SocialLinkChannelId;
	CHANNEL_NAME: string;
	Icon: IconName;
	/** When false, omitted from footer follow bar (still eligible for schema `sameAs` if configured). */
	showInFollowBar?: boolean;
};

/**
 * Social profile channel metadata (icons / labels). Profile URLs live only in
 * {@link CONFIG_SCHEMA_MARKETING} `SOCIAL_LINKS_*` defaults — use {@link getSocialProfileHref}.
 */
export const SOCIAL_PROFILE_LINKS: readonly SocialProfileLink[] = [
	{
		CHANNEL_ID: 'SOCIAL_LINKS_FACEBOOK',
		CHANNEL_NAME: 'Facebook',
		Icon: icons.Facebook.name
	},
	{
		CHANNEL_ID: 'SOCIAL_LINKS_X',
		CHANNEL_NAME: 'X',
		Icon: icons.X.name
	},
	{
		CHANNEL_ID: 'SOCIAL_LINKS_INSTAGRAM',
		CHANNEL_NAME: 'Instagram',
		Icon: icons.Instagram.name
	},
	{
		CHANNEL_ID: 'SOCIAL_LINKS_LINKEDIN',
		CHANNEL_NAME: 'LinkedIn',
		Icon: icons.LinkedIn.name
	},
	{
		CHANNEL_ID: 'SOCIAL_LINKS_YOUTUBE',
		CHANNEL_NAME: 'YouTube',
		Icon: icons.YouTube.name,
		showInFollowBar: false
	}
];

export const SOCIAL_FOLLOW_BAR_LINKS = SOCIAL_PROFILE_LINKS.filter(
	(link) => link.showInFollowBar !== false
);

/** Resolve a social profile URL from marketing schema defaults. */
export function getSocialProfileHref(channelId: SocialLinkChannelId): string {
	const raw = CONFIG_SCHEMA_MARKETING[channelId]?.default;
	return typeof raw === 'string' ? raw.trim() : '';
}

/** Non-empty profile URLs for schema.org Organization `sameAs`. */
export function resolveSocialSameAsUrls(): string[] {
	const urls: string[] = [];
	for (const link of SOCIAL_PROFILE_LINKS) {
		const href = getSocialProfileHref(link.CHANNEL_ID);
		if (href) urls.push(href);
	}
	return urls;
}

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
			'when a format hits, scale by adding workspaces and parallel sessions',
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

export const LISTING_IMAGES_BUCKET = 'listing_images' as const;

/** Public CTA banner copy (agents, channels, blog). */
export const PUBLIC_BANNER_CTA_TEXT = 'Start for $0';

export const CENTERED_DARK_CTA_BANNER_TITLE = 'Start free. Publish with confidence.';
export const CENTERED_DARK_CTA_BANNER_DESCRIPTION =
	'Connect your agent, review every draft, and schedule posts across channels before anything goes live.';

export const ACCENT_SPLIT_CTA_BANNER_TITLE = 'Connect your agent today';

export function accentSplitCtaBannerDescription(agentLabel: string): string {
	return `Install openquok-core on ${agentLabel}, draft from chat, and move every post through your OpenQuok calendar or kanban before it publishes.`;
}

/** Top accent banner on hub detail pages — links to the page setup guide. */
export const PUBLIC_DOCS_BANNER_CTA_TEXT = 'View setup guide';

/** Accent banner CTA when the destination is self-host / getting-started-for-dev docs. */
export const PUBLIC_SELF_HOST_BANNER_CTA_TEXT = 'Self-host OpenQuok for free';

export function accentSplitDocsCtaBannerTitle(label: string): string {
	return `Read the ${label} setup guide`;
}

export function accentSplitDocsCtaBannerDescription(label: string): string {
	return `Step-by-step instructions for connecting OpenQuok to ${label} — install commands, auth patterns, and configuration snippets.`;
}

const PUBLIC_SELF_HOST_DOCS_BANNER = {
	docsPath: publicDocsGettingStartedForDevPath,
	title: PUBLIC_SELF_HOST_BANNER_CTA_TEXT,
	description:
		'Run your own instance on your machine or cloud — the free path when you want full control without a paid workspace.',
	ctaText: PUBLIC_DOCS_BANNER_CTA_TEXT
} as const;

/** Top accent banner on public hub index pages — links to the section overview doc. */
export const PUBLIC_HUB_DOCS_BANNERS = {
	agents: {
		docsPath: '/docs/agent-setup-guides',
		title: 'Browse agent setup guides',
		description:
			'Platform-specific guides for OpenClaw, Hermes, Cursor, Claude Code, and other agent hosts and MCP clients.',
		ctaText: PUBLIC_DOCS_BANNER_CTA_TEXT
	},
	channels: {
		docsPath: '/docs/social-integration',
		title: 'Browse channel setup guides',
		description:
			'OAuth, env vars, and dashboard settings for Threads, Facebook, Instagram, and other social channels.',
		ctaText: PUBLIC_DOCS_BANNER_CTA_TEXT
	},
	buildingBlocks: {
		docsPath: '/docs/publish-listings/publish-your-listing',
		title: 'Publish your own building block',
		description:
			'Share a skill or MCP server on the catalog — sign in, set a username, and submit from your account.',
		ctaText: 'View publish guide'
	},
	playbooks: {
		docsPath: '/docs/publish-listings/publish-your-listing',
		title: 'Publish your own playbook',
		description:
			'Bundle building blocks into a workflow others can install — submit from your account or Skill Builder.',
		ctaText: 'View publish guide'
	},
	creators: {
		docsPath: '/docs/publish-listings/publish-your-listing',
		title: 'Publish your own listing',
		description:
			'Sign in, choose a public username, and submit building blocks or playbooks from your account.',
		ctaText: 'View publish guide'
	},
	compare: PUBLIC_SELF_HOST_DOCS_BANNER,
	alternatives: PUBLIC_SELF_HOST_DOCS_BANNER,
	pricing: PUBLIC_SELF_HOST_DOCS_BANNER,
	tools: PUBLIC_SELF_HOST_DOCS_BANNER,
	landing: {
		docsPath: '/docs/getting-started-for-cli',
		title: 'Get started with the OpenQuok CLI',
		description:
			'Install openquok-core, authenticate, and schedule your first post from any agent workspace.',
		ctaText: PUBLIC_DOCS_BANNER_CTA_TEXT
	},
	skillBuilder: {
		docsPath: '/docs/getting-started-for-cli',
		title: 'Read the OpenQuok CLI guide',
		description:
			'Install commands, auth patterns, and workflow recipes to export from Skill Builder into your agent.',
		ctaText: 'View CLI guide'
	}
} as const;

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

export type NavOptions = 'tab' | 'scroll' | 'menu' | 'channels' | 'agents' | 'playbooks';

/** Anchor id on the desktop Playbooks navbar trigger (landing See All scroll target). */
export const PUBLIC_NAVBAR_PLAYBOOKS_ANCHOR_ID = 'public-navbar-playbooks';

export const OPEN_PUBLIC_PLAYBOOKS_NAV_EVENT = 'open-public-playbooks-nav';

export type PublicPlaybooksNavTab = 'playbook' | 'building-blocks';

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
	{ pathname: publicAgentsPath, title: 'Agents', navType: 'agents' },
	{ pathname: publicChannelsPath, title: 'Channels', navType: 'channels' },
	{ pathname: publicPlaybooksPath, title: 'Playbooks', navType: 'playbooks' },
	{ pathname: publicDocsPath, title: 'Dev Docs', navType: 'tab' },
	{ pathname: publicBlogPath, title: 'Blog', navType: 'tab' },
	{ pathname: '/pricing', title: 'Pricing', navType: 'tab' }
];

export const PUBLIC_NAVBAR_MOBILE_LINKS: Link[] = [...PUBLIC_NAVBAR_LINKS];

export const PUBLIC_FOOTER_LINKS: Record<string, { label: string; href: string }[]> = {
	Tools: [
		{ label: 'All Free tools', href: publicToolsPath },
		{ label: 'Skill Builder', href: publicSkillBuilderPath },
		{ label: 'Photo Editor', href: publicPhotoEditorPath },
	],
	Directories: [
		{ label: 'All Playbooks', href: publicPlaybooksPath },
		{ label: 'All Building Blocks', href: publicBuildingBlocksPath },
		{ label: 'All Creators', href: publicCreatorsPath },
		{ label: 'Playbook Categories', href: publicPlaybooksCategoriesPath },
		{ label: 'Playbook Tags', href: publicPlaybooksTagsPath },
		{ label: 'Building Block Categories', href: publicBuildingBlocksCategoriesPath },
		{ label: 'Building Block Tags', href: publicBuildingBlocksTagsPath },
	],
	Resources: [
		{ label: 'All Agent Integrations', href: publicAgentsPath },
		{ label: 'All Supported Channels', href: publicChannelsPath },
		{ label: 'Alternatives', href: publicAlternativesPath },
		{ label: 'Blog', href: publicBlogPath },
		{ label: 'Blog Topics', href: '/blog/topic' },
		{ label: 'Blog Authors', href: '/blog/author' },
		{ label: 'Compare', href: publicComparePath },
		{ label: 'Developer Docs', href: publicDocsPath },
		{ label: 'Self-hosted', href: publicDocsGettingStartedForDevPath },
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
