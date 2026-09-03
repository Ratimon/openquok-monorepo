import { describe, expect, it } from 'vitest';

import { PUBLIC_SELF_HOST_PRICING_FOOTNOTE_CONFIG } from '$lib/content/constants/publicSelfHostPricingFootnoteConfig';
import { publicFaqHref } from '$lib/content/utils/publicFaqLinks';

describe('PUBLIC_SELF_HOST_PRICING_FOOTNOTE_CONFIG', () => {
	it('uses enlarged callout copy for the home pricing footnote', () => {
		expect(PUBLIC_SELF_HOST_PRICING_FOOTNOTE_CONFIG.headline).toBe('Self-host for $0');
		expect(PUBLIC_SELF_HOST_PRICING_FOOTNOTE_CONFIG.body).toContain('no software fee');
		expect(PUBLIC_SELF_HOST_PRICING_FOOTNOTE_CONFIG.body).toContain('servers, Supabase, and bandwidth');
	});

	it('links all three operator paths plus the self-hosting overview', () => {
		const links = PUBLIC_SELF_HOST_PRICING_FOOTNOTE_CONFIG.links;

		expect(links).toHaveLength(4);
		expect(links.map((link) => link.id)).toEqual([
			'hosted-cloud',
			'docker-compose',
			'cloud-production-stack',
			'self-hosting-overview'
		]);

		const hrefById = Object.fromEntries(links.map((link) => [link.id, link.href]));

		expect(hrefById['hosted-cloud']).toBe(publicFaqHref.pricing);
		expect(hrefById['docker-compose']).toBe(publicFaqHref.dockerCompose);
		expect(hrefById['cloud-production-stack']).toBe(publicFaqHref.productionDeployment);
		expect(hrefById['self-hosting-overview']).toBe(publicFaqHref.selfHostingLanding);
	});

	it('labels the third path as cloud production stack', () => {
		const productionLink = PUBLIC_SELF_HOST_PRICING_FOOTNOTE_CONFIG.links.find(
			(link) => link.id === 'cloud-production-stack'
		);

		expect(productionLink?.label).toBe('Cloud production stack');
		expect(productionLink?.href).toBe('/docs/installation/production-deployment');
	});
});
