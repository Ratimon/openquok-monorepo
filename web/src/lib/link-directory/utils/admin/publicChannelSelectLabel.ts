import type { PublicChannelLandingPageViewModel } from '$lib/content/constants/channels';

export type PublicChannelSelectLabelContext = {
	/** When set from link-directory opportunity CTA (`connect_channel` vs `schedule_post`). */
	ctaKind?: string;
};

/**
 * Label for link-directory secret-admin channel dropdowns.
 * Uses {@link PublicChannelLandingPageViewModel.schedulePostSelectLabel} for **schedule_post** when set;
 * otherwise the first comma-separated phrase from `heroTitle`, else `platformLabel`.
 */
export function publicChannelSelectLabel(
	channel: PublicChannelLandingPageViewModel,
	context?: PublicChannelSelectLabelContext
): string {
	if (context?.ctaKind === 'schedule_post' && channel.schedulePostSelectLabel?.trim()) {
		return channel.schedulePostSelectLabel.trim();
	}
	const firstPart = channel.heroTitle.split(',')[0]?.trim().replace(/\s*\n\s*/g, ' ');
	return firstPart || channel.platformLabel;
}
