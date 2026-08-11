export const BEST_TIME_TO_POST_DOCS_BANNER = {
	docsPath: '/pricing',
	title: 'Schedule your timing tests in OpenQuok',
	description:
		'Turn benchmark slots into queued posts on your connected channels. Start free, then refine the schedule with workspace analytics.',
	ctaText: 'Get Started For Free'
} as const;

export function accentSplitBestTimeChannelCtaBannerTitle(label: string): string {
	return `Schedule ${label} timing tests`;
}

export function accentSplitBestTimeChannelCtaBannerDescription(label: string): string {
	return `Copy the ${label} timing test plan, then queue the slots on your connected ${label} channel in OpenQuok and measure what actually works.`;
}

export function accentSplitBestTimeChannelCtaBannerText(_label: string): string {
	return 'Get Started For Free';
}
