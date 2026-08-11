import type { IconName } from '$data/icons';

import { getRootPathPublicBestTimeToPostChannel } from '$lib/area-public/constants/getRootPathPublicTools';
import type { BestTimeChannelHubLinkViewModel } from '$lib/best-time-to-post/best-time-to-post.types';
import { DEFAULT_PLATFORM_SLUG } from '$lib/best-time-to-post/best-time-to-post.types';
import {
	listAvailablePublicChannels,
	type PublicChannelLandingPageViewModel
} from '$lib/content/constants/publicChannelConfig';
import { buildBestTimeToPostChannelMetaTitle } from '$lib/content/utils/buildProgrammaticSeoTitles';
import { route } from '$lib/utils/path';

export type BestTimeChannelPageConfig = {
	/** URL segment under `/tools/best-time-to-post/` — matches `publicChannelConfig.slug`. */
	channelSlug: string;
	platformLabel: string;
	icon: IconName;
	focusedProviderIdentifier: string;
	metaTitle: string;
	metaDescription: string;
	/** Short blurb for hub cards on `/tools/best-time-to-post`. */
	hubDescription: string;
	keywords: readonly string[];
};

export const PUBLIC_BEST_TIME_GENERIC_CONFIG = {
	metaTitle: 'Best Time to Post Calculator',
	metaDescription:
		'Generate benchmark timing test slots for social channels. Pick a platform, audience timezone, content type, and cadence — then run controlled tests in your OpenQuok scheduler.',
	defaultPlatformSlug: DEFAULT_PLATFORM_SLUG,
	keywords: [
		'best time to post',
		'best time to post calculator',
		'social media posting schedule',
		'when to post on social media',
		'timing test plan',
		'posting schedule test'
	] as const
};

const CHANNEL_HUB_DESCRIPTIONS: Record<string, string> = {
	facebook: 'Test midweek afternoon windows for Page posts.',
	threads: 'Probe morning and midday text windows.',
	instagram: 'Test feed, Reel, and carousel benchmark slots.',
	youtube: 'Probe afternoon and evening publish windows.',
	tiktok: 'Test noon and evening short-video windows.',
	linkedin: 'Probe weekday morning and lunch B2B slots.',
	x: 'Test morning and midday conversation windows.'
};

function buildChannelPageConfig(channel: PublicChannelLandingPageViewModel): BestTimeChannelPageConfig {
	return {
		channelSlug: channel.slug,
		platformLabel: channel.platformLabel,
		icon: channel.icon,
		focusedProviderIdentifier: channel.platformId,
		metaTitle: buildBestTimeToPostChannelMetaTitle(channel.platformLabel),
		metaDescription: `Generate ${channel.platformLabel} benchmark timing test slots by timezone, content type, and cadence — then schedule controlled tests in OpenQuok.`,
		hubDescription:
			CHANNEL_HUB_DESCRIPTIONS[channel.slug] ??
			`${channel.platformLabel} benchmark windows for timing tests.`,
		keywords: [
			`best time to post on ${channel.platformLabel}`,
			`${channel.platformLabel} posting schedule`,
			`${channel.platformLabel} best time to post`,
			'timing test plan',
			'social media posting times',
			...channel.keywords.slice(0, 4)
		]
	};
}

const channelConfigs = listAvailablePublicChannels().map(buildChannelPageConfig);
const channelConfigBySlug = new Map(channelConfigs.map((config) => [config.channelSlug, config]));

export function getBestTimeChannelBySlug(slug: string): BestTimeChannelPageConfig | undefined {
	const key = slug.trim().toLowerCase();
	return channelConfigBySlug.get(key);
}

export function listBestTimeChannelsForHub(): BestTimeChannelHubLinkViewModel[] {
	return channelConfigs.map((config) => ({
		slug: config.channelSlug,
		platformLabel: config.platformLabel,
		icon: config.icon,
		href: route(getRootPathPublicBestTimeToPostChannel(config.channelSlug)),
		description: config.hubDescription
	}));
}
