import type { IconName } from '$data/icons';

export type FeaturesGridRowConfig = {
	offsetClass: string;
	platformIds: string[];
};

/** Tile config for landing-page social / directory brand marks (hero strip + features grid). */
export type LandingSocialPlatform = {
	id: string;
	icon: IconName;
	label?: string;
	/** `/channels/{slug}` when tiles are linked (defaults from resolve helpers). */
	channelSlug?: string;
	containerClass?: string;
	iconClass?: string;
	iconWidth?: string;
	iconHeight?: string;
};
