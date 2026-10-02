import type { PublicChannelLandingPageViewModel } from '$lib/content/constants/channels';

/** First comma-separated phrase from channel hero title, else platform label. */
export function publicChannelSelectLabel(channel: PublicChannelLandingPageViewModel): string {
	const firstPart = channel.heroTitle.split(',')[0]?.trim();
	return firstPart || channel.platformLabel;
}
