import { describe, expect, it } from 'vitest';

import { formatHubFilterHeroTitle } from './formatHubFilterHeroTitle';

describe('formatHubFilterHeroTitle', () => {
	it('returns suffix only when no subjects', () => {
		expect(formatHubFilterHeroTitle('Backlink opportunities')).toBe('Backlink opportunities');
	});

	it('joins one subject with suffix', () => {
		expect(formatHubFilterHeroTitle('Backlink opportunities', 'Launch')).toBe(
			'Launch · Backlink opportunities'
		);
	});

	it('joins multiple subjects then suffix', () => {
		expect(
			formatHubFilterHeroTitle('Scheduler Skills & MCP Servers', 'Guides', 'Cursor')
		).toBe('Guides · Cursor · Scheduler Skills & MCP Servers');
	});

	it('trims subject parts and skips empties', () => {
		expect(formatHubFilterHeroTitle('Backlink opportunities', '  Facebook  ', '')).toBe(
			'Facebook · Backlink opportunities'
		);
	});

	it('joins subjects when suffix is empty', () => {
		expect(formatHubFilterHeroTitle('', 'A', 'B')).toBe('A · B');
	});
});
