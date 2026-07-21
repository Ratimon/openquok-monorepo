import type { IconName } from '$data/icons';

import { getRootPathPublicPhotoEditorChannel } from '$lib/area-public/constants/getRootPathPublicTools';
import {
	listAvailablePublicChannels,
	type PublicChannelLandingPageViewModel
} from '$lib/content/constants/publicChannelConfig';
import type { CanvasChannelHubLinkViewModel } from '$lib/canvas/canvas.types';
import {
	aspectPlatformGroupIdForProviderIdentifier,
	DEFAULT_ASPECT_RATIO_ID,
	defaultAspectRatioIdForComposer
} from '$lib/ui/canvas-editor/utils/aspectRatioPresets';
import { route } from '$lib/utils/path';
import { buildPhotoEditorChannelMetaTitle } from '$lib/content/utils/buildProgrammaticSeoTitles';

export type CanvasChannelPageConfig = {
	/** URL segment under `/tools/photo-editor/` — matches `publicChannelConfig.slug`. */
	channelSlug: string;
	platformLabel: string;
	icon: IconName;
	focusedProviderIdentifier: string;
	defaultAspectRatioId: string;
	aspectPlatformGroupId: string;
	metaTitle: string;
	metaDescription: string;
	/** Short blurb for hub cards on `/tools/photo-editor`. */
	hubDescription: string;
	keywords: readonly string[];
};

export const PUBLIC_CANVAS_GENERIC_CONFIG = {
	metaTitle: 'Social Media Photo Editor',
	metaDescription:
		'Free design editor in your browser. Resize images for social channels, add text and elements, and download PNG — or save to your cloud when signed in.',
	defaultAspectRatioId: DEFAULT_ASPECT_RATIO_ID,
	aspectPlatformGroupId: 'general',
	keywords: [
		'photo editor',
		'design editor',
		'canvas editor',
		'free image editor',
		'social media image sizes',
		'resize image for Instagram',
		'download PNG'
	] as const
};

const CHANNEL_HUB_DESCRIPTIONS: Record<string, string> = {
	facebook: 'Feed, Reel, and story canvas sizes.',
	threads: 'Post and portrait image sizes.',
	instagram: 'Feed, Story, Reel, and carousel sizes.',
	youtube: 'Thumbnails and Shorts canvas sizes.',
	tiktok: 'Vertical video and cover image sizes.',
	linkedin: 'Feed and link preview image sizes.',
	x: 'Post and header image sizes.'
};

function buildChannelPageConfig(channel: PublicChannelLandingPageViewModel): CanvasChannelPageConfig {
	const focusedProviderIdentifier = channel.platformId;
	const aspectPlatformGroupId = aspectPlatformGroupIdForProviderIdentifier(focusedProviderIdentifier);
	const defaultAspectRatioId = defaultAspectRatioIdForComposer('custom', focusedProviderIdentifier);

	return {
		channelSlug: channel.slug,
		platformLabel: channel.platformLabel,
		icon: channel.icon,
		focusedProviderIdentifier,
		defaultAspectRatioId,
		aspectPlatformGroupId,
		metaTitle: buildPhotoEditorChannelMetaTitle(channel.platformLabel),
		metaDescription: `Design and resize visuals for ${channel.platformLabel} — feed posts, stories, and channel formats. Edit in the browser, download PNG, or save to your cloud when signed in.`,
		hubDescription:
			CHANNEL_HUB_DESCRIPTIONS[channel.slug] ??
			`${channel.platformLabel} canvas sizes and formats.`,
		keywords: [
			`${channel.platformLabel} photo editor`,
			`${channel.platformLabel} image sizes`,
			`${channel.platformLabel} design templates`,
			'social media image editor',
			'canvas editor',
			'free photo editor',
			...channel.keywords.slice(0, 4)
		]
	};
}

const channelConfigs = listAvailablePublicChannels().map(buildChannelPageConfig);
const channelConfigBySlug = new Map(channelConfigs.map((config) => [config.channelSlug, config]));

export function getCanvasChannelBySlug(slug: string): CanvasChannelPageConfig | undefined {
	const key = slug.trim().toLowerCase();
	return channelConfigBySlug.get(key);
}

export function listCanvasChannelsForHub(): CanvasChannelHubLinkViewModel[] {
	return channelConfigs.map((config) => ({
		slug: config.channelSlug,
		platformLabel: config.platformLabel,
		icon: config.icon,
		href: route(getRootPathPublicPhotoEditorChannel(config.channelSlug)),
		description: config.hubDescription
	}));
}
