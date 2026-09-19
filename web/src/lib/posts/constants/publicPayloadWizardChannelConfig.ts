import type { IconName } from '$data/icons';
import type { PublicApiFormatExample } from '$lib/content/constants/apis/types';

import {
	getPublicApiPostingPlatformBySlug,
	getPublicApiProviderIdentifier,
	PUBLIC_API_POSTING_PLATFORM_SLUGS
} from '$lib/content/constants/apis/index';
import { PUBLIC_API_FORMAT_EXAMPLES_BY_PLATFORM } from '$lib/content/constants/apis/formatExamples';
import { getRootPathPublicPayloadWizardChannel } from '$lib/area-public/constants/getRootPathPublicTools';
import {
	buildPayloadWizardChannelHeroTitle,
	buildPayloadWizardChannelMetaDescription,
	buildPayloadWizardChannelMetaTitle,
	buildPayloadWizardGenericHeroTitle,
	buildPayloadWizardGenericMetaDescription,
	buildPayloadWizardGenericMetaTitle
} from '$lib/content/utils/buildProgrammaticSeoTitles';
import { route } from '$lib/utils/path';

export type PayloadWizardChannelHubLinkViewModel = {
	slug: string;
	platformLabel: string;
	icon: IconName;
	href: string;
	description: string;
};

export type PayloadWizardChannelPageConfig = {
	/** URL segment under `/tools/payload-wizard/` — matches API marketing platform slug. */
	channelSlug: string;
	platformLabel: string;
	icon: IconName;
	focusedProviderIdentifier: string;
	metaTitle: string;
	heroTitle: string;
	metaDescription: string;
	hubDescription: string;
	keywords: readonly string[];
	formatExamples: readonly PublicApiFormatExample[];
};

export type PayloadWizardToolPageViewModel = {
	metaTitle: string;
	heroTitle: string;
	metaDescription: string;
	channelSlug: string | null;
	channelLabel: string | null;
	focusedProviderIdentifier: string | null;
	composerMode: 'global' | 'custom';
	formatExamples: readonly PublicApiFormatExample[];
};

export const PUBLIC_PAYLOAD_WIZARD_GENERIC_CONFIG = {
	metaTitle: buildPayloadWizardGenericMetaTitle(),
	heroTitle: buildPayloadWizardGenericHeroTitle(),
	metaDescription: buildPayloadWizardGenericMetaDescription(),
	keywords: [
		'API payload wizard',
		'POST /public/posts JSON',
		'public API payload builder',
		'social media API payload',
		'copy JSON payload',
		'OpenQuok payload wizard',
		'free API payload validator',
		'programmatic post payload'
	] as const
};

const CHANNEL_HUB_DESCRIPTIONS: Record<string, string> = {
	tiktok: 'Preview TikTok video and carousel payloads with provider settings.',
	x: 'Shape X posts, follow-ups, and cross-account plug fields.',
	instagram: 'Build feed, Reel, Story, and carousel request bodies.',
	youtube: 'Draft title, privacy, tags, and thumbnail settings.',
	facebook: 'Compose Page feed, Reel, and link-preview payloads.',
	threads: 'Model thread replies and cross-account comment plugs.',
	linkedin: 'Preview text posts, video uploads, and document carousels.'
};

function buildChannelPageConfig(slug: (typeof PUBLIC_API_POSTING_PLATFORM_SLUGS)[number]): PayloadWizardChannelPageConfig {
	const platform = getPublicApiPostingPlatformBySlug(slug);
	if (!platform) {
		throw new Error(`Missing public API posting platform config for slug: ${slug}`);
	}

	return {
		channelSlug: slug,
		platformLabel: platform.platformLabel,
		icon: platform.icon,
		focusedProviderIdentifier: getPublicApiProviderIdentifier(slug),
		metaTitle: buildPayloadWizardChannelMetaTitle(platform.platformLabel),
		heroTitle: buildPayloadWizardChannelHeroTitle(platform.platformLabel),
		metaDescription: buildPayloadWizardChannelMetaDescription(platform.platformLabel),
		hubDescription:
			CHANNEL_HUB_DESCRIPTIONS[slug] ??
			`Preview ${platform.platformLabel} POST /public/posts payloads with sample channels.`,
		keywords: [
			`${platform.platformLabel} API payload`,
			`${platform.platformLabel} POST /public/posts`,
			`copy ${platform.platformLabel} JSON payload`,
			'public API payload wizard',
			'OpenQuok payload wizard',
			...platform.keywords.slice(0, 3)
		],
		formatExamples: PUBLIC_API_FORMAT_EXAMPLES_BY_PLATFORM[slug].posting
	};
}

const channelConfigs = PUBLIC_API_POSTING_PLATFORM_SLUGS.map(buildChannelPageConfig);
const channelConfigBySlug = new Map(channelConfigs.map((config) => [config.channelSlug, config]));

export function getPayloadWizardChannelBySlug(slug: string): PayloadWizardChannelPageConfig | undefined {
	const key = slug.trim().toLowerCase();
	return channelConfigBySlug.get(key);
}

export function listPayloadWizardChannelsForHub(): PayloadWizardChannelHubLinkViewModel[] {
	return channelConfigs.map((config) => ({
		slug: config.channelSlug,
		platformLabel: config.platformLabel,
		icon: config.icon,
		href: route(getRootPathPublicPayloadWizardChannel(config.channelSlug)),
		description: config.hubDescription
	}));
}
