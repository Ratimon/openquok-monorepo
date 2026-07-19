import { describe, expect, it } from 'vitest';

import { readUtmFromSearchParams, stripTrackingSearchParams } from '$lib/product-analytics/utm';

describe('stripTrackingSearchParams', () => {
	it('removes utm, ref, and ad click identifiers', () => {
		const params = new URLSearchParams(
			'utm_source=email&utm_medium=email&utm_campaign=spring&ref=partner&gclid=abc&fbclid=def&msclkid=ghi'
		);

		const cleaned = stripTrackingSearchParams(params);

		expect(cleaned.toString()).toBe('');
	});

	it('keeps functional query params such as hub filters and pagination', () => {
		const params = new URLSearchParams(
			'page=2&sort=popular&search=agent&utm_source=newsletter&type=mcp'
		);

		const cleaned = stripTrackingSearchParams(params);

		expect(cleaned.toString()).toBe('page=2&sort=popular&search=agent&type=mcp');
	});
});

describe('readUtmFromSearchParams', () => {
	it('reads utm_source before utm or ref', () => {
		expect(
			readUtmFromSearchParams(new URLSearchParams('utm_source=newsletter&utm=ignored'))
		).toBe('newsletter');
	});

	it('falls back to ref when utm_source is absent', () => {
		expect(readUtmFromSearchParams(new URLSearchParams('ref=partner'))).toBe('partner');
	});
});
