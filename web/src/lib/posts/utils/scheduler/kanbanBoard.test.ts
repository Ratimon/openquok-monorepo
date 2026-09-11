import { describe, expect, it } from 'vitest';

import {
	matchesKanbanUpcomingTimeFilter,
	resolveTiktokManualFinish,
	stateToKanbanColumn
} from './kanbanBoard';

const NOW_MS = Date.parse('2026-09-11T12:00:00.000Z');
const FUTURE_ISO = '2026-09-15T09:00:00.000Z';
const PAST_ISO = '2026-08-14T09:00:00.000Z';

const TIKTOK_INBOX_MANUAL_FINISH = resolveTiktokManualFinish({
	state: 'PUBLISHED',
	providerIdentifier: 'tiktok',
	settings: JSON.stringify({
		providerSettings: { content_posting_method: 'UPLOAD' }
	})
});

describe('stateToKanbanColumn', () => {
	it('places upcoming manual-finish TikTok posts in scheduled', () => {
		expect(
			stateToKanbanColumn('PUBLISHED', TIKTOK_INBOX_MANUAL_FINISH, FUTURE_ISO, NOW_MS)
		).toBe('scheduled');
	});

	it('places past manual-finish TikTok posts in published', () => {
		expect(
			stateToKanbanColumn('PUBLISHED', TIKTOK_INBOX_MANUAL_FINISH, PAST_ISO, NOW_MS)
		).toBe('published');
	});

	it('places normal published posts in published', () => {
		expect(stateToKanbanColumn('PUBLISHED', null, PAST_ISO, NOW_MS)).toBe('published');
	});
});

describe('matchesKanbanUpcomingTimeFilter', () => {
	it('excludes past publish dates from all-upcoming', () => {
		expect(matchesKanbanUpcomingTimeFilter(PAST_ISO, 'all-upcoming', NOW_MS)).toBe(false);
		expect(matchesKanbanUpcomingTimeFilter(FUTURE_ISO, 'all-upcoming', NOW_MS)).toBe(true);
	});
});
