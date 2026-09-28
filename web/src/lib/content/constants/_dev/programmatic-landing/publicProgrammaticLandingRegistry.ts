/**
 * Central index of marketing / pSEO landing surfaces under `(public)/`.
 *
 * **Generic section** — shared copy or builders for every slug on that surface
 * (hub WhoIsFor, hub FAQ, tool generic meta, API hub audience cards, …).
 *
 * **Tailored section** — per-channel or per-agent overrides (channel seed VM,
 * `PUBLIC_CHANNEL_AUDIENCE_TAILORED_CARD_BY_SLUG`, agent/MCP seed `overrides`, …).
 *
 * Channel catalog source of truth: `PUBLIC_CHANNEL_LANDING_PAGES` in `channels/catalog/seeds.ts`.
 * Adding a provider starts there; other surfaces derive or opt in via their own registries.
 */

import { listBestTimeChannelsForHub } from '$lib/content/constants/channels/tools/best-time-to-post/general';
import { listHumanizeChannelsForHub } from '$lib/content/constants/channels/tools/humanizer/general';
import { listCanvasChannelsForHub } from '$lib/content/constants/channels/tools/photo-editor/general';
import { PUBLIC_AGENT_HOST_LANDING_PAGES } from '$lib/content/constants/agents/seeds';
import {
	PUBLIC_CHANNEL_AUDIENCE_TAILORED_CARD_BY_SLUG,
	getPublicChannelAudienceTailoredCard,
	resolvePublicChannelAudienceCards
} from '$lib/content/constants/channels/catalog/audience-tailored';
import {
	listAvailablePublicChannels,
	listPublicChannelsForHub
} from '$lib/content/constants/channels/index';
import { MCP_LANDING_SEEDS } from '$lib/content/constants/mcps/seeds';
import {
	PUBLIC_API_POSTING_PLATFORM_SLUGS,
	getPublicApiPostingPlatformBySlug,
	getPublicApiSchedulingPlatformBySlug
} from '$lib/content/constants/channels/api';
import { listSkillBuilderChannelsForHub } from '$lib/content/constants/channels/tools/skill-builder/general';
import { getPayloadWizardChannelBySlug } from '$lib/content/constants/channels/tools/payload-wizard/general';

export {
	PUBLIC_CHANNEL_AUDIENCE_TAILORED_CARD_BY_SLUG,
	getPublicChannelAudienceTailoredCard,
	resolvePublicChannelAudienceCards
} from '$lib/content/constants/channels/catalog/audience-tailored';

export type ProgrammaticConfigRef = {
	/** Repo path to the module that owns generic or tailored copy. */
	modulePath: string;
	/** Named export or constant to open first when editing. */
	symbol: string;
};

export type ProgrammaticLandingSurface = {
	/** Stable id for tests and docs. */
	id: string;
	/** SvelteKit route pattern (under `(public)`). */
	routePattern: string;
	/** Hub path when this surface has a channel grid (null for hub-only). */
	hubPath: string | null;
	/** URL param name for channel slug, if any. */
	channelParam: 'slug' | 'channelSlug' | null;
	/** How slugs are chosen for child pages. */
	scale:
		| 'none'
		| 'channel-catalog'
		| 'api-posting-platforms'
		| 'available-channels'
		| 'agent-host-times-channel'
		| 'mcp-client-times-channel';
	generic: ProgrammaticConfigRef;
	tailored: ProgrammaticConfigRef | null;
	notes?: string;
};

/** Surfaces that scale with `channelSlug` / integration catalog (footer-aligned). */
export const PUBLIC_PROGRAMMATIC_LANDING_SURFACES: readonly ProgrammaticLandingSurface[] = [
	{
		id: 'channels-hub',
		routePattern: '/channels',
		hubPath: '/channels',
		channelParam: null,
		scale: 'none',
		generic: {
			modulePath: 'web/src/lib/content/constants/hubs/channels.ts',
			symbol: 'PUBLIC_CHANNELS_HUB_FAQ'
		},
		tailored: null
	},
	{
		id: 'channel-detail',
		routePattern: '/channels/[slug]',
		hubPath: '/channels',
		channelParam: 'slug',
		scale: 'channel-catalog',
		generic: {
			modulePath: 'web/src/lib/content/constants/channels/types.ts',
			symbol: 'PublicChannelLandingPageViewModel (shared section shapes)'
		},
		tailored: {
			modulePath: 'web/src/lib/content/constants/channels/{slug}.ts',
			symbol: '{slug}Channel export'
		},
		notes:
			'WhoIsFor: 3 cards in channel seed + optional 4th via PUBLIC_CHANNEL_AUDIENCE_TAILORED_CARD_BY_SLUG.'
	},
	{
		id: 'agents-hub',
		routePattern: '/agents',
		hubPath: '/agents',
		channelParam: null,
		scale: 'none',
		generic: {
			modulePath: 'web/src/lib/content/constants/publicAgentsHubFaqConfig.ts',
			symbol: 'PUBLIC_AGENTS_HUB_FAQ'
		},
		tailored: null
	},
	{
		id: 'agent-host',
		routePattern: '/agents/[slug]',
		hubPath: '/agents',
		channelParam: null,
		scale: 'none',
		generic: {
			modulePath: 'web/src/lib/content/constants/agents/{slug}.ts',
			symbol: 'agent host seed'
		},
		tailored: {
			modulePath: 'web/src/lib/content/constants/agents/{slug}.ts',
			symbol: 'overrides (FAQ, audienceCards, features)'
		}
	},
	{
		id: 'mcp-client',
		routePattern: '/agents/[slug]',
		hubPath: '/agents',
		channelParam: null,
		scale: 'none',
		generic: {
			modulePath: 'web/src/lib/content/constants/mcps/{slug}.ts',
			symbol: 'mcp seed + buildMcpLandingVm'
		},
		tailored: {
			modulePath: 'web/src/lib/content/constants/mcps/{slug}.ts',
			symbol: 'overrides'
		}
	},
	{
		id: 'agent-channel',
		routePattern: '/agents/[slug]/[channelSlug]',
		hubPath: '/agents',
		channelParam: 'channelSlug',
		scale: 'agent-host-times-channel',
		generic: {
			modulePath: 'web/src/lib/content/constants/agents/channels/general.ts',
			symbol: 'buildAgentsChannelAudienceSection'
		},
		tailored: {
			modulePath: 'web/src/lib/content/constants/channels/{channelSlug}.ts',
			symbol: 'channel seed + agent channel config'
		}
	},
	{
		id: 'mcp-channel',
		routePattern: '/agents/[slug]/[channelSlug]',
		hubPath: '/agents',
		channelParam: 'channelSlug',
		scale: 'mcp-client-times-channel',
		generic: {
			modulePath: 'web/src/lib/content/utils/buildMcpChannelLandingVm.ts',
			symbol: 'buildMcpChannelLandingVm'
		},
		tailored: {
			modulePath: 'web/src/lib/content/constants/channels/{channelSlug}.ts',
			symbol: 'channel seed'
		}
	},
	{
		id: 'posting-api-hub',
		routePattern: '/social-media-posting-api',
		hubPath: '/social-media-posting-api',
		channelParam: null,
		scale: 'none',
		generic: {
			modulePath: 'web/src/lib/content/constants/channels/api/_shared/publicApiCapabilityAudienceConfig.ts',
			symbol: 'POSTING_HUB_CARDS'
		},
		tailored: null
	},
	{
		id: 'posting-api-platform',
		routePattern: '/social-media-posting-api/[slug]',
		hubPath: '/social-media-posting-api',
		channelParam: 'slug',
		scale: 'api-posting-platforms',
		generic: {
			modulePath: 'web/src/lib/content/constants/channels/api/_shared/publicApiCapabilityAudienceConfig.ts',
			symbol: 'getPublicApiPlatformAudienceSection'
		},
		tailored: {
			modulePath: 'web/src/lib/content/constants/channels/api/posting/platforms/{slug}.ts',
			symbol: 'buildPublicApiPlatformPage params'
		},
		notes: '4th WhoIsFor card when PUBLIC_CHANNEL_AUDIENCE_TAILORED_CARD_BY_SLUG has slug.'
	},
	{
		id: 'scheduling-api-hub',
		routePattern: '/social-media-scheduling-api',
		hubPath: '/social-media-scheduling-api',
		channelParam: null,
		scale: 'none',
		generic: {
			modulePath: 'web/src/lib/content/constants/channels/api/_shared/publicApiCapabilityAudienceConfig.ts',
			symbol: 'SCHEDULING_HUB_CARDS'
		},
		tailored: null
	},
	{
		id: 'scheduling-api-platform',
		routePattern: '/social-media-scheduling-api/[slug]',
		hubPath: '/social-media-scheduling-api',
		channelParam: 'slug',
		scale: 'api-posting-platforms',
		generic: {
			modulePath: 'web/src/lib/content/constants/channels/api/_shared/publicApiCapabilityAudienceConfig.ts',
			symbol: 'getPublicApiPlatformAudienceSection'
		},
		tailored: {
			modulePath: 'web/src/lib/content/constants/channels/api/posting/platforms/{slug}.ts',
			symbol: 'buildPublicApiPlatformPage params'
		}
	},
	{
		id: 'self-hosting',
		routePattern: '/self-hosting',
		hubPath: null,
		channelParam: null,
		scale: 'none',
		generic: {
			modulePath: 'web/src/lib/content/constants/self-hosting/whoIsFor.ts',
			symbol: 'PUBLIC_SELF_HOSTING_WHO_IS_FOR_SECTION'
		},
		tailored: null
	},
	{
		id: 'tools-hub',
		routePattern: '/tools',
		hubPath: '/tools',
		channelParam: null,
		scale: 'none',
		generic: {
			modulePath: 'web/src/lib/content/constants/hubs/tools.ts',
			symbol: 'PUBLIC_TOOLS_HUB_FAQ'
		},
		tailored: null
	},
	{
		id: 'humanizer',
		routePattern: '/tools/humanizer/[channelSlug]',
		hubPath: '/tools/humanizer',
		channelParam: 'channelSlug',
		scale: 'channel-catalog',
		generic: {
			modulePath: 'web/src/lib/content/constants/channels/tools/humanizer/general.ts',
			symbol: 'PUBLIC_HUMANIZE_GENERIC_CONFIG'
		},
		tailored: {
			modulePath: 'web/src/lib/content/constants/channels/tools/humanizer/general.ts',
			symbol: 'CHANNEL_HUB_DESCRIPTIONS + buildChannelPageConfig'
		}
	},
	{
		id: 'photo-editor',
		routePattern: '/tools/photo-editor/[channelSlug]',
		hubPath: '/tools/photo-editor',
		channelParam: 'channelSlug',
		scale: 'channel-catalog',
		generic: {
			modulePath: 'web/src/lib/content/constants/channels/tools/photo-editor/general.ts',
			symbol: 'PUBLIC_CANVAS_GENERIC_CONFIG'
		},
		tailored: {
			modulePath: 'web/src/lib/content/constants/channels/tools/photo-editor/general.ts',
			symbol: 'CHANNEL_HUB_DESCRIPTIONS'
		}
	},
	{
		id: 'skill-builder',
		routePattern: '/tools/skill-builder/[channelSlug]',
		hubPath: '/tools/skill-builder',
		channelParam: 'channelSlug',
		scale: 'available-channels',
		generic: {
			modulePath: 'web/src/lib/content/constants/channels/tools/skill-builder/general.ts',
			symbol: 'PUBLIC_SKILL_BUILDER_GENERIC_CONFIG'
		},
		tailored: {
			modulePath: 'web/src/lib/content/constants/channels/tools/skill-builder/general.ts',
			symbol: 'buildChannelPageConfig recipes'
		}
	},
	{
		id: 'best-time-to-post',
		routePattern: '/tools/best-time-to-post/[channelSlug]',
		hubPath: '/tools/best-time-to-post',
		channelParam: 'channelSlug',
		scale: 'channel-catalog',
		generic: {
			modulePath: 'web/src/lib/content/constants/channels/tools/best-time-to-post/general.ts',
			symbol: 'PUBLIC_BEST_TIME_GENERIC_CONFIG'
		},
		tailored: {
			modulePath: 'web/src/lib/content/constants/channels/tools/best-time-to-post/faq.ts',
			symbol: 'buildBestTimeChannelFaqItems'
		}
	},
	{
		id: 'payload-wizard',
		routePattern: '/tools/payload-wizard/[channelSlug]',
		hubPath: '/tools/payload-wizard',
		channelParam: 'channelSlug',
		scale: 'api-posting-platforms',
		generic: {
			modulePath: 'web/src/lib/content/constants/channels/tools/payload-wizard/general.ts',
			symbol: 'PUBLIC_PAYLOAD_WIZARD_GENERIC_CONFIG'
		},
		tailored: {
			modulePath: 'web/src/lib/content/constants/channels/tools/payload-wizard/general.ts',
			symbol: 'buildChannelPageConfig'
		}
	}
];

export type ProgrammaticPageCounts = {
	channelCatalogSlugs: readonly string[];
	apiPostingPlatformSlugs: readonly string[];
	agentHostSlugs: readonly string[];
	mcpClientSlugs: readonly string[];
	availableChannelSlugs: readonly string[];
	perSurface: Record<string, number>;
	totalProgrammaticMarketingPages: number;
};

function channelCatalogSlugs(): string[] {
	return listPublicChannelsForHub().map((c) => c.slug);
}

function availableChannelSlugs(): string[] {
	return listAvailablePublicChannels().map((c) => c.slug);
}

/** Live counts from registries (use in tests and planning). */
export function getProgrammaticLandingPageCounts(): ProgrammaticPageCounts {
	const catalog = channelCatalogSlugs();
	const api = [...PUBLIC_API_POSTING_PLATFORM_SLUGS];
	const agents = PUBLIC_AGENT_HOST_LANDING_PAGES.map((a) => a.slug);
	const mcps = MCP_LANDING_SEEDS.map((m) => m.slug);
	const available = availableChannelSlugs();

	const perSurface: Record<string, number> = {
		'channels-hub': 1,
		'channel-detail': catalog.length,
		'agents-hub': 1,
		'agent-host': agents.length,
		'mcp-client': mcps.length,
		'agent-channel': agents.length * catalog.length,
		'mcp-channel': mcps.length * catalog.length,
		'posting-api-hub': 1,
		'posting-api-platform': api.length,
		'scheduling-api-hub': 1,
		'scheduling-api-platform': api.length,
		'self-hosting': 1,
		'tools-hub': 1,
		humanizer: listHumanizeChannelsForHub().length + 1,
		'photo-editor': listCanvasChannelsForHub().length + 1,
		'skill-builder': listSkillBuilderChannelsForHub().length + 1,
		'best-time-to-post': listBestTimeChannelsForHub().length + 1,
		'payload-wizard': api.length + 1
	};

	const totalProgrammaticMarketingPages = Object.values(perSurface).reduce((sum, n) => sum + n, 0);

	return {
		channelCatalogSlugs: catalog,
		apiPostingPlatformSlugs: api,
		agentHostSlugs: agents,
		mcpClientSlugs: mcps,
		availableChannelSlugs: available,
		perSurface,
		totalProgrammaticMarketingPages
	};
}

export type NewProviderPageEstimate = {
	slug: string;
	inChannelCatalog: boolean;
	inApiPostingPlatforms: boolean;
	pages: {
		channelLanding: number;
		postingApi: number;
		schedulingApi: number;
		agentHostChannel: number;
		mcpClientChannel: number;
		humanizer: number;
		photoEditor: number;
		skillBuilder: number;
		bestTimeToPost: number;
		payloadWizard: number;
	};
	totalNewRoutes: number;
	notes: string[];
};

/**
 * Benchmark: how many indexable marketing routes appear when you add one integration slug.
 * Does not include docs (`/docs/social-integration/{slug}`) or compare/alternatives/blog.
 */
export function estimateNewProviderMarketingPages(slug: string): NewProviderPageEstimate {
	const key = slug.trim().toLowerCase();
	const inCatalog = channelCatalogSlugs().includes(key);
	const inApi = (PUBLIC_API_POSTING_PLATFORM_SLUGS as readonly string[]).includes(key);
	const agentHosts = PUBLIC_AGENT_HOST_LANDING_PAGES.length;
	const mcpClients = MCP_LANDING_SEEDS.length;
	const available = availableChannelSlugs().includes(key);

	const pages = {
		channelLanding: inCatalog ? 1 : 0,
		postingApi: inApi && getPublicApiPostingPlatformBySlug(key) ? 1 : 0,
		schedulingApi: inApi && getPublicApiSchedulingPlatformBySlug(key) ? 1 : 0,
		agentHostChannel: inCatalog ? agentHosts : 0,
		mcpClientChannel: inCatalog ? mcpClients : 0,
		humanizer: inCatalog ? 1 : 0,
		photoEditor: inCatalog ? 1 : 0,
		skillBuilder: available ? 1 : 0,
		bestTimeToPost: inCatalog ? 1 : 0,
		payloadWizard: inApi && getPayloadWizardChannelBySlug(key) ? 1 : 0
	};

	const notes: string[] = [];
	if (!inCatalog) {
		notes.push('Add `channels/catalog/{slug}.ts` and register in `channels/catalog/seeds.ts` first.');
	}
	if (inCatalog && !inApi) {
		notes.push('Dev.to-shaped providers skip posting/scheduling API + payload wizard until added to PUBLIC_API_POSTING_PLATFORM_SLUGS.');
	}
	notes.push('Add `web/src/content/docs/social-integration/{slug}.md` separately (footer self-host column).');
	notes.push('Optional 4th WhoIsFor: PUBLIC_CHANNEL_AUDIENCE_TAILORED_CARD_BY_SLUG in publicChannelAudienceTailoredCards.ts.');

	const totalNewRoutes = Object.values(pages).reduce((sum, n) => sum + n, 0);

	return {
		slug: key,
		inChannelCatalog: inCatalog,
		inApiPostingPlatforms: inApi,
		pages,
		totalNewRoutes,
		notes
	};
}
