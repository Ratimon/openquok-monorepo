import { describe, expect, it } from 'vitest';

import { HUMANIZE_UI_COPY } from '$lib/ai-humanize/constants/locales/index';
import {
	browserPreferredLanguages,
	detectHumanizeUiLocale,
	humanizeModeOptionsFor,
	humanizeUiCopyFor,
	prefersThaiLanguage
} from '$lib/ai-humanize/utils/uiLocale';

describe('humanize UI locale', () => {
	it('detects Thai browsers and keeps every other locale on EN labels', () => {
		expect(detectHumanizeUiLocale(['th-TH', 'en-US'])).toBe('th');
		expect(detectHumanizeUiLocale(['th'])).toBe('th');
		expect(detectHumanizeUiLocale(['en-US', 'th'])).toBe('en');
		expect(detectHumanizeUiLocale(['ja-JP'])).toBe('en');
		expect(detectHumanizeUiLocale([])).toBe('en');
	});

	it('matches language tags case-insensitively on the th prefix', () => {
		expect(prefersThaiLanguage(['TH-th'])).toBe(true);
		expect(prefersThaiLanguage(['en', 'shi'])).toBe(false);
	});

	it('returns Thai mode rows with the same mode ids', () => {
		const thRows = humanizeModeOptionsFor('th');
		expect(thRows.map((row) => row.id)).toEqual(['human', 'roughen']);
		expect(thRows[0]!.label).toBe('ให้เป็นธรรมชาติ');
		expect(humanizeModeOptionsFor('en')[0]!.label).toBe('Human');
	});

	it('serves section copy per locale without mutating the shared map', () => {
		expect(humanizeUiCopyFor('th').modeSection).toBe('โหมด');
		expect(humanizeUiCopyFor('en')).toEqual(HUMANIZE_UI_COPY.en);
	});

	it('reads navigator safely and returns an empty list off-browser', () => {
		expect(Array.isArray(browserPreferredLanguages())).toBe(true);
	});
});
