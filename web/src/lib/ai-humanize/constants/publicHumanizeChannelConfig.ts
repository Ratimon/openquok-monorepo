import type { IconName } from '$data/icons';
import type { HumanizeChannelHubLinkViewModel } from '$lib/ai-humanize/Humanize.presenter.svelte';
import type { PublicChannelLandingPageViewModel } from '$lib/content/constants/publicChannelConfig';

import { getRootPathPublicHumanizerChannel } from '$lib/area-public/constants/getRootPathPublicTools';
import { listPublicChannelsForHub } from '$lib/content/constants/publicChannelConfig';
import {
	buildHumanizeChannelMetaDescription,
	buildHumanizeChannelMetaTitle,
	buildHumanizeGenericMetaDescription,
	buildHumanizeGenericMetaTitle
} from '$lib/content/utils/buildProgrammaticSeoTitles';
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
	metaTitle: buildHumanizeGenericMetaTitle(),
	metaDescription: buildHumanizeGenericMetaDescription(),
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
	youtube: 'Rewrite titles and descriptions before you publish.',
	tiktok: 'Clean or roughen captions for short-video posts.',
	linkedin: 'Drop stock phrasing from professional feed posts.',
	x: 'Shorten drafts for a more conversational post.',
	devto: 'Rewrite technical articles so they read less machine-written.'
};

function buildChannelPageConfig(channel: PublicChannelLandingPageViewModel): HumanizeChannelPageConfig {
	return {
		channelSlug: channel.slug,
		platformLabel: channel.platformLabel,
		icon: channel.icon,
		focusedProviderIdentifier: channel.platformId,
		metaTitle: buildHumanizeChannelMetaTitle(channel.platformLabel),
		metaDescription: buildHumanizeChannelMetaDescription(channel.platformLabel),
		hubDescription:
			CHANNEL_HUB_DESCRIPTIONS[channel.slug] ??
			`Rewrite ${channel.platformLabel} drafts so they read less machine-written.`,
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

/** Sample pages follow the full catalog. Rewriting is local and does not need a live scheduler. */
const channelConfigs = listPublicChannelsForHub().map(buildChannelPageConfig);
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
		href: route(getRootPathPublicHumanizerChannel(config.channelSlug)),
		description: config.hubDescription
	}));
}
