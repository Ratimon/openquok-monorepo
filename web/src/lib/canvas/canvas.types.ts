import type { IconName } from '$data/icons';

export type CanvasChannelHubLinkViewModel = {
	slug: string;
	platformLabel: string;
	icon: IconName;
	href: string;
	description: string;
};

export interface CanvasToolPageViewModel {
	metaTitle: string;
	metaDescription: string;
	/** Set on `/tools/photo-editor/{channelSlug}` programmatic SEO routes. */
	channelSlug: string | null;
	channelLabel: string | null;
	/** Integration catalog identifier for platform-focused aspect presets (`custom` composer mode). */
	focusedProviderIdentifier: string | null;
	defaultAspectRatioId: string;
	aspectPlatformGroupId: string;
	composerMode: 'global' | 'custom';
}
