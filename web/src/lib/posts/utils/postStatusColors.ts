export type PostStatusSurface = 'draft' | 'scheduled' | 'published' | 'failed' | 'unknown';

const badgeBase = 'px-2 py-0.5 text-[11px] font-semibold';

const primaryNested = {
	ring: 'ring-primary',
	contentMutedBg: 'bg-primary-content/20',
	contentMutedText: 'text-primary-content/90',
	borderMuted: 'border-primary/30'
} as const;

const secondaryNested = {
	ring: 'ring-secondary',
	contentMutedBg: 'bg-secondary-content/20',
	contentMutedText: 'text-secondary-content/90',
	borderMuted: 'border-secondary/30'
} as const;

export function normalizePostStatusSurface(state: string): PostStatusSurface {
	const s = String(state ?? '').trim().toUpperCase();
	if (s === 'DRAFT') return 'draft';
	if (s === 'QUEUE' || s === 'SCHEDULED') return 'scheduled';
	if (s === 'PUBLISHED') return 'published';
	if (s === 'ERROR' || s === 'FAILED') return 'failed';
	return 'unknown';
}

export function postStatusSurfaceClasses(state: string): {
	header: string;
	badge: string;
	label: string;
	ring: string;
	contentMutedBg: string;
	contentMutedText: string;
	borderMuted: string;
} {
	const surface = normalizePostStatusSurface(state);

	if (surface === 'draft') {
		return {
			header: 'bg-secondary text-secondary-content',
			badge: `${badgeBase} bg-secondary text-secondary-content`,
			label: 'Draft',
			...secondaryNested
		};
	}

	if (surface === 'published') {
		return {
			header: 'bg-primary text-primary-content',
			badge: `${badgeBase} bg-success/15 text-success`,
			label: 'Published',
			...primaryNested
		};
	}

	if (surface === 'failed') {
		return {
			header: 'bg-primary text-primary-content',
			badge: `${badgeBase} bg-error/15 text-error`,
			label: 'Failed',
			...primaryNested
		};
	}

	return {
		header: 'bg-primary text-primary-content',
		badge: `${badgeBase} bg-primary text-primary-content`,
		label: surface === 'scheduled' ? 'Scheduled' : '',
		...primaryNested
	};
}
