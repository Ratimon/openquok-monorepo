import { describe, expect, it } from 'vitest';

import {
	estimateNewProviderMarketingPages,
	getProgrammaticLandingPageCounts,
	PUBLIC_PROGRAMMATIC_LANDING_SURFACES
} from '$lib/content/constants/_dev/programmatic-landing/publicProgrammaticLandingRegistry';

describe('publicProgrammaticLandingRegistry', () => {
	it('lists channel-scaled surfaces referenced in the footer', () => {
		const ids = PUBLIC_PROGRAMMATIC_LANDING_SURFACES.map((s) => s.id);
		expect(ids).toContain('channel-detail');
		expect(ids).toContain('posting-api-platform');
		expect(ids).toContain('humanizer');
		expect(ids).toContain('payload-wizard');
	});

	it('reports stable catalog sizes for planning', () => {
		const counts = getProgrammaticLandingPageCounts();
		// Snapshot-style guard: update when you add agents, MCP clients, or catalog channels.
		expect(counts.totalProgrammaticMarketingPages).toBeGreaterThanOrEqual(200);
		expect(counts.channelCatalogSlugs.length).toBeGreaterThanOrEqual(9);
		expect(counts.apiPostingPlatformSlugs).toContain('bluesky');
		expect(counts.perSurface['channel-detail']).toBe(counts.channelCatalogSlugs.length);
		expect(counts.perSurface['mcp-channel']).toBe(
			counts.mcpClientSlugs.length * counts.channelCatalogSlugs.length
		);
	});

	it('benchmarks bluesky-shaped full marketing routes', () => {
		const est = estimateNewProviderMarketingPages('bluesky');
		expect(est.inChannelCatalog).toBe(true);
		expect(est.inApiPostingPlatforms).toBe(true);
		expect(est.pages.channelLanding).toBe(1);
		expect(est.pages.postingApi).toBe(1);
		expect(est.pages.schedulingApi).toBe(1);
		expect(est.pages.payloadWizard).toBe(1);
		expect(est.pages.mcpClientChannel).toBe(getProgrammaticLandingPageCounts().mcpClientSlugs.length);
		expect(est.totalNewRoutes).toBeGreaterThanOrEqual(20);
	});

	it('benchmarks devto-shaped routes without public API platforms', () => {
		const est = estimateNewProviderMarketingPages('devto');
		expect(est.inChannelCatalog).toBe(true);
		expect(est.inApiPostingPlatforms).toBe(false);
		expect(est.pages.postingApi).toBe(0);
		expect(est.pages.payloadWizard).toBe(0);
		expect(est.pages.agentHostChannel).toBe(4);
	});
});
