import { describe, expect, it } from 'vitest';

import {
	matchesKanbanPastTimeFilter,
	matchesKanbanUpcomingTimeFilter
} from '$lib/posts/utils/scheduler';

import { getFacebookLandingKanbanCards } from '$lib/ui/templates/bento/minor-templates/facebook/facebookLandingKanbanMock';
import { getXLandingKanbanCards } from '$lib/ui/templates/bento/minor-templates/x/xLandingKanbanMock';
import { landingKanbanMockSchedule } from '$lib/ui/templates/bento/minor-templates/landing/landingKanbanMockSchedule';

describe('landingKanbanMockSchedule', () => {
	it('keeps future offsets visible under All Upcoming', () => {
		const { publishDateIso } = landingKanbanMockSchedule('draft', 4, { hour: 9 });
		expect(matchesKanbanUpcomingTimeFilter(publishDateIso, 'all-upcoming')).toBe(true);
		expect(matchesKanbanPastTimeFilter(publishDateIso, 'all-past')).toBe(false);
	});

	it('keeps past offsets visible under All Past', () => {
		const { publishDateIso } = landingKanbanMockSchedule('published', -3, { hour: 16 });
		expect(matchesKanbanPastTimeFilter(publishDateIso, 'all-past')).toBe(true);
		expect(matchesKanbanUpcomingTimeFilter(publishDateIso, 'all-upcoming')).toBe(false);
	});
});

describe('channel landing kanban mocks', () => {
	it('shows X sample cards in draft, scheduled, and published', () => {
		const cards = getXLandingKanbanCards();
		const upcoming = cards.filter((card) =>
			matchesKanbanUpcomingTimeFilter(card.publishDateIso, 'all-upcoming')
		);
		const past = cards.filter((card) =>
			matchesKanbanPastTimeFilter(card.publishDateIso, 'all-past')
		);

		expect(upcoming.filter((card) => card.column === 'draft').length).toBeGreaterThan(0);
		expect(upcoming.filter((card) => card.column === 'scheduled').length).toBeGreaterThan(0);
		expect(past.filter((card) => card.column === 'published').length).toBeGreaterThan(0);
	});

	it('shows Facebook sample cards in draft, scheduled, and published', () => {
		const cards = getFacebookLandingKanbanCards();
		const upcoming = cards.filter((card) =>
			matchesKanbanUpcomingTimeFilter(card.publishDateIso, 'all-upcoming')
		);
		const past = cards.filter((card) =>
			matchesKanbanPastTimeFilter(card.publishDateIso, 'all-past')
		);

		expect(upcoming.filter((card) => card.column === 'draft').length).toBeGreaterThan(0);
		expect(upcoming.filter((card) => card.column === 'scheduled').length).toBeGreaterThan(0);
		expect(past.filter((card) => card.column === 'published').length).toBeGreaterThan(0);
	});
});
