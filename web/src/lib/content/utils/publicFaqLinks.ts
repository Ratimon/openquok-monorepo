import { getRootPathPublicAgent, getRootPathPublicAgentChannel, getRootPathPublicAgents } from '$lib/area-public/constants/getRootPathPublicAgents';
import { getRootPathPublicAlternatives } from '$lib/area-public/constants/getRootPathPublicAlternatives';
import { getRootPathPublicBlogPost } from '$lib/area-public/constants/getRootPathPublicBlog';
import { getRootPathPublicBuildingBlocks, getRootPathPublicBuildingBlocksTag } from '$lib/area-public/constants/getRootPathPublicBuildingBlocks';
import { getRootPathPublicChannel, getRootPathPublicChannels } from '$lib/area-public/constants/getRootPathPublicChannels';
import { getRootPathPublicCompare, getRootPathPublicComparePair } from '$lib/area-public/constants/getRootPathPublicCompare';
import {
	getRootPathPublicDocs,
	getRootPathPublicDocsInstallationDockerCompose
} from '$lib/area-public/constants/getRootPathPublicDocs';
import { getRootPathPublicPlaybooks, getRootPathPublicPlaybooksTag } from '$lib/area-public/constants/getRootPathPublicPlaybooks';
import {
	getRootPathPublicBestTimeToPost,
	getRootPathPublicBestTimeToPostChannel,
	getRootPathPublicHumanizer,
	getRootPathPublicHumanizerChannel,
	getRootPathPublicPhotoEditor,
	getRootPathPublicPhotoEditorChannel,
	getRootPathPublicSkillBuilder,
	getRootPathPublicSkillBuilderChannel,
	getRootPathPublicTools
} from '$lib/area-public/constants/getRootPathPublicTools';
import { route } from '$lib/utils/path';

/** First-party GitHub repo (followable). Keep in sync with `docsSite.social.github`. */
export const OPENQUOK_GITHUB_REPO_HREF = 'https://github.com/Ratimon/openquok-monorepo';

/** Root-relative FAQ anchor (no `rel="nofollow"` on first-party links). */
export function faqLink(href: string, label: string): string {
	return `<a href="${href}">${label}</a>`;
}

/** Docs page under `/docs/{slug…}` (slug without leading slash). */
export function faqHrefDocs(docsSlug: string): string {
	return route(`${getRootPathPublicDocs()}/${docsSlug}`);
}

/** Public blog post: `/blog/{slug}`. */
export function faqHrefBlogPost(slug: string): string {
	return route(getRootPathPublicBlogPost(slug));
}

/** Agent host or MCP client landing: `/agents/{slug}`. */
export function faqHrefAgent(agentSlug: string): string {
	return route(getRootPathPublicAgent(agentSlug));
}

/** Head-to-head compare page: `/compare/{productA}/{productB}`. */
export function faqHrefComparePair(productA: string, productB: string): string {
	return route(getRootPathPublicComparePair(productA, productB));
}

/** Self-host operator setup doc — anchor label must include “self-host”. */
export function faqLinkSelfHostChannelSetup(docsPath: string, platformLabel: string): string {
	return faqLink(route(docsPath), `self-host ${platformLabel} setup guide`);
}

/** Shared first-party destinations for landing, pricing, and pSEO FAQ answers. */
export const publicFaqHref = {
	signUp: route('sign-up'),
	connectChannelsGuide: faqHrefDocs('channels/connect'),
	pricing: route('pricing'),
	channels: route(getRootPathPublicChannels()),
	agents: route(getRootPathPublicAgents()),
	tools: route(getRootPathPublicTools()),
	compare: route(getRootPathPublicCompare()),
	compareOpenquokBuffer: faqHrefComparePair('openquok', 'buffer'),
	alternatives: route(getRootPathPublicAlternatives()),
	playbooks: route(getRootPathPublicPlaybooks()),
	buildingBlocks: route(getRootPathPublicBuildingBlocks()),
	dockerCompose: route(getRootPathPublicDocsInstallationDockerCompose()),
	cliGettingStarted: faqHrefDocs('getting-started-for-cli'),
	cliManagingPosts: faqHrefDocs('cli-usages/managing-posts'),
	cliAnalytics: faqHrefDocs('cli-usages/analytics'),
	agentSetupGuides: faqHrefDocs('agent-setup-guides'),
	grokBotAgentGuide: faqHrefDocs('agent-setup-guides/grok-bot'),
	thinkrailAgentGuide: faqHrefDocs('agent-setup-guides/thinkrail'),
	mcpSetupGuides: faqHrefDocs('mcp-setup-guides'),
	mcpGettingStarted: faqHrefDocs('getting-started-for-mcp'),
	publicApi: faqHrefDocs('getting-started-for-public-api'),
	oauthApps: faqHrefDocs('oauth2-for-apps'),
	socialIntegration: faqHrefDocs('social-integration'),
	channelGroups: faqHrefDocs('apis-integrations/groups'),
	cliThreads: faqHrefDocs('cli-examples/threads'),
	cliX: faqHrefDocs('cli-examples/x'),
	cliDevto: faqHrefDocs('cli-examples/devto'),
	humanizerTool: route(getRootPathPublicHumanizer()),
	skillBuilderTool: route(getRootPathPublicSkillBuilder()),
	photoEditorTool: route(getRootPathPublicPhotoEditor()),
	bestTimeToPostTool: route(getRootPathPublicBestTimeToPost()),
	publishListingGuide: faqHrefDocs('publish-listings/publish-your-listing'),
	listingTypesGuide: faqHrefDocs('publish-listings/listing-types'),
	grokBotLanding: faqHrefAgent('grok-bot'),
	thinkrailLanding: faqHrefAgent('thinkrail'),
	cursorLanding: faqHrefAgent('cursor'),
	cursorMcpGuide: faqHrefDocs('mcp-setup-guides/cursor'),
	blogBufferAlternatives: faqHrefBlogPost(
		'best-buffer-alternatives-for-teams-that-approve-ai-content-before-posting'
	),
	blogSelfHost: faqHrefBlogPost(
		'how-to-self-host-openquok-with-cli-device-login-free-no-api-keys-on-your-agent'
	),
	blogGrokBot: faqHrefBlogPost('schedule-social-posts-from-grok-bot-with-openquok'),
	blogThinkrail: faqHrefBlogPost('schedule-social-posts-from-thinkrail-with-openquok'),
	blogHumanizerRewrite: faqHrefBlogPost(
		'how-openquok-humanizer-rewrites-a-draft-in-the-browser'
	)
} as const;

export type ChannelFaqLinks = {
	docs: string;
	channelLanding: string;
	playbooksTag: string;
	buildingBlocksTag: string;
};

/** Channel-tailored FAQ destinations (channel landings, tag hubs, setup docs). */
export function buildChannelFaqLinks(slug: string, docsPath: string): ChannelFaqLinks {
	const trimmedSlug = slug.trim();
	return {
		docs: route(docsPath),
		channelLanding: route(getRootPathPublicChannel(trimmedSlug)),
		playbooksTag: route(getRootPathPublicPlaybooksTag(trimmedSlug)),
		buildingBlocksTag: route(getRootPathPublicBuildingBlocksTag(trimmedSlug))
	};
}

export type AgentFaqLinks = {
	agentLanding: string;
	agentChannel: (channelSlug: string) => string;
	docs: string;
};

/** Agent×channel FAQ destinations (host landing, per-channel route, setup docs). */
export function buildAgentFaqLinks(agentSlug: string, docsPath: string): AgentFaqLinks {
	const trimmedAgentSlug = agentSlug.trim();
	return {
		agentLanding: route(getRootPathPublicAgent(trimmedAgentSlug)),
		agentChannel: (channelSlug: string) =>
			route(getRootPathPublicAgentChannel(trimmedAgentSlug, channelSlug)),
		docs: route(docsPath)
	};
}

export type ToolChannelFaqLinks = {
	toolLanding: string;
	toolChannel: string;
};

const TOOL_CHANNEL_PATH_BUILDERS: Record<
	string,
	{ landing: () => string; channel: (channelSlug: string) => string }
> = {
	humanizer: {
		landing: getRootPathPublicHumanizer,
		channel: getRootPathPublicHumanizerChannel
	},
	'skill-builder': {
		landing: getRootPathPublicSkillBuilder,
		channel: getRootPathPublicSkillBuilderChannel
	},
	'photo-editor': {
		landing: getRootPathPublicPhotoEditor,
		channel: getRootPathPublicPhotoEditorChannel
	},
	'best-time-to-post': {
		landing: getRootPathPublicBestTimeToPost,
		channel: getRootPathPublicBestTimeToPostChannel
	}
};

/** Tool×channel FAQ destinations (`/tools/{tool}` and `/tools/{tool}/{channelSlug}`). */
export function buildToolChannelFaqLinks(toolSlug: string, channelSlug: string): ToolChannelFaqLinks {
	const paths = TOOL_CHANNEL_PATH_BUILDERS[toolSlug.trim()];
	if (!paths) {
		throw new Error(`Unknown tool slug for FAQ links: ${toolSlug}`);
	}
	return {
		toolLanding: route(paths.landing()),
		toolChannel: route(paths.channel(channelSlug))
	};
}
