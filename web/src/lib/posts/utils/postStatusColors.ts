export type PostStatusSurface = 'draft' | 'scheduled' | 'published' | 'failed' | 'unknown';

const badgeBase = 'px-2 py-0.5 text-[11px] font-semibold';

const primaryNested = {
	ring: 'ring-primary',
	contentMutedBg: 'bg-primary-content/20',
	contentMutedText: 'text-primary-content/90',
	borderMuted: 'border-primary/30'
} as const;

export function normalizePostStatusSurface(state: string): PostStatusSurface {
	const s = String(state ?? '').trim().toUpperCase();
	if (s === 'DRAFT') return 'draft';
	if (s === 'QUEUE' || s === 'SCHEDULED') return 'scheduled';
	if (s === 'PUBLISHED') return 'published';
	if (s === 'ERROR' || s === 'FAILED') return 'failed';
	return 'unknown';
}

/** Accent text for list rows, modal meta lines, and calendar-style status labels. */
export function postStatusAccentTextClass(state: string): string {
	const surface = normalizePostStatusSurface(state);
	if (surface === 'draft') return 'text-warning';
	if (surface === 'scheduled') return 'text-primary';
	if (surface === 'published') return 'text-success';
	if (surface === 'failed') return 'text-error';
	return 'text-base-content/70';
}

export function formatListViewRowMeta(
	publishDateIso: string | undefined,
	state: string | undefined,
	timeLabel: string
): string {
	const stateLabel = String(state ?? '').trim().toUpperCase();
	if (timeLabel && stateLabel) return `${timeLabel} · ${stateLabel}`;
	if (timeLabel) return timeLabel;
	if (stateLabel) return stateLabel;
	if (!publishDateIso) return 'Draft';
	return '';
}

export function listViewRowAccentState(
	publishDateIso: string | undefined,
	state: string | undefined
): string {
	const normalized = String(state ?? '').trim();
	if (normalized) return normalized;
	if (!publishDateIso) return 'DRAFT';
	return '';
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
			header: 'bg-warning/15 text-warning',
			badge: `${badgeBase} bg-warning/15 text-warning`,
			label: 'Draft',
			ring: 'ring-warning/30',
			contentMutedBg: 'bg-warning/10',
			contentMutedText: 'text-warning',
			borderMuted: 'border-warning/30'
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
		badge: surface === 'scheduled'
			? `${badgeBase} bg-primary/15 text-primary`
			: `${badgeBase} bg-primary text-primary-content`,
		label: surface === 'scheduled' ? 'Scheduled' : '',
		...primaryNested
	};
}
