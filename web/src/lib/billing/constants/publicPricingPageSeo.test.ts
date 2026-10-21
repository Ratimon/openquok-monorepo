import { describe, expect, it } from 'vitest';

import {
	publicPricingPathForProductLine,
	publicPricingPathForRouteId,
	publicPricingProductLineFromPathname,
	publicPricingRedirectPathForLineQuery,
	publicPricingRouteIdFromPathname
} from '$lib/billing/constants/publicPricingPageSeo';

describe('publicPricingPageSeo routes', () => {
	it('maps product lines to canonical paths', () => {
		expect(publicPricingPathForProductLine('all')).toBe('/pricing');
		expect(publicPricingPathForProductLine('social')).toBe('/pricing/social-scheduler');
		expect(publicPricingPathForProductLine('directory')).toBe('/pricing/directory');
	});

	it('parses pathname to route id and product line', () => {
		expect(publicPricingRouteIdFromPathname('/pricing')).toBe('all');
		expect(publicPricingRouteIdFromPathname('/pricing/social-scheduler')).toBe('social-scheduler');
		expect(publicPricingRouteIdFromPathname('/pricing/directory')).toBe('directory');
		expect(publicPricingRouteIdFromPathname('/pricing/unknown')).toBeNull();

		expect(publicPricingProductLineFromPathname('/pricing/social-scheduler')).toBe('social');
		expect(publicPricingProductLineFromPathname('/pricing/directory')).toBe('directory');
	});

	it('redirects legacy line query values', () => {
		expect(publicPricingRedirectPathForLineQuery('social')).toBe('/pricing/social-scheduler');
		expect(publicPricingRedirectPathForLineQuery('directory')).toBe('/pricing/directory');
		expect(publicPricingRedirectPathForLineQuery('all')).toBeNull();
	});

	it('uses distinct meta titles per route', () => {
		expect(publicPricingPathForRouteId('social-scheduler')).toBe('/pricing/social-scheduler');
		expect(publicPricingPathForRouteId('directory')).toBe('/pricing/directory');
	});
});
