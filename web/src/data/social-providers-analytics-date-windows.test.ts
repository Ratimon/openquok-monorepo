import { describe, expect, it } from 'vitest';

import {
	analyticsDateWindowsForProvider,
	clampAnalyticsDateWindow,
	intersectAnalyticsDateWindows
} from '$data/social-providers';

describe('analyticsDateWindowsForProvider', () => {
	it('allows 90 days for Facebook Page and YouTube', () => {
		expect(analyticsDateWindowsForProvider('facebook')).toEqual([7, 30, 90]);
		expect(analyticsDateWindowsForProvider('youtube')).toEqual([7, 30, 90]);
	});

	it('caps Instagram and Threads at 30 days', () => {
		expect(analyticsDateWindowsForProvider('instagram-business')).toEqual([7, 30]);
		expect(analyticsDateWindowsForProvider('threads')).toEqual([7, 30]);
		expect(analyticsDateWindowsForProvider('tiktok')).toEqual([7, 30]);
	});
});

describe('intersectAnalyticsDateWindows', () => {
	it('returns all windows when no channels are targeted', () => {
		expect(intersectAnalyticsDateWindows([])).toEqual([7, 30, 90]);
	});

	it('intersects across targeted providers', () => {
		expect(intersectAnalyticsDateWindows(['facebook', 'instagram-business'])).toEqual([7, 30]);
		expect(intersectAnalyticsDateWindows(['facebook', 'youtube'])).toEqual([7, 30, 90]);
		expect(intersectAnalyticsDateWindows(['threads', 'tiktok'])).toEqual([7, 30]);
	});
});

describe('clampAnalyticsDateWindow', () => {
	it('keeps the value when allowed', () => {
		expect(clampAnalyticsDateWindow(30, [7, 30])).toBe(30);
	});

	it('steps down to the largest allowed window at or below the selection', () => {
		expect(clampAnalyticsDateWindow(90, [7, 30])).toBe(30);
	});

	it('falls back to the smallest allowed when the selection is below every option', () => {
		expect(clampAnalyticsDateWindow(1, [7, 30])).toBe(7);
	});
});
