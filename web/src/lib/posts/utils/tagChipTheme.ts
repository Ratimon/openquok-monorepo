import { normalizePostStatusSurface } from '$lib/posts/utils/postStatusColors';

/** Matches {@link TagsComponent} default when a tag has no stored color. */
export const DEFAULT_TAG_CHIP_COLOR = '#6366f1';

const publishedPillBase = 'px-2 py-0.5 text-[11px] font-semibold';

export type TagColorLookup = {
	name: string;
	color?: string;
};

export type FirstTagColorResolution = {
	color: string;
	name: string | null;
};

export type CalendarChipStatusChrome = {
	/** Tailwind ring classes on the chip root (draft dashed outline, failed error ring). */
	chipRing: string;
	/** Tailwind classes for a Published pill on the chip body; empty when not published. */
	publishedPill: string;
};

/** Build a tag-name → color map from workspace tags (composer / calendar lookup). */
export function buildTagColorByName(tags: readonly TagColorLookup[]): Map<string, string> {
	const m = new Map<string, string>();
	for (const t of tags) {
		const name = String(t.name ?? '').trim();
		if (!name) continue;
		const c = String(t.color ?? '').trim();
		m.set(name, c.length ? c : DEFAULT_TAG_CHIP_COLOR);
	}
	return m;
}

/** Compare tag color maps (order-independent). */
export function tagColorMapsEqual(
	a: ReadonlyMap<string, string>,
	b: ReadonlyMap<string, string>
): boolean {
	if (a.size !== b.size) return false;
	for (const [name, color] of a) {
		if (b.get(name) !== color) return false;
	}
	return true;
}

/** Resolve chip color from the first tag name (composer primary tag order). */
export function resolveFirstTagColor(
	tagNames: readonly string[] | undefined | null,
	tagColorByName: ReadonlyMap<string, string>
): FirstTagColorResolution {
	const first = (tagNames ?? [])
		.map((raw) => String(raw ?? '').trim())
		.find((name) => name.length > 0);

	if (!first) {
		return { color: DEFAULT_TAG_CHIP_COLOR, name: null };
	}

	return {
		color: tagColorByName.get(first) ?? DEFAULT_TAG_CHIP_COLOR,
		name: first
	};
}

/** Status chrome for calendar / kanban chips (tag-colored header; status on body / ring). */
export function calendarChipStatusClasses(state: string): CalendarChipStatusChrome {
	const surface = normalizePostStatusSurface(state);

	if (surface === 'draft') {
		return {
			chipRing: 'ring-2 ring-dashed ring-base-content/35',
			publishedPill: ''
		};
	}

	if (surface === 'failed') {
		return {
			chipRing: 'ring-2 ring-error',
			publishedPill: ''
		};
	}

	if (surface === 'published') {
		return {
			chipRing: '',
			publishedPill: `${publishedPillBase} bg-success/15 text-success`
		};
	}

	return {
		chipRing: '',
		publishedPill: ''
	};
}
