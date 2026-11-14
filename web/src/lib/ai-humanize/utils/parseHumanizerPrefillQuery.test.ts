import { describe, expect, it } from 'vitest';

import {
	coerceHumanizerPrefillText,
	HUMANIZER_PREFILL_MAX_CHARS,
	HUMANIZER_PREFILL_QUERY_PARAM,
	parseHumanizerPrefillQuery
} from '$lib/ai-humanize/utils/parseHumanizerPrefillQuery';

describe('parseHumanizerPrefillQuery', () => {
	it('reads plain text from the query param', () => {
		const params = new URLSearchParams();
		params.set(HUMANIZER_PREFILL_QUERY_PARAM, '  Hello world  ');
		expect(parseHumanizerPrefillQuery(params)).toBe('Hello world');
	});

	it('returns null when the param is missing or empty', () => {
		expect(parseHumanizerPrefillQuery(new URLSearchParams())).toBeNull();
		expect(
			parseHumanizerPrefillQuery(new URLSearchParams([[HUMANIZER_PREFILL_QUERY_PARAM, '   ']]))
		).toBeNull();
	});

	it('truncates overlong text', () => {
		const long = 'a'.repeat(HUMANIZER_PREFILL_MAX_CHARS + 10);
		expect(coerceHumanizerPrefillText(long)?.length).toBe(HUMANIZER_PREFILL_MAX_CHARS);
	});
});
