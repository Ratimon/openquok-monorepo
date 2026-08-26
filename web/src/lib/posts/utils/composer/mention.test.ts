import { describe, expect, it } from 'vitest';

import {
	COMPOSER_MENTION_MIN_QUERY_LENGTH,
	detectActiveMentionQuery,
	formatIntegrationMentionText,
	providerSupportsComposerMentions,
	replaceActiveMentionWithText
} from '$lib/posts/utils/composer/mention';

describe('providerSupportsComposerMentions', () => {
	it('returns true for X and LinkedIn channel identifiers', () => {
		expect(providerSupportsComposerMentions('x')).toBe(true);
		expect(providerSupportsComposerMentions('linkedin')).toBe(true);
		expect(providerSupportsComposerMentions('linkedin-page')).toBe(true);
	});

	it('returns false for other providers', () => {
		expect(providerSupportsComposerMentions('threads')).toBe(false);
		expect(providerSupportsComposerMentions(null)).toBe(false);
	});
});

describe('detectActiveMentionQuery', () => {
	it('detects a query token ending at the caret', () => {
		expect(detectActiveMentionQuery('Hello @jo', 9)).toEqual({ start: 6, query: 'jo' });
	});

	it('returns null when @ is not preceded by whitespace or start', () => {
		expect(detectActiveMentionQuery('email@domain.com', 16)).toBeNull();
	});

	it('returns null when the query contains whitespace', () => {
		expect(detectActiveMentionQuery('Hi @jo hn', 9)).toBeNull();
	});
});

describe('formatIntegrationMentionText', () => {
	it('formats X mentions as @handle from the label', () => {
		expect(
			formatIntegrationMentionText('x', {
				id: '123',
				label: 'Jane Doe (@janedoe)',
				image: ''
			})
		).toBe('@janedoe');
	});

	it('formats LinkedIn mentions with organization urn syntax', () => {
		expect(
			formatIntegrationMentionText('linkedin', {
				id: '987654',
				label: 'OpenQuok',
				image: ''
			})
		).toBe('@[OpenQuok](urn:li:organization:987654)');
	});
});

describe('replaceActiveMentionWithText', () => {
	it('replaces the active @query with the formatted mention', () => {
		const { nextValue, nextCaret } = replaceActiveMentionWithText(
			'Say hi to @jo',
			10,
			13,
			'@janedoe'
		);

		expect(nextValue).toBe('Say hi to @janedoe');
		expect(nextCaret).toBe(18);
	});

	it('exports a minimum query length of at least two characters', () => {
		expect(COMPOSER_MENTION_MIN_QUERY_LENGTH).toBeGreaterThanOrEqual(2);
	});
});
