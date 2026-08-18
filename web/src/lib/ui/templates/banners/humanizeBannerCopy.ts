export const HUMANIZE_DOCS_BANNER = {
	docsPath: '/channels',
	title: 'Explore supported channels',
	description:
		'Humanizer rewrites in the browser. Connect a channel in OpenQuok when you are ready to draft, review, and schedule the result.',
	ctaText: 'Browse channels'
} as const;

export function accentSplitHumanizeChannelCtaBannerTitle(label: string): string {
	return `View ${label} channel guide`;
}

export function accentSplitHumanizeChannelCtaBannerDescription(label: string): string {
	return `Learn how OpenQuok schedules ${label} posts — then sign in to queue the rewrite on your connected ${label} channel.`;
}

export function accentSplitHumanizeChannelCtaBannerText(label: string): string {
	return `View ${label} guide`;
}
