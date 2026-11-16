import { describe, expect, it } from 'vitest';

import { resolveManifestRouteChangeFreq } from '../../../scripts/sitemapRouteChangeFreq.mjs';

describe('resolveManifestRouteChangeFreq', () => {
	it('marks marketing hubs weekly', () => {
		expect(resolveManifestRouteChangeFreq('/alternatives', 'static')).toBe('weekly');
		expect(resolveManifestRouteChangeFreq('/compare', 'static')).toBe('weekly');
		expect(resolveManifestRouteChangeFreq('/channels/bluesky', 'public-catalog')).toBe('weekly');
	});

	it('keeps long-tail programmatic on monthly', () => {
		expect(resolveManifestRouteChangeFreq('/compare/openquok/buffer', 'programmatic-compare')).toBe(
			'monthly'
		);
		expect(
			resolveManifestRouteChangeFreq('/agents/grok-bot/facebook', 'programmatic-agent-channel')
		).toBe('monthly');
		expect(resolveManifestRouteChangeFreq('/tools/photo-editor/tiktok', 'programmatic-tool-channel')).toBe(
			'monthly'
		);
	});

	it('marks alternatives detail weekly', () => {
		expect(resolveManifestRouteChangeFreq('/alternatives/later', 'programmatic-alternatives')).toBe('weekly');
	});
});