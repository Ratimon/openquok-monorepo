import type { IconName } from '$data/icons';
import type { HumanizeChannelHubLinkViewModel } from '$lib/ai-humanize/Humanize.presenter.svelte';
import type { PublicChannelLandingPageViewModel } from '$lib/content/constants/publicChannelConfig';

import { getRootPathPublicHumanizeChannel } from '$lib/area-public/constants/getRootPathPublicTools';
import { listAvailablePublicChannels } from '$lib/content/constants/publicChannelConfig';
import { buildHumanizeChannelMetaTitle } from '$lib/content/utils/buildProgrammaticSeoTitles';
import { route } from '$lib/utils/path';

export type HumanizeChannelPageConfig = {
	/** URL segment under `/tools/humanizer/` — matches `publicChannelConfig.slug`. */
	channelSlug: string;
	platformLabel: string;
	icon: IconName;
	focusedProviderIdentifier: string;
	metaTitle: string;
	metaDescription: string;
	/** Short blurb for hub cards on `/tools/humanizer`. */
	hubDescription: string;
	keywords: readonly string[];
};

export const PUBLIC_HUMANIZE_GENERIC_CONFIG = {
	metaTitle: 'Humanizer Social Posts',
	metaDescription:
		'Rewrite a social post so it reads less machine-written. Human and Roughen modes run on-device in Chrome. Copy stays free; scheduling needs an account.',
	keywords: [
		'humanize social posts',
		'sound more human',
		'rewrite social media post',
		'less machine-written',
		'free post rewriter',
		'on-device rewriter'
	] as const
};

const CHANNEL_HUB_DESCRIPTIONS: Record<string, string> = {
	facebook: 'Clean Page drafts so they read less machine-written.',
	threads: 'Tighten text posts for a more spoken Threads voice.',
	instagram: 'Rewrite captions for feed, Reel, and Story posts.',
	youtube: 'Humanize titles and descriptions before you publish.',
	tiktok: 'Clean or roughen captions for short-video posts.',
	linkedin: 'Drop stock phrasing from professional feed posts.',
	x: 'Shorten drafts for a more conversational post.'
};

function buildChannelPageConfig(channel: PublicChannelLandingPageViewModel): HumanizeChannelPageConfig {
	return {
		channelSlug: channel.slug,
		platformLabel: channel.platformLabel,
		icon: channel.icon,
		focusedProviderIdentifier: channel.platformId,
		metaTitle: buildHumanizeChannelMetaTitle(channel.platformLabel),
		metaDescription: `Rewrite a ${channel.platformLabel} draft so it reads less machine-written. Human and Roughen run on-device in Chrome. Copy stays free; scheduling needs an account. No classifier guarantees.`,
		hubDescription:
			CHANNEL_HUB_DESCRIPTIONS[channel.slug] ??
			`Humanize ${channel.platformLabel} drafts so they read less machine-written.`,
		keywords: [
			`humanize ${channel.platformLabel} posts`,
			`${channel.platformLabel} sound more human`,
			`rewrite ${channel.platformLabel} post`,
			'less machine-written',
			'on-device rewriter',
			...channel.keywords.slice(0, 4)
		]
	};
}

const channelConfigs = listAvailablePublicChannels().map(buildChannelPageConfig);
const channelConfigBySlug = new Map(channelConfigs.map((config) => [config.channelSlug, config]));

export function getHumanizeChannelBySlug(slug: string): HumanizeChannelPageConfig | undefined {
	const key = slug.trim().toLowerCase();
	return channelConfigBySlug.get(key);
}

export function listHumanizeChannelsForHub(): HumanizeChannelHubLinkViewModel[] {
	return channelConfigs.map((config) => ({
		slug: config.channelSlug,
		platformLabel: config.platformLabel,
		icon: config.icon,
		href: route(getRootPathPublicHumanizeChannel(config.channelSlug)),
		description: config.hubDescription
	}));
}
