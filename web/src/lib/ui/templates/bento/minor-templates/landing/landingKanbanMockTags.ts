import type { PostTagViewModel } from '$lib/posts/Post.repository.svelte';
import type { PostKanbanCardViewModel } from '$lib/posts/postKanbanBoard.types';
import {
	buildTagColorByName,
	DEFAULT_TAG_CHIP_COLOR,
	resolveFirstTagColor
} from '$lib/posts/utils/tagChipTheme';

/** Distinct hex colors for tags used across landing kanban mock cards. */
const LANDING_KANBAN_TAG_DEFS: ReadonlyArray<{ name: string; color: string }> = [
	{ name: 'reels', color: '#ef4444' },
	{ name: 'launch', color: '#3b82f6' },
	{ name: 'carousel', color: '#a855f7' },
	{ name: 'viral', color: '#f59e0b' },
	{ name: 'b2b', color: '#14b8a6' },
	{ name: 'webdev', color: '#22c55e' },
	{ name: 'product', color: '#ec4899' },
	{ name: 'kol-1', color: '#f97316' },
	{ name: 'walkthrough', color: '#06b6d4' },
	{ name: 'changelog', color: '#64748b' },
	{ name: 'tutorial', color: '#84cc16' },
	{ name: 'weekly', color: '#e11d48' },
	{ name: 'shop-1', color: '#d946ef' }
];

/** Tag catalog for landing kanban filter badges and chip header colors. */
export const LANDING_KANBAN_MOCK_TAGS: PostTagViewModel[] = LANDING_KANBAN_TAG_DEFS.map(
	(tag) => ({
		id: `landing-mock-tag-${tag.name}`,
		name: tag.name,
		color: tag.color
	})
);

const landingTagColorByName = buildTagColorByName(LANDING_KANBAN_MOCK_TAGS);

/** Catalog tags plus any card tag names missing from {@link LANDING_KANBAN_MOCK_TAGS}. */
export function buildLandingKanbanTagsVm(
	cards: readonly PostKanbanCardViewModel[]
): PostTagViewModel[] {
	const known = new Set(
		LANDING_KANBAN_MOCK_TAGS.map((tag) => String(tag.name ?? '').trim().toLowerCase()).filter(Boolean)
	);
	const extras: PostTagViewModel[] = [];

	for (const card of cards) {
		for (const raw of card.tagNames ?? []) {
			const name = String(raw ?? '').trim();
			const key = name.toLowerCase();
			if (!name || known.has(key)) continue;
			known.add(key);
			extras.push({
				id: `landing-mock-tag-${name}`,
				name,
				color: DEFAULT_TAG_CHIP_COLOR
			});
		}
	}

	return extras.length ? [...LANDING_KANBAN_MOCK_TAGS, ...extras] : [...LANDING_KANBAN_MOCK_TAGS];
}

/** Set `chipTagColor` / `chipTagName` on mock kanban cards (same logic as live kanban). */
export function enrichLandingKanbanCards(
	cards: readonly PostKanbanCardViewModel[]
): PostKanbanCardViewModel[] {
	return cards.map((card) => {
		const { color: chipTagColor, name: chipTagName } = resolveFirstTagColor(
			card.tagNames,
			landingTagColorByName
		);
		return {
			...card,
			chipTagColor,
			chipTagName
		};
	});
}
