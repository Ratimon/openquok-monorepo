import type { IconName } from '$data/icons';

import type { PublicChannelFeatureBentoId } from '$lib/content/constants/publicChannelFeatureBentoConfig';
import {
	listAvailablePublicChannels,
	type PublicChannelLandingPageViewModel
} from '$lib/content/constants/publicChannelConfig';
import type { OpenquokCliCommandReferenceItem } from '$lib/content/constants/openquokCliCommandReference';
import {
	buildAgentChannelAnalyticsCliCommands,
	buildAgentChannelCliCommandReference,
	buildAgentChannelKanbanCliCommands
} from '$lib/content/utils/buildAgentChannelCliCommandReference';
import { getRootPathPublicAgentChannel } from '$lib/area-public/constants/getRootPathPublicAgents';
import { route } from '$lib/utils/path';

const CHANNEL_PROVIDER_IDENTIFIERS: Record<string, readonly string[]> = {
	facebook: ['facebook'],
	threads: ['threads'],
	instagram: ['instagram-business', 'instagram-standalone', 'instagram'],
	youtube: ['youtube'],
	tiktok: ['tiktok'],
	linkedin: ['linkedin', 'linkedin-page'],
	x: ['x']
};

const KANBAN_BENTO_BY_CHANNEL: Record<string, PublicChannelFeatureBentoId> = {
	facebook: 'facebook-bulk-scheduling',
	threads: 'threads-bulk-scheduling',
	instagram: 'instagram-bulk-scheduling',
	youtube: 'youtube-bulk-scheduling',
	tiktok: 'tiktok-bulk-scheduling',
	linkedin: 'linkedin-bulk-scheduling',
	x: 'x-bulk-scheduling'
};

const ANALYTICS_BENTO_BY_CHANNEL: Record<string, PublicChannelFeatureBentoId> = {
	facebook: 'facebook-insights',
	threads: 'threads-insights',
	instagram: 'instagram-insights',
	youtube: 'youtube-insights',
	tiktok: 'tiktok-insights',
	linkedin: 'linkedin-insights',
	x: 'x-insights'
};

/** Agent host slugs that support `/agents/{agentSlug}/{channelSlug}` SEO pages. */
export const PUBLIC_AGENT_CHANNEL_HOST_SLUGS = ['openclaw', 'hermes'] as const;

export type PublicAgentChannelHostSlug = (typeof PUBLIC_AGENT_CHANNEL_HOST_SLUGS)[number];

export type PublicAgentChannelPageConfig = {
	/** URL segment under `/agents/{agentSlug}/` — matches `publicChannelConfig.slug`. */
	channelSlug: string;
	platformLabel: string;
	icon: IconName;
	/** Listing tag slug for playbooks and building blocks preview filters. */
	listingTagSlug: string;
	providerIdentifiers: readonly string[];
	kanbanBentoId: PublicChannelFeatureBentoId;
	analyticsBentoId: PublicChannelFeatureBentoId;
	metaTitle: string;
	metaDescription: string;
	keywords: readonly string[];
	cliExamplesPath: string;
	commands: readonly OpenquokCliCommandReferenceItem[];
	kanbanCliCommands: string;
	analyticsCliCommands: string;
	kanbanMcpPrompts: string;
	analyticsMcpPrompts: string;
};

export type PublicAgentChannelHubLinkViewModel = {
	slug: string;
	platformLabel: string;
	icon: IconName;
	href: string;
	description: string;
};

function buildChannelPageConfig(channel: PublicChannelLandingPageViewModel): PublicAgentChannelPageConfig {
	const providerIdentifiers =
		CHANNEL_PROVIDER_IDENTIFIERS[channel.slug] ?? [channel.platformId || channel.slug];

	return {
		channelSlug: channel.slug,
		platformLabel: channel.platformLabel,
		icon: channel.icon,
		listingTagSlug: channel.slug,
		providerIdentifiers,
		kanbanBentoId: KANBAN_BENTO_BY_CHANNEL[channel.slug] ?? 'facebook-bulk-scheduling',
		analyticsBentoId: ANALYTICS_BENTO_BY_CHANNEL[channel.slug] ?? 'facebook-insights',
		metaTitle: `${channel.platformLabel} scheduling with OpenClaw`,
		metaDescription: `Message OpenClaw to draft and schedule ${channel.platformLabel} posts from Telegram, WhatsApp, or Slack. Install openquok-core, queue drafts, and approve every publish on the calendar or kanban.`,
		keywords: [
			`OpenClaw ${channel.platformLabel}`,
			`OpenClaw ${channel.platformLabel} scheduler`,
			`schedule ${channel.platformLabel} from OpenClaw`,
			'openquok-core skill',
			'agent social media',
			...channel.keywords.slice(0, 4)
		],
		cliExamplesPath: `/docs/cli-examples/${channel.slug}`,
		commands: buildAgentChannelCliCommandReference(channel.slug),
		kanbanCliCommands: buildAgentChannelKanbanCliCommands(channel.slug, channel.platformLabel),
		analyticsCliCommands: buildAgentChannelAnalyticsCliCommands(
			channel.platformLabel,
			providerIdentifiers
		),
		kanbanMcpPrompts: `Schedule a ${channel.platformLabel} post for tomorrow at 9am — move to review with a note to check the CTA before it goes live`,
		analyticsMcpPrompts: `What performed best on my ${channel.platformLabel} account over the last 30 days?
Break down likes, comments, and shares for post <id>`
	};
}

const channelConfigs = listAvailablePublicChannels().map(buildChannelPageConfig);
const channelConfigBySlug = new Map(channelConfigs.map((config) => [config.channelSlug, config]));

export function getPublicAgentChannelBySlug(slug: string): PublicAgentChannelPageConfig | undefined {
	const key = slug.trim().toLowerCase();
	return channelConfigBySlug.get(key);
}

export function isPublicAgentChannelHostSlug(slug: string): slug is PublicAgentChannelHostSlug {
	return (PUBLIC_AGENT_CHANNEL_HOST_SLUGS as readonly string[]).includes(slug.trim().toLowerCase());
}

export function listPublicAgentChannelsForHub(
	agentSlug: string
): PublicAgentChannelHubLinkViewModel[] {
	const normalizedSlug = agentSlug.trim().toLowerCase();
	if (!normalizedSlug) return [];

	return channelConfigs.map((config) => ({
		slug: config.channelSlug,
		platformLabel: config.platformLabel,
		icon: config.icon,
		href: route(getRootPathPublicAgentChannel(normalizedSlug, config.channelSlug)),
		description: config.metaDescription
	}));
}
