import type { IconName } from '$data/icons';

import { getRootPathPublicPhotoEditorChannel } from '$lib/area-public/constants/getRootPathPublicTools';
import {
	listAvailablePublicChannels,
	type PublicChannelLandingPageViewModel
} from '$lib/content/constants/publicChannelConfig';
import type { PhotoEditorChannelHubLinkViewModel } from '$lib/photo-editor/photoEditor.types';
import {
	aspectPlatformGroupIdForProviderIdentifier,
	DEFAULT_ASPECT_RATIO_ID,
	defaultAspectRatioIdForComposer
} from '$lib/ui/canvas-editor/utils/aspectRatioPresets';
import { route } from '$lib/utils/path';

export type PhotoEditorChannelPageConfig = {
	/** URL segment under `/tools/photo-editor/` — matches `publicChannelConfig.slug`. */
	channelSlug: string;
	platformLabel: string;
	icon: IconName;
	focusedProviderIdentifier: string;
	defaultAspectRatioId: string;
	aspectPlatformGroupId: string;
	metaTitle: string;
	metaDescription: string;
	keywords: readonly string[];
};

export const PUBLIC_PHOTO_EDITOR_GENERIC_CONFIG = {
	metaTitle: 'Photo Editor',
	metaDescription:
		'Free design and canvas editor in your browser. Resize images for social channels, add text and elements, and download PNG — or save to your cloud when signed in.',
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

function buildChannelPageConfig(channel: PublicChannelLandingPageViewModel): PhotoEditorChannelPageConfig {
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
		metaTitle: `${channel.platformLabel} Photo Editor`,
		metaDescription: `Design and resize visuals for ${channel.platformLabel} — feed posts, stories, and channel formats. Edit in the browser, download PNG, or save to your cloud when signed in.`,
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

export function getPhotoEditorChannelBySlug(slug: string): PhotoEditorChannelPageConfig | undefined {
	const key = slug.trim().toLowerCase();
	return channelConfigBySlug.get(key);
}

export function listPhotoEditorChannelsForHub(): PhotoEditorChannelHubLinkViewModel[] {
	return channelConfigs.map((config) => ({
		slug: config.channelSlug,
		platformLabel: config.platformLabel,
		icon: config.icon,
		href: route(getRootPathPublicPhotoEditorChannel(config.channelSlug)),
		description: config.metaDescription
	}));
}
