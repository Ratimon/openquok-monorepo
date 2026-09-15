import { describe, expect, it } from 'vitest';

import type { PostKanbanCardViewModel } from '$lib/posts/postKanbanBoard.types';
import { DEFAULT_TAG_CHIP_COLOR } from '$lib/posts/utils/tagChipTheme';

import {
	buildLandingKanbanTagsVm,
	enrichLandingKanbanCards,
	LANDING_KANBAN_MOCK_TAGS
} from './landingKanbanMockTags';

function minimalCard(
	overrides: Partial<PostKanbanCardViewModel> & Pick<PostKanbanCardViewModel, 'postId' | 'tagNames'>
): PostKanbanCardViewModel {
	return {
		postGroup: 'landing-test-group',
		column: 'draft',
		contentPreview: 'Preview text',
		publishLabel: 'Mon, Jan 1',
		publishTimeLabel: '9:00 AM',
		relativePublishLabel: 'in 2 days',
		statusLabel: 'Draft',
		publishDateIso: '2026-01-01T09:00:00.000Z',
		note: null,
		channelSlots: [],
		hiddenChannelCount: 0,
		primaryChannelName: 'Channel',
		isAgentEdited: false,
		isReviewed: false,
		...overrides
	};
}

describe('enrichLandingKanbanCards', () => {
	it('sets a non-default chip color from the landing tag catalog', () => {
		const reelsColor = LANDING_KANBAN_MOCK_TAGS.find((tag) => tag.name === 'reels')?.color;
		expect(reelsColor).toBe('#ef4444');

		const [enriched] = enrichLandingKanbanCards([
			minimalCard({ postId: 'tagged', tagNames: ['reels'] })
		]);

		expect(enriched.chipTagColor).toBe('#ef4444');
		expect(enriched.chipTagColor).not.toBe(DEFAULT_TAG_CHIP_COLOR);
		expect(enriched.chipTagName).toBe('reels');
	});

	it('uses the indigo default for untagged cards', () => {
		const [enriched] = enrichLandingKanbanCards([
			minimalCard({ postId: 'untagged', tagNames: [] })
		]);

		expect(enriched.chipTagColor).toBe(DEFAULT_TAG_CHIP_COLOR);
		expect(enriched.chipTagName).toBeNull();
	});

	it('treats whitespace-only tag names as untagged', () => {
		const [enriched] = enrichLandingKanbanCards([
			minimalCard({ postId: 'blank-tags', tagNames: ['', '  '] })
		]);

		expect(enriched.chipTagColor).toBe(DEFAULT_TAG_CHIP_COLOR);
		expect(enriched.chipTagName).toBeNull();
	});

	it('uses the first non-empty tag for chip color and name', () => {
		const [enriched] = enrichLandingKanbanCards([
			minimalCard({ postId: 'multi', tagNames: ['', 'launch', 'reels'] })
		]);

		expect(enriched.chipTagColor).toBe('#3b82f6');
		expect(enriched.chipTagName).toBe('launch');
	});

	it('preserves other card fields', () => {
		const card = minimalCard({
			postId: 'preserve',
			tagNames: ['product'],
			contentPreview: 'Keep this preview'
		});

		const [enriched] = enrichLandingKanbanCards([card]);

		expect(enriched.postId).toBe('preserve');
		expect(enriched.contentPreview).toBe('Keep this preview');
	});
});

describe('buildLandingKanbanTagsVm', () => {
	it('includes catalog tags and appends unknown card tags with the default color', () => {
		const tagsVm = buildLandingKanbanTagsVm([
			minimalCard({ postId: 'extra', tagNames: ['reels', 'custom-tag'] })
		]);

		expect(tagsVm.length).toBe(LANDING_KANBAN_MOCK_TAGS.length + 1);
		expect(tagsVm.find((tag) => tag.name === 'reels')?.color).toBe('#ef4444');
		expect(tagsVm.find((tag) => tag.name === 'custom-tag')?.color).toBe(DEFAULT_TAG_CHIP_COLOR);
	});
});
