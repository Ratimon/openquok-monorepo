import { describe, expect, it } from 'vitest';

import {
	canMoveKanbanCard,
	columnToApiStatus,
	kanbanMoveBlockedMessage,
	serializeKanbanCardDrag
} from '$lib/ui/components/posts/kanban/kanbanDnd';

describe('canMoveKanbanCard', () => {
	it('rejects same-column moves', () => {
		expect(canMoveKanbanCard('draft', 'draft')).toBe(false);
		expect(canMoveKanbanCard('scheduled', 'scheduled')).toBe(false);
		expect(canMoveKanbanCard('published', 'published')).toBe(false);
	});

	it('blocks any move from published', () => {
		expect(canMoveKanbanCard('published', 'draft')).toBe(false);
		expect(canMoveKanbanCard('published', 'scheduled')).toBe(false);
	});

	it('allows draft ↔ scheduled for normal posts', () => {
		expect(canMoveKanbanCard('draft', 'scheduled')).toBe(true);
		expect(canMoveKanbanCard('scheduled', 'draft')).toBe(true);
	});

	it('blocks scheduled → draft for manual-finish inbox posts', () => {
		expect(
			canMoveKanbanCard('scheduled', 'draft', { needsManualFinishInApp: true, isReviewed: false })
		).toBe(false);
		expect(
			canMoveKanbanCard('scheduled', 'draft', { needsManualFinishInApp: true, isReviewed: true })
		).toBe(false);
	});

	it('allows draft or scheduled → published for normal posts (publish now)', () => {
		expect(canMoveKanbanCard('draft', 'published')).toBe(true);
		expect(canMoveKanbanCard('scheduled', 'published')).toBe(true);
	});

	it('allows only reviewed manual-finish scheduled → published (ack only)', () => {
		const manualFinish = { needsManualFinishInApp: true, isReviewed: false };
		expect(canMoveKanbanCard('draft', 'published', manualFinish)).toBe(false);
		expect(canMoveKanbanCard('scheduled', 'published', manualFinish)).toBe(false);

		const reviewed = { needsManualFinishInApp: true, isReviewed: true };
		expect(canMoveKanbanCard('draft', 'published', reviewed)).toBe(false);
		expect(canMoveKanbanCard('scheduled', 'published', reviewed)).toBe(true);
	});
});

describe('kanbanMoveBlockedMessage', () => {
	it('explains published cards cannot move', () => {
		expect(kanbanMoveBlockedMessage('published', 'draft')).toBe(
			'Published posts cannot be moved on the board.'
		);
	});

	it('explains manual-finish review requirement for published column', () => {
		expect(
			kanbanMoveBlockedMessage('scheduled', 'published', {
				needsManualFinishInApp: true,
				isReviewed: false
			})
		).toBe('Mark this post as reviewed before moving it to Published.');
	});

	it('falls back to a generic message for other blocked moves', () => {
		expect(kanbanMoveBlockedMessage('draft', 'draft')).toBe('This column change is not allowed.');
		expect(
			kanbanMoveBlockedMessage('scheduled', 'draft', { needsManualFinishInApp: true })
		).toBe('This column change is not allowed.');
	});
});

describe('columnToApiStatus', () => {
	it('maps draft and scheduled columns to API status', () => {
		expect(columnToApiStatus('draft')).toBe('draft');
		expect(columnToApiStatus('scheduled')).toBe('scheduled');
		expect(columnToApiStatus('published')).toBeNull();
	});
});

describe('serializeKanbanCardDrag', () => {
	it('round-trips manual-finish flags', () => {
		const payload = {
			postId: 'post-1',
			postGroup: 'group-1',
			sourceColumn: 'scheduled' as const,
			needsManualFinishInApp: true,
			isReviewed: true
		};
		expect(JSON.parse(serializeKanbanCardDrag(payload))).toEqual(payload);
	});
});
