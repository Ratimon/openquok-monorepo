import { describe, expect, it } from 'vitest';

import {
	buildRedditHandoffAgentSurfaceHeroTitle,
	buildRedditHandoffMcpHeroDescription
} from '$lib/content/utils/buildRedditHandoffSurfaceHeroCopy';

describe('buildRedditHandoffSurfaceHeroCopy', () => {
	it('matches /channels/reddit draft-and-submit messaging with surface label', () => {
		expect(buildRedditHandoffAgentSurfaceHeroTitle('Antigravity CLI')).toBe(
			'Draft in OpenQuok with Antigravity CLI\npost on reddit.com — lower ban risk'
		);
		expect(buildRedditHandoffMcpHeroDescription('Antigravity CLI')).toContain(
			'you submit on reddit.com'
		);
	});
});
