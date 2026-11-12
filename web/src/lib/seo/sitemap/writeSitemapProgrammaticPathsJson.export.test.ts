import { describe, expect, it } from 'vitest';

import { writeSitemapProgrammaticPathsJson } from './writeSitemapProgrammaticPathsJson';

describe('writeSitemapProgrammaticPathsJson (build export)', () => {
	it('writes backend/static/sitemap-programmatic-paths.json', () => {
		const counts = writeSitemapProgrammaticPathsJson();
		expect(counts.compare).toBeGreaterThan(0);
		expect(counts.agentChannel).toBeGreaterThan(0);
	});
});
