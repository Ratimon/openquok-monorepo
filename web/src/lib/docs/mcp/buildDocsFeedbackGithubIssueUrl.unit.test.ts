import { describe, expect, it } from 'vitest';

import { buildDocsFeedbackGithubIssueUrl } from './buildDocsFeedbackGithubIssueUrl';

describe('buildDocsFeedbackGithubIssueUrl', () => {
	it('returns null when repo URL is empty', () => {
		expect(buildDocsFeedbackGithubIssueUrl('', '/docs/foo', 'typo')).toBeNull();
	});

	it('builds issues/new with encoded title and body', () => {
		const url = buildDocsFeedbackGithubIssueUrl(
			'https://github.com/org/repo',
			'/docs/getting-started',
			'Missing step 2'
		);
		expect(url).toMatch(/^https:\/\/github\.com\/org\/repo\/issues\/new\?/);
		expect(url).toContain(encodeURIComponent('Docs feedback: /docs/getting-started'));
		expect(url).toContain(encodeURIComponent('Path: /docs/getting-started'));
		expect(url).toContain(encodeURIComponent('Missing step 2'));
	});

	it('normalizes trailing slash on repo URL', () => {
		const url = buildDocsFeedbackGithubIssueUrl(
			'https://github.com/org/repo/',
			'foo',
			'bar'
		);
		expect(url?.startsWith('https://github.com/org/repo/issues/new?')).toBe(true);
	});
});
