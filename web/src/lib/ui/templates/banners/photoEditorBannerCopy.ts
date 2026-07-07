export const PHOTO_EDITOR_DOCS_BANNER = {
	docsPath: '/channels',
	title: 'Explore channel image sizes',
	description:
		'Each social network uses different aspect ratios for feed posts, stories, and covers. Browse channel guides to pick the right canvas preset.'
} as const;

export function accentSplitPhotoEditorChannelCtaBannerTitle(label: string): string {
	return `View ${label} channel guide`;
}

export function accentSplitPhotoEditorChannelCtaBannerDescription(label: string): string {
	return `Learn recommended ${label} image sizes for feeds, stories, and covers — then open the ${label} Photo Editor with the right aspect ratio pre-selected.`;
}
